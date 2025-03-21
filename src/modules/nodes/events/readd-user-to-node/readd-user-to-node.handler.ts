import {
    CipherType,
    RemoveUserCommand as RemoveUserFromNodeCommandSdk,
} from '@remnawave/node-contract/build/commands';
import { AddUserCommand as AddUserToNodeCommandSdk } from '@remnawave/node-contract/build/commands';
import { IEventHandler } from '@nestjs/cqrs';
import { EventsHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import pMap from '@cjs-exporter/p-map';

import { AxiosService } from '@common/axios';

import { NodesRepository } from '../../repositories/nodes.repository';
import { ReaddUserToNodeEvent } from './readd-user-to-node.event';
import { NodesEntity } from '../../entities/nodes.entity';

@EventsHandler(ReaddUserToNodeEvent)
export class ReaddUserToNodeHandler implements IEventHandler<ReaddUserToNodeEvent> {
    public readonly logger = new Logger(ReaddUserToNodeHandler.name);

    private readonly CONCURRENCY: number;

    constructor(
        private readonly axios: AxiosService,
        private readonly nodesRepository: NodesRepository,
    ) {
        this.CONCURRENCY = 10;
    }
    async handle(event: ReaddUserToNodeEvent) {
        try {
            const userEntity = event.user;

            const nodes = await this.nodesRepository.findConnectedNodes();

            if (nodes.length === 0) {
                this.logger.debug('No connected nodes found');
                return;
            }

            let oldInboundTags: string[] = [];
            if (event.oldInboundTags === undefined) {
                oldInboundTags = event.user.activeUserInbounds.map((inbound) => inbound.tag);
            } else {
                oldInboundTags = event.oldInboundTags;
            }

            /// REMOVING USER FROM NODE

            const removeUserData: RemoveUserFromNodeCommandSdk.Request = {
                username: userEntity.username,
                tags: oldInboundTags,
            };

            const removeMapper = async (node: NodesEntity) => {
                const response = await this.axios.deleteUser(
                    removeUserData,
                    node.address,
                    node.port,
                );
                return response;
            };

            await pMap(nodes, removeMapper, { concurrency: this.CONCURRENCY });

            /// ADDING USER TO NODE

            const userData: AddUserToNodeCommandSdk.Request = {
                data: userEntity.activeUserInbounds.map((inbound) => {
                    const inboundType = inbound.type;

                    switch (inboundType) {
                        case 'trojan':
                            return {
                                type: inboundType,
                                username: userEntity.username,
                                password: userEntity.trojanPassword,
                                level: 0,
                                tag: inbound.tag,
                            };
                        case 'vless':
                            return {
                                type: inboundType,
                                username: userEntity.username,
                                uuid: userEntity.vlessUuid,
                                flow: 'xtls-rprx-vision',
                                level: 0,
                                tag: inbound.tag,
                            };
                        case 'shadowsocks':
                            return {
                                type: inboundType,
                                username: userEntity.username,
                                password: userEntity.ssPassword,
                                level: 0,
                                tag: inbound.tag,
                                cipherType: CipherType.CHACHA20_POLY1305,
                                ivCheck: false,
                            };
                        default:
                            throw new Error(`Unsupported inbound type: ${inboundType}`);
                    }
                }),
            };

            const mapper = async (node: NodesEntity) => {
                const excludedTags = new Set(node.excludedInbounds.map((inbound) => inbound.tag));

                const filteredData = {
                    ...userData,
                    data: userData.data.filter((item) => !excludedTags.has(item.tag)),
                };

                if (filteredData.data.length === 0) {
                    return {
                        nodeName: node.name,
                        response: {
                            isOk: true,
                            message: 'All inbounds are excluded',
                        },
                    };
                }

                const response = await this.axios.addUser(filteredData, node.address, node.port);
                return {
                    nodeName: node.name,
                    response,
                };
            };

            const result = await pMap(nodes, mapper, { concurrency: this.CONCURRENCY });

            const failedResults = result.filter((r) => !r.response.isOk);

            if (failedResults.length > 0) {
                this.logger.warn(
                    `Readd user to Node, failed nodes: ${failedResults
                        .map((r) => `[Node: ${r.nodeName}] ${JSON.stringify(r.response)}`)
                        .join(', ')}`,
                );
            }

            return;
        } catch (error) {
            this.logger.error(`Error in Event ReaddUserToNodeHandler: ${error}`);
        }
    }
}
