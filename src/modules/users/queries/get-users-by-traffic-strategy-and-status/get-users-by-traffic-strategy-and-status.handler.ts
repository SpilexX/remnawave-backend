import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@libs/contracts/constants';

import { UserWithActiveInboundsEntity } from '../../entities/user-with-active-inbounds.entity';
import { UsersRepository } from '../../repositories/users.repository';
import { GetUsersByTrafficStrategyAndStatusQuery } from './get-users-by-traffic-strategy-and-status.query';

@QueryHandler(GetUsersByTrafficStrategyAndStatusQuery)
export class GetUsersByTrafficStrategyAndStatusHandler
    implements
        IQueryHandler<
            GetUsersByTrafficStrategyAndStatusQuery,
            ICommandResponse<UserWithActiveInboundsEntity[]>
        >
{
    private readonly logger = new Logger(GetUsersByTrafficStrategyAndStatusHandler.name);
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(
        query: GetUsersByTrafficStrategyAndStatusQuery,
    ): Promise<ICommandResponse<UserWithActiveInboundsEntity[]>> {
        try {
            const users = await this.usersRepository.getAllUsersByTrafficStrategyAndStatus(
                query.strategy,
                query.status,
            );

            return {
                isOk: true,
                response: users,
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
