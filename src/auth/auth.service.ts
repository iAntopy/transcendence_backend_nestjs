import { ForbiddenException, Injectable, Req, Res } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto, OAuth42Dto } from "./dto";
import * as argon from "argon2"
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import axios from "axios";
//import { PrismaModule } from "src/prisma/prisma.module";
//import { User, Bookmark } from "@prisma/client";


@Injectable({})
export class AuthService {
    constructor (
        private prisma: PrismaService,
        private jwt: JwtService,
        private config: ConfigService) {}

    async signup(dto: AuthDto): Promise<User> {
        // hash pw
        const hashpw: Promise<string> = argon.hash(dto.password);

        // push user to db
        try {
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

            const user = await this.prisma.user.create(userCreateData);
            //{
            //     data: {
            //         email: dto.email,
            //         hash: await hashpw,
            //         firstName: dto.firstName,
            //         lastName: dto.lastName
            //     }
            // })
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

    async oauth_confirm(dto: OAuth42Dto) {
        console.log('Return from 42 OAuth');        
        console.log(dto);
    }

    
    async signToken(userID: number, email: string): Promise<{access_token: string}> {
        const payload = {
            sub: userID,
            email,
        }
        const token = await this.jwt.signAsync(payload, {
           expiresIn: '15m',
           secret: this.config.get('JWT_SECRET')
        });

        return ({
            access_token: token
        });
    }
}