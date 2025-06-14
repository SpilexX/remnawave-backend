import { Job } from 'bullmq';

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { CommandBus } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';

import { ICommandResponse } from '@common/types/command-response.type';

import { TruncateNodesUserUsageHistoryCommand } from '@modules/nodes-user-usage-history/commands/truncate-nodes-user-usage-history';
import { VacuumNodesUserUsageHistoryCommand } from '@modules/nodes-user-usage-history/commands/vacuum-nodes-user-usage-history';
import { TruncateUserTrafficHistoryCommand } from '@modules/user-traffic-history/commands/truncate-user-traffic-history';

import { UpdateUsersUsageQueueService } from '@queue/update-users-usage/update-users-usage.service';

import { QueueNames } from '../queue.enum';
import { ServiceJobNames } from './enums';

@Processor(QueueNames.service)
export class ServiceQueueProcessor extends WorkerHost {
    private readonly logger = new Logger(ServiceQueueProcessor.name);

    constructor(
        private readonly commandBus: CommandBus,
        private readonly updateUsersUsageQueueService: UpdateUsersUsageQueueService,
    ) {
        super();
    }

    async process(job: Job) {
        switch (job.name) {
            case ServiceJobNames.CLEAN_OLD_USAGE_RECORDS:
                return this.handleCleanOldUsageRecordsJob();
            default:
                this.logger.warn(`Job "${job.name}" is not handled.`);
                break;
        }
    }

    private async handleCleanOldUsageRecordsJob() {
        try {
            await this.updateUsersUsageQueueService.queue.pause();

            this.logger.log('Resetting tables...');

            await this.truncateUserTrafficHistory();

            await this.truncateNodesUserUsageHistory();

            await this.vacuumTable();

            this.logger.log('Tables resetted');

            // const response = await this.delteOldRecords();

            // if (!response.isOk || !response.response) {
            //     this.logger.error(`Error deleting old usage records: ${response}`);
            //     return {
            //         isOk: false,
            //         error: response,
            //     };
            // }

            // this.logger.log(`Deleted ${response.response.deletedCount} old usage records.`);

            // if (response.response.deletedCount > 0) {
            //     await this.vacuumTable();
            // }

            // return {
            //     isOk: true,
            //     response: {
            //         deletedCount: response.response.deletedCount,
            //     },
            // };
        } catch (error) {
            this.logger.error(
                `Error handling "${ServiceJobNames.CLEAN_OLD_USAGE_RECORDS}" job: ${error}`,
            );
        } finally {
            await this.updateUsersUsageQueueService.queue.resume();
        }
    }

    // private async delteOldRecords(): Promise<ICommandResponse<{ deletedCount: number }>> {
    //     return this.commandBus.execute<
    //         CleanOldUsageRecordsCommand,
    //         ICommandResponse<{ deletedCount: number }>
    //     >(new CleanOldUsageRecordsCommand());
    // }

    private async truncateNodesUserUsageHistory(): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<
            TruncateNodesUserUsageHistoryCommand,
            ICommandResponse<void>
        >(new TruncateNodesUserUsageHistoryCommand());
    }

    private async truncateUserTrafficHistory(): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<TruncateUserTrafficHistoryCommand, ICommandResponse<void>>(
            new TruncateUserTrafficHistoryCommand(),
        );
    }

    private async vacuumTable(): Promise<ICommandResponse<void>> {
        return this.commandBus.execute<VacuumNodesUserUsageHistoryCommand, ICommandResponse<void>>(
            new VacuumNodesUserUsageHistoryCommand(),
        );
    }
}
