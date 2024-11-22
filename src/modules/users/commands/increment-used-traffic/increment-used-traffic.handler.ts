import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Logger } from '@nestjs/common';
import { ICommandResponse } from '@common/types/command-response.type';

import { Transactional } from '@nestjs-cls/transactional';
import { IncrementUsedTrafficCommand } from './increment-used-traffic.command';
import { ERRORS } from '@contract/constants';
import { UsersRepository } from '../../repositories/users.repository';

@CommandHandler(IncrementUsedTrafficCommand)
export class IncrementUsedTrafficHandler
    implements ICommandHandler<IncrementUsedTrafficCommand, ICommandResponse<void>>
{
    public readonly logger = new Logger(IncrementUsedTrafficHandler.name);

    constructor(private readonly usersRepository: UsersRepository) {}

    @Transactional()
    async execute(command: IncrementUsedTrafficCommand): Promise<ICommandResponse<void>> {
        try {
            await this.usersRepository.incrementUsedTraffic(command.userUuid, command.bytes);

            return {
                isOk: true,
            };
        } catch (error: unknown) {
            this.logger.error(`Error: ${JSON.stringify(error)}`);
            return {
                isOk: false,
                ...ERRORS.INCREMENT_USED_TRAFFIC_ERROR,
            };
        }
    }
}
