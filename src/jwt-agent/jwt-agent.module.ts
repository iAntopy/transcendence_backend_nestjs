import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { JwtAgent } from "./jwt-agent.service";

@Module({
    imports: [JwtModule],
    exports: [JwtAgent],
    //providers: [AuthService, JwtStategy]
})
export class JwtAgentModule {}