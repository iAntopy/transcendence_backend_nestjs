import { Controller, Post, Req, Body, Get, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
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

    @UseGuards(AuthGuard('jwt'))
    @Get('doof')
    doofy(@Req() request: Request) {
        return (this.authService.doofassery_test_func(request));
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

    @Get('42oauth_token')
    oauth_request_token(@Query('code') code: string) {
        return (this.authService.oauth_request_token(code));
    }

    @Get('42oauth_confirm')
    oauth_confirm(@Query('token') token: string) {
        return (this.authService.oauth_confirm(token));
    }
}