// import pMap from '@cjs-exporter/p-map';
// import { Job, Queue } from 'bullmq';

// import { JOB_REF, Processor, WorkerHost } from '@nestjs/bullmq';
// import { Inject, Logger, Scope } from '@nestjs/common';
// import { QueryBus } from '@nestjs/cqrs';

// import { IXrayConfig } from '@common/helpers/xray-config/interfaces/core.config';
// import { ICommandResponse } from '@common/types/command-response.type';
// import { AxiosService } from '@common/axios/axios.service';

// import { GetPreparedConfigWithUsersQuery } from '@modules/users/queries/get-prepared-config-with-users/get-prepared-config-with-users.query';
// import { NodesRepository } from '@modules/nodes/repositories/nodes.repository';
// import { NodesEntity } from '@modules/nodes/entities/nodes.entity';

// // @Processor(
// //     {
// //         name: QUEUE_NAMES.START_ALL_NODES,
// //         scope: Scope.REQUEST,
// //     },
// //     {
// //         concurrency: 1,
// //     },
// // )
// export class StartAllNodesProcessor extends WorkerHost {
//     private readonly logger = new Logger(StartAllNodesProcessor.name);
//     private readonly CONCURRENCY: number;
//     private readonly jobRef: Job;

//     constructor(
//         private readonly nodesRepository: NodesRepository,
//         private readonly axios: AxiosService,
//         private readonly queryBus: QueryBus,

//         @Queues.injectStartNodeQueue() private readonly startNodeQueue: Queue,
//     ) {
//         super();
//         this.CONCURRENCY = 20;
//     }

//     async process(job: Job<any, any, string>): Promise<void> {
//         console.log('job', job.data);
//         const startTime = Date.now();

//         await this.startNodeQueue.pause();
//         try {
//             const nodes = await this.nodesRepository.findByCriteria({
//                 isDisabled: false,
//             });

//             // const { response: nodes } = await this.queryBus.execute<
//             //     GetNodesByCriteriaQuery,
//             //     ICommandResponse<NodesEntity[]>
//             // >(
//             //     new GetNodesByCriteriaQuery({
//             //         isDisabled: false,
//             //     }),
//             // );

//             // if (!nodes) {
//             //     this.logger.debug('No nodes found');
//             //     return;
//             // }

//             for (const node of nodes) {
//                 await this.nodesRepository.update({
//                     uuid: node.uuid,
//                     isConnecting: true,
//                 });
//             }

//             const config = await this.getConfigForNode({
//                 excludedInbounds: [],
//                 excludeInboundsFromConfig: false,
//             });

//             this.logger.log(`Config for all nodes fetched within: ${Date.now() - startTime}ms`);

//             if (!config.isOk || !config.response) {
//                 throw new Error('Failed to get config');
//             }

//             const mapper = async (node: NodesEntity) => {
//                 if (!config.response) {
//                     throw new Error('Failed to get config');
//                 }

//                 const excludedNodeInboundsTags = node.excludedInbounds.map(
//                     (inbound) => inbound.tag,
//                 );

//                 const nodeConfig = config.response;

//                 nodeConfig.inbounds = nodeConfig.inbounds.filter(
//                     (inbound) => !excludedNodeInboundsTags.includes(inbound.tag),
//                 );

//                 const response = await this.axios.startXray(
//                     nodeConfig as unknown as Record<string, unknown>,
//                     node.address,
//                     node.port,
//                 );

//                 switch (response.isOk) {
//                     case false:
//                         await this.nodesRepository.update({
//                             uuid: node.uuid,
//                             isXrayRunning: false,
//                             isNodeOnline: false,
//                             lastStatusMessage: response.message ?? null,
//                             lastStatusChange: new Date(),
//                             isConnected: false,
//                             isConnecting: false,
//                             usersOnline: 0,
//                         });

//                         return;
//                     case true:
//                         if (!response.response?.response) {
//                             throw new Error('Failed to start Xray');
//                         }
//                         const nodeResponse = response.response.response;

//                         await this.nodesRepository.update({
//                             uuid: node.uuid,
//                             isXrayRunning: nodeResponse.isStarted,
//                             xrayVersion: nodeResponse.version,
//                             isNodeOnline: true,
//                             isConnected: nodeResponse.isStarted,
//                             lastStatusMessage: nodeResponse.error ?? null,
//                             lastStatusChange: new Date(),
//                             isConnecting: false,
//                             usersOnline: 0,
//                             cpuCount: nodeResponse.systemInformation?.cpuCores ?? null,
//                             cpuModel: nodeResponse.systemInformation?.cpuModel ?? null,
//                             totalRam: nodeResponse.systemInformation?.memoryTotal ?? null,
//                         });

//                         return;
//                 }
//             };

//             await pMap(nodes, mapper, { concurrency: this.CONCURRENCY });

//             this.logger.log(`Started all nodes in ${Date.now() - startTime}ms`);

//             return;
//         } catch (error) {
//             this.logger.error(`Error in Event StartAllNodesHandler: ${error}`);
//         } finally {
//             await this.startNodeQueue.resume();
//         }
//     }

//     private getConfigForNode(
//         dto: GetPreparedConfigWithUsersQuery,
//     ): Promise<ICommandResponse<IXrayConfig>> {
//         return this.queryBus.execute<
//             GetPreparedConfigWithUsersQuery,
//             ICommandResponse<IXrayConfig>
//         >(new GetPreparedConfigWithUsersQuery(dto.excludedInbounds));
//     }
// }
