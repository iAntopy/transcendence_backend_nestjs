import { ForbiddenException, Global, Injectable, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ExtractJwt, JwtFromRequestFunction } from "passport-jwt";
import { JwtPayload } from "jsonwebtoken";

Global()
Injectable()
export class JwtAgent {
    constructor(
        private config: ConfigService,
        private jwt: JwtService,
        ) {
    }
    
    async signToken(userID: number, email: string, is_logged_in: boolean): Promise<{access_token: string}> {
        const payload = {
            sub: userID,
            email,
            is_logged_in
        }
        const token = await this.jwt.signAsync(payload);

        return ({
            access_token: token
        });
    }

    printToken(@Req() request: Request) {
        //const token: string = request.headers['authorization'].replace('Bearer ', '');
        console.log(request);
        const split: string[] = request.headers['Authorization'].split(' ');
        if (!split || split[0] !== 'Bearer' || split.length == 1 || split.length > 2)
            throw new ForbiddenException('Missing auth token or bad formating');
        const token: string = split[1];
        const payload = this.jwt.decode(token);

        console.log(payload);
        //const btoken: JwtFromRequestFunction = ExtractJwt.fromAuthHeaderAsBearerToken();
        //console.log(btoken(request));
    }
}
