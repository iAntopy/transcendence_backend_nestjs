import { IsNotEmpty, IsString } from "class-validator";

export class OAuth42Dto {
    @IsNotEmpty()
    @IsString()
    code: string;

    @IsNotEmpty()
    @IsString()
    state: string;
}