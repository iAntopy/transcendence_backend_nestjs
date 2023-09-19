import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaModule } from "src/prisma/prisma.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStategy } from "./strategy";

@Module({
    imports: [JwtModule.register({
        global: true,
        secret: process.env['JWT_SECRET'],
        signOptions: { expiresIn: '15m' },
      }),],
    controllers: [AuthController],
    providers: [AuthService, JwtStategy]
})
export class AuthModule {}