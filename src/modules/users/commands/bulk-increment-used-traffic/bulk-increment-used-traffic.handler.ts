import { ERRORS } from '@contract/constants';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Transactional } from '@nestjs-cls/transactional';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';

import { BulkIncrementUsedTrafficCommand } from './bulk-increment-used-traffic.command';
import { UsersRepository } from '../../repositories/users.repository';

@CommandHandler(BulkIncrementUsedTrafficCommand)
export class BulkIncrementUsedTrafficHandler
    implements ICommandHandler<BulkIncrementUsedTrafficCommand, ICommandResponse<number>>
{
    public readonly logger = new Logger(BulkIncrementUsedTrafficHandler.name);

    constructor(private readonly usersRepository: UsersRepository) {}

    @Transactional()
    async execute(command: BulkIncrementUsedTrafficCommand): Promise<ICommandResponse<number>> {
        try {
            const result = await this.usersRepository.bulkIncrementUsedTraffic(
                command.userUsageList,
            );

            return {
                isOk: true,
                response: result,
            };
        } catch (error: unknown) {
            this.logger.error(error);
            return {
                isOk: false,
                ...ERRORS.UPDATE_USER_ERROR,
            };
        }
    }
}
