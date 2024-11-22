import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { Logger } from '@nestjs/common';
import { ICommandResponse } from '@common/types/command-response.type';
import { ERRORS } from '@contract/constants';
import { UpsertHistoryEntryCommand } from './upsert-history-entry.command';
import { NodesUsageHistoryRepository } from '../../repositories/nodes-usage-history.repository';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(UpsertHistoryEntryCommand)
export class UpsertHistoryEntryHandler
    implements ICommandHandler<UpsertHistoryEntryCommand, ICommandResponse<void>>
{
    public readonly logger = new Logger(UpsertHistoryEntryHandler.name);

    constructor(private readonly nodesUsageHistoryRepository: NodesUsageHistoryRepository) {}

    @Transactional()
    async execute(command: UpsertHistoryEntryCommand): Promise<ICommandResponse<void>> {
        try {
            command.nodeUsageHistory.createdAt.setMinutes(0, 0, 0);
            await this.nodesUsageHistoryRepository.upsertUsageHistory(command.nodeUsageHistory);
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
