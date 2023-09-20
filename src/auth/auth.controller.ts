import { Controller, Post, Req, Body, Get } from "@nestjs/common";
import { get } from "http";
import { AuthService } from "./auth.service";
import { AuthDto, OAuth42Dto } from "./dto";

@Controller('auth')
export class AuthController {
    constructor (private authService: AuthService) {}

    @Get()
    index() {
        return ('Hello Auth');
    }

    @Post('signin')
    signin(@Body() dto: AuthDto) {
        console.log(dto);
        return (this.authService.signin(dto));
    }
    
    @Post('signup')
    signup(@Body() dto: AuthDto) {
        return (this.authService.signup(dto));
    }

    @Post('42oauth')
    oauth_confirm(@Body() dto: OAuth42Dto) {
        return (this.authService.oauth_confirm(dto));
    }
}