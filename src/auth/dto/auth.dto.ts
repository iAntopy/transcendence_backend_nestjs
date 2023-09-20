import { IsEmail, IsNotEmpty, IsOptional, IsString, IsStrongPassword } from "class-validator"

export class AuthDto {
    
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @IsStrongPassword()
    password: string;

    @IsString()
    @IsOptional()
    firstName: string;
    
    @IsString()
    @IsOptional()
    lastName: string;
}