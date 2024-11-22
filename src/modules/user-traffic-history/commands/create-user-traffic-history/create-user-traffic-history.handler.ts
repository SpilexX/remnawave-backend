import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Logger } from '@nestjs/common';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@contract/constants';
import { CreateUserTrafficHistoryCommand } from './create-user-traffic-history.command';
import { UserTrafficHistoryRepository } from '../../repositories/user-traffic-history.repository';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(CreateUserTrafficHistoryCommand)
export class CreateUserTrafficHistoryHandler
    implements ICommandHandler<CreateUserTrafficHistoryCommand, ICommandResponse<void>>
{
    public readonly logger = new Logger(CreateUserTrafficHistoryHandler.name);

    constructor(private readonly userTrafficHistoryRepository: UserTrafficHistoryRepository) {}

    @Transactional()
    async execute(command: CreateUserTrafficHistoryCommand): Promise<ICommandResponse<void>> {
        try {
            await this.userTrafficHistoryRepository.create(command.userTrafficHistory);
            return {
                isOk: true,
            };
        } catch (error: unknown) {
            this.logger.error(`Error: ${JSON.stringify(error)}`);
            return {
                isOk: false,
                ...ERRORS.UPDATE_NODE_ERROR,
            };
        }
    }
}
