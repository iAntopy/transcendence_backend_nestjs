import { ForbiddenException, Injectable, InternalServerErrorException, Req, Res } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto, OAuth42Dto } from "./dto";
import * as argon from "argon2"
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import axios, { AxiosResponse } from "axios";
import { JwtAgent } from "src/jwt-agent/jwt-agent.service";
import { json } from "express";
import * as fs from 'fs';
//import { PrismaModule } from "src/prisma/prisma.module";
//import { User, Bookmark } from "@prisma/client";


@Injectable({})
export class AuthService {
    constructor (
        private prisma: PrismaService,
        //private jwt: JwtService,
        private jwt: JwtAgent,
        private config: ConfigService) {}

    doofassery_test_func(@Req() request:Request) {
        this.jwt.printToken(request);
    }


    async oauth_request_authorization(code: string) {
        const url: string = process.env['42OAUTH_URL'];

        //this.prisma.setUserAuthenticatingStatus()
        const res: Response = await axios.get(url);
        return ('oauth_request_authorization exit');
    }

    async oauth_request_token(code: string) {
        if (!code) {
            return ('Client refused to authorize API access.');
        }
        console.log('Return from 42 OAuth with code: ');        
        console.log(code);

        console.log('Request token from 42API using received code');

        //const clienid: string = 'u-s4t2ud-060054ee82cdef75be259160866ffaa26f98cef72e59311abfcb9bc609175caf';//process.env['42OAUTH_UID'];
        const clienid: string = process.env['42OAUTH_UID'];
        //const secret: string = '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';//process.env['42OAUTH_SECRET'];
        const secret: string = process.env['42OAUTH_SECRET'];
        //const redirect: string = 'http://10.13.3.3:3000/auth/42oauth_token';////process.env['42OAUTH_URL'];
        const redirect: string = process.env['42OAUTH_URL'];

        const token_endpoint: string = this.config.get('42OAUTH_TOKEN_ENDPOINT');
        const query_string: string = `?grant_type=authorization_code&client_id=${clienid}&client_secret=${secret}&code=${code}&redirect_uri=${redirect}`;
        const token_url: string = token_endpoint + query_string ;

        console.log(token_url);

        let auth_token: string;
        let refr_token: string;
        let body: string;
        let body_parsed: any;
        let image_link: string;
        
        // axios
        //     .post(token_url)
        //     .then(function (response: AxiosResponse) {
        //         console.log('SUCCESS!!');
        //         //console.log(response);
        //         auth_token = response.data['access_token'];
        //         refr_token = response.data['refresh_token'];
        //         console.log(auth_token);
        //         console.log(refr_token);
        //     })
        //     .catch(function (error: AxiosResponse) {
        //         console.log('ERROROROROROROROROROOTTTRRRR!!');
        //         throw new InternalServerErrorException('Auth token request failed');
        //     });

        auth_token = '5e09937e12d304d2c05e2c3e2fa8be69c6c6c823df3c88eef9a68828d6732d0f';
        axios
            .get('https://api.intra.42.fr/v2/me', {
                headers: {
                    Authorization: 'Bearer ' + auth_token
                }
            })
            .then(function (response: AxiosResponse) {
                console.log('WHOAMI SUCCESS!!');
                body = response.data;
                try {
                    console.log(body['displayname']);
                    console.log(body['login']);
                    console.log(body['email']);
                    console.log(body['image']['link']);
                    image_link = body['image']['link'];
                    console.log(image_link);

                    //fs.writeFileSync('./whoami.wtf', body);
                } catch (e) {
                    console.log(e);
                }
                //console.log(body);
                //console.log(JSON.parse(body));
                console.log('PARSED');
                // console.log(body_parsed);//['displayname']);
                // console.log(body_parsed['login']);
                // console.log(body_parsed['email']);
                // console.log(body_parsed['image']['link']);
            })
            .catch(function (error: AxiosResponse) {
                console.log('WHOAMI FAILURE...');
                throw new InternalServerErrorException('Auth token request failed');
            });

        //return ('Just Chillin');
        //return (`<img src="${image_link}" alt="Italian Trulli">`);
        return (image_link);

        // const res: Response = await axios.post('https://api.intra.42.fr/oauth/token', {
        //     params: {
        //         grant_type: 'authorization_code',
        //         client_id: process.env['42OAUTH_UID'],
        //         client_secret: process.env['42OAUTH_SECRET'],
        //         code: code
        //     }
        // });
        // const res: Response = await axios.post('https://api.intra.42.fr/oauth/token', query_string, 
        //     {
        //         headers: {
        //         Accept: "application/json",
        //         },
        //     });
    }

    async oauth_confirm(token: string) {
        if (!token) {
            return ('Client authorization failed.');
        }
        return ('oauth_confirm() reached and returned token : ' + token);
    }
    

    async signup(dto: AuthDto): Promise<User> {
        // hash pw
        const hashpw: Promise<string> = argon.hash(dto.password);
        
        const userCreateData: any = {
            data: {
                username: dto.username,
                email: dto.email,
                hash: await hashpw,
                firstName: dto.firstName,
                lastName: dto.lastName
            }
        };
        console.log(process.env['DATABASE_URL']);
        console.log(userCreateData);


        /// Get 42API Authorization START
        
        /// Get 42API Authorization END


        // push user to db
        try {

            const user = await this.prisma.user.create(userCreateData);
            delete user.hash;
            // return something
            return (user);
            //return ({msg: 'sign me in baby !'});
        } catch (error) {
            if (error instanceof PrismaClientKnownRequestError
                && error.code == 'P2002') {
                throw new ForbiddenException('Credientials already taken')
            }
            throw error
        }
    }

    async signin(dto: AuthDto, @Res() response?: Response) {

        const user: User = await this.prisma.user.findUnique({
            where: {
                email: dto.email
                //username: dto.username
            }
        })
        if (!user) {
            throw new ForbiddenException('Credantials incorrect')
        }
        if (!(await argon.verify(user.hash, dto.password))) {
            throw new ForbiddenException('Credantials incorrect');
        }
        delete user.hash;

        //const res: any axios('')
        return ({url: process.env['42OAUTH_URL']});

        //return (this.signToken(user.id, user.email));
        //return (user);
        //return ('sign me up baby !');
    }

    

    
    
}