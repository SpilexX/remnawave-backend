import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';

import { UserEntity } from '@modules/users/entities';

import { GetUserByUniqueFieldQuery } from './get-user-by-unique-field.query';
import { UsersRepository } from '../../repositories/users.repository';

@QueryHandler(GetUserByUniqueFieldQuery)
export class GetUserByUniqueFieldHandler
    implements IQueryHandler<GetUserByUniqueFieldQuery, ICommandResponse<UserEntity>>
{
    private readonly logger = new Logger(GetUserByUniqueFieldHandler.name);
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(query: GetUserByUniqueFieldQuery): Promise<ICommandResponse<UserEntity>> {
        try {
            const user = await this.usersRepository.findUniqueByCriteria(
                {
                    username: query.field.username || undefined,
                    shortUuid: query.field.shortUuid || undefined,
                    uuid: query.field.uuid || undefined,
                },
                query.includeOptions,
            );

            if (!user) {
                return {
                    isOk: false,
                    ...ERRORS.USER_NOT_FOUND,
                };
            }

            return {
                isOk: true,
                response: user,
            };
        } catch (error) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.INTERNAL_SERVER_ERROR,
            };
        }
    }
}
