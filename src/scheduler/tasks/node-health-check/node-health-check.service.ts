import { StartAllNodesQueueService } from 'src/queue/start-all-nodes/start-all-nodes.service';

import { Injectable, Logger } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { Cron } from '@nestjs/schedule';

import { ICommandResponse } from '@common/types/command-response.type';

import { GetEnabledNodesQuery } from '@modules/nodes/queries/get-enabled-nodes';
import { NodesEntity } from '@modules/nodes';

import { NodeHealthCheckQueueService } from '@queue/node-health-check/node-health-check.service';

import { JOBS_INTERVALS } from '../../intervals';

@Injectable()
export class NodeHealthCheckService {
    private static readonly CRON_NAME = 'nodeHealthCheck';
    private readonly logger = new Logger(NodeHealthCheckService.name);
    private cronName: string;

    private isNodesRestarted: boolean;
    constructor(
        private readonly queryBus: QueryBus,
        private readonly startAllNodesQueueService: StartAllNodesQueueService,
        private readonly nodeHealthCheckQueueService: NodeHealthCheckQueueService,
    ) {
        this.cronName = NodeHealthCheckService.CRON_NAME;
        this.isNodesRestarted = false;
    }

    @Cron(JOBS_INTERVALS.NODE_HEALTH_CHECK, {
        name: NodeHealthCheckService.CRON_NAME,
    })
    async handleCron() {
        try {
            if (!this.isNodesRestarted) {
                this.isNodesRestarted = true;
                this.logger.log('Restarting all nodes on application start');

                await this.startAllNodesQueueService.startAllNodes({
                    emitter: this.cronName,
                });

                return;
            }

            const nodesResponse = await this.getEnabledNodes();
            if (!nodesResponse.isOk || !nodesResponse.response) {
                this.logger.error('No enabled nodes found');
                return;
            }

            const nodes = nodesResponse.response;

            await this.nodeHealthCheckQueueService.checkNodeHealthBulk(nodes);

            return;
        } catch (error) {
            this.logger.error(`Error in NodeHealthCheckService: ${error}`);
        }
    }

    private async getEnabledNodes(): Promise<ICommandResponse<NodesEntity[]>> {
        return this.queryBus.execute<GetEnabledNodesQuery, ICommandResponse<NodesEntity[]>>(
            new GetEnabledNodesQuery(),
        );
    }
}
