import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient, User } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor (config: ConfigService) {
        console.log(config.get('DATABASE_URL'));
        super({
            datasources: {
                db: {
                    url: config.get('DATABASE_URL')
                }
            }
        })
    }

    async getUserEntry(userID: number, with_hash_pw: boolean = false): Promise<User> | null {
        let user: User = await this.user.findUnique({
            where: {
                id: userID
            }
        })
        if (!user)
            return (null);
        if (!with_hash_pw)
            delete user.hash;
        return (user);
    }

    async getUserEntryStrict(userID: number, with_hash_pw: boolean = false): Promise<User> | null {
        const user: User = await this.getUserEntry(userID);
        if (!user)
            throw new InternalServerErrorException('No user exist with given userID.');
        return (user);
    }

    // Check that the user went through the authentication process and is logged in. With corresponding setter.
    async checkIsUserAuthenticated(userID: number): Promise<boolean> {
        const user: User = await this.getUserEntryStrict(userID);
        return (user.isAuthenticated);
    }
    async setUserAuthenticatedStatus(userID: number, status: boolean) {
        let user: User = await this.getUserEntryStrict(userID);
        user.isAuthenticated = status;
    }

    // Check that the user is in the process of authentication.
    // Follows the client through all api request related to 42API authentication.
    // Is set back to false on failure or on successful token aquisition.
    // With corresponding setter.
    async checkIsUserAuthenticating(userID: number): Promise<boolean> {
        const user: User = await this.getUserEntryStrict(userID);
        return (user.isAuthenticating);
    }
    async setUserAuthenticatingStatus(userID: number, status: boolean) {
        let user: User = await this.getUserEntryStrict(userID);
        user.isAuthenticating = status;
    }
}
