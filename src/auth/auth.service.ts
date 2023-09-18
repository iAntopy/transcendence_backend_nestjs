import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AuthDto } from "./dto";
import * as argon from "argon2"
import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
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
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    hash: await hashpw,
                    firstName: dto.firstName,
                    lastName: dto.lastName
                }
            })
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

    async signin(dto: AuthDto) {

        const user: User = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })
        if (!user) {
            throw new ForbiddenException('Credantials incorrect')
        }
        if (!(await argon.verify(user.hash, dto.password))) {
            throw new ForbiddenException('Credantials incorrect');
        }
        delete user.hash;
        return (this.signToken(user.id, user.email));
        //return (user);
        //return ('sign me up baby !');
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