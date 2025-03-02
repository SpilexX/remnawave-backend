import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHmac } from 'node:crypto';
import * as bcrypt from 'bcrypt';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants/errors';
import { ROLE } from '@libs/contracts/constants';

import { ILogin, IRegister } from './interfaces';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CountAdminsByRoleQuery } from '@modules/admin/queries/count-admins-by-role';
import { GetStatusResponseModel } from './model/get-status.response.model';
import { CreateAdminCommand } from '@modules/admin/commands/create-admin';
import { GetAdminByUsernameQuery } from '@modules/admin/queries/get-admin-by-username';
import { AdminEntity } from '@modules/admin/entities/admin.entity';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly jwtSecret: string;
    private readonly saltRounds: number;

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly queryBus: QueryBus,
        private readonly commandBus: CommandBus,
    ) {
        this.jwtSecret = this.configService.getOrThrow<string>('JWT_AUTH_SECRET');
        this.saltRounds = 10;
    }

    public async login(dto: ILogin): Promise<
        ICommandResponse<{
            accessToken: string;
        }>
    > {
        try {
            const { username, password } = dto;

            const statusResponse = await this.getStatus();

            if (!statusResponse.isOk || !statusResponse.response) {
                return {
                    isOk: false,
                    ...ERRORS.GET_AUTH_STATUS_ERROR,
                };
            }

            if (!statusResponse.response.isLoginAllowed) {
                return {
                    isOk: false,
                    ...ERRORS.FORBIDDEN,
                };
            }

            const admin = await this.getAdminByUsername({
                username,
                role: ROLE.ADMIN,
            });

            if (!admin.isOk || !admin.response) {
                return {
                    isOk: false,
                    ...ERRORS.FORBIDDEN,
                };
            }

            const isPasswordValid = await this.verifyPassword(
                password,
                admin.response.passwordHash,
            );

            if (!isPasswordValid) {
                return {
                    isOk: false,
                    ...ERRORS.FORBIDDEN,
                };
            }

            const accessToken = this.jwtService.sign(
                {
                    username,
                    uuid: admin.response.uuid,
                    role: ROLE.ADMIN,
                },
                { expiresIn: '12h' },
            );

            return {
                isOk: true,
                response: { accessToken },
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.LOGIN_ERROR,
            };
        }
    }

    public async register(dto: IRegister): Promise<
        ICommandResponse<{
            accessToken: string;
        }>
    > {
        try {
            const { username, password } = dto;

            console.log(username, password);

            const statusResponse = await this.getStatus();

            console.log(statusResponse);

            if (!statusResponse.isOk || !statusResponse.response) {
                return {
                    isOk: false,
                    ...ERRORS.GET_AUTH_STATUS_ERROR,
                };
            }

            if (!statusResponse.response.isRegisterAllowed) {
                return {
                    isOk: false,
                    ...ERRORS.GET_AUTH_STATUS_ERROR,
                };
            }

            const admin = await this.getAdminByUsername({
                username,
                role: ROLE.ADMIN,
            });

            console.log(admin);

            if (admin.isOk && admin.response) {
                return {
                    isOk: false,
                    ...ERRORS.FORBIDDEN,
                };
            }

            const hashedPassword = await this.hashPassword(password);

            const createAdminResponse = await this.createAdmin({
                username,
                password: hashedPassword,
                role: ROLE.ADMIN,
            });

            if (!createAdminResponse.isOk || !createAdminResponse.response) {
                return {
                    isOk: false,
                    ...ERRORS.CREATE_ADMIN_ERROR,
                };
            }

            const accessToken = this.jwtService.sign(
                {
                    username,
                    uuid: createAdminResponse.response.uuid,
                    role: ROLE.ADMIN,
                },
                { expiresIn: '12h' },
            );

            return {
                isOk: true,
                response: { accessToken },
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.LOGIN_ERROR,
            };
        }
    }

    public async getStatus(): Promise<ICommandResponse<GetStatusResponseModel>> {
        try {
            const adminCount = await this.getAdminCount();

            if (!adminCount.isOk) {
                return {
                    isOk: false,
                    ...ERRORS.GET_AUTH_STATUS_ERROR,
                };
            }

            if (adminCount.response === undefined) {
                return {
                    isOk: false,
                    ...ERRORS.GET_AUTH_STATUS_ERROR,
                };
            }

            if (adminCount.response === 0) {
                return {
                    isOk: true,
                    response: new GetStatusResponseModel({
                        isLoginAllowed: false,
                        isRegisterAllowed: true,
                    }),
                };
            }

            return {
                isOk: true,
                response: new GetStatusResponseModel({
                    isLoginAllowed: true,
                    isRegisterAllowed: false,
                }),
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.GET_AUTH_STATUS_ERROR,
            };
        }
    }

    private async getAdminCount(): Promise<ICommandResponse<number>> {
        return this.queryBus.execute<CountAdminsByRoleQuery, ICommandResponse<number>>(
            new CountAdminsByRoleQuery(ROLE.ADMIN),
        );
    }

    private async getAdminByUsername(
        dto: GetAdminByUsernameQuery,
    ): Promise<ICommandResponse<AdminEntity>> {
        return this.queryBus.execute<GetAdminByUsernameQuery, ICommandResponse<AdminEntity>>(
            new GetAdminByUsernameQuery(dto.username, dto.role),
        );
    }

    private applySecretHmac(password: string, secret: string): Buffer {
        const hmac = createHmac('sha256', secret);
        hmac.update(password);
        return hmac.digest();
    }

    private async hashPassword(plainPassword: string): Promise<string> {
        const hmacResult = this.applySecretHmac(plainPassword, this.jwtSecret);

        return bcrypt.hash(hmacResult.toString('hex'), this.saltRounds);
    }

    private async verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
        const hmacResult = this.applySecretHmac(plainPassword, this.jwtSecret);

        return bcrypt.compare(hmacResult.toString('hex'), storedHash);
    }

    private async createAdmin(dto: CreateAdminCommand): Promise<ICommandResponse<AdminEntity>> {
        return this.commandBus.execute<CreateAdminCommand, ICommandResponse<AdminEntity>>(
            new CreateAdminCommand(dto.username, dto.password, dto.role),
        );
    }
}
