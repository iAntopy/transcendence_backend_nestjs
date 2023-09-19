import { Controller, ForbiddenException, Get, InternalServerErrorException, Req, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { User } from "@prisma/client";
import { PrismaService } from "src/prisma/prisma.service";

@Controller('users')
export class UserController {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

    @UseGuards(AuthGuard('jwt'))
    @Get('main')
    async userGet(@Req() request: Request, config: ConfigService): Promise<string> {
        const token: string = request.headers['authorization'].replace('Bearer ', '');
        const decodedToken: any = this.jwtService.decode(token);

        console.log(request.headers);
        console.log(token);
        console.log(process.env['JWT_SECRET']);
        console.log(decodedToken.sub);

        const user: User = await this.prisma.user.findUnique({
            where: {
                id: decodedToken.sub
            }
        });
        if (!user)
            throw new ForbiddenException('Credantials incorrect');
        console.log(user);
        delete user.hash;
        return ('Wowow ! This is main user page.');
    }
}

