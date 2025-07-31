import { Prisma } from '@prisma/client';

import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { Injectable } from '@nestjs/common';

import { getKyselyUuid } from '@common/helpers/kysely/get-kysely-uuid';
import { TxKyselyService } from '@common/database';
import { ICrud } from '@common/types/crud-port';

import { NodesEntity } from '../entities/nodes.entity';
import { NodesConverter } from '../nodes.converter';
import { IReorderNode } from '../interfaces';

export type INodesWithResolvedInbounds = Prisma.NodesGetPayload<{
    include: {
        configProfileInboundsToNodes: {
            select: {
                configProfileInbounds: true;
            };
        };
        provider: true;
    };
}>;

const INCLUDE_RESOLVED_INBOUNDS = {
    configProfileInboundsToNodes: {
        select: {
            configProfileInbounds: true,
        },
    },
    provider: true,
} as const;

@Injectable()
export class NodesRepository implements ICrud<NodesEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly qb: TxKyselyService,
        private readonly nodesConverter: NodesConverter,
    ) {}

    public async create(entity: NodesEntity): Promise<NodesEntity> {
        const model = this.nodesConverter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.nodes.create({
            data: model,
            include: INCLUDE_RESOLVED_INBOUNDS,
        });

        return new NodesEntity(result);
    }

    public async findConnectedNodes(): Promise<NodesEntity[]> {
        const nodesList = await this.prisma.tx.nodes.findMany({
            where: {
                isConnected: true,
                isXrayRunning: true,
                isNodeOnline: true,
                isDisabled: false,
                activeConfigProfileUuid: {
                    not: null,
                },
            },
            include: INCLUDE_RESOLVED_INBOUNDS,
        });

        return nodesList.map((value) => new NodesEntity(value));
    }

    public async findConnectedNodesWithoutInbounds(): Promise<
        {
            uuid: string;
            address: string;
            port: number | null;
        }[]
    > {
        return await this.prisma.tx.nodes.findMany({
            select: {
                uuid: true,
                address: true,
                port: true,
            },
            where: {
                isConnected: true,
                isXrayRunning: true,
                isNodeOnline: true,
                isDisabled: false,
                activeConfigProfileUuid: {
                    not: null,
                },
            },
        });
    }

    public async findAllNodes(): Promise<NodesEntity[]> {
        const nodesList = await this.prisma.tx.nodes.findMany({
            include: INCLUDE_RESOLVED_INBOUNDS,
        });

        return nodesList.map((value) => new NodesEntity(value));
    }

    public async incrementUsedTraffic(nodeUuid: string, bytes: bigint): Promise<void> {
        await this.prisma.tx.nodes.update({
            where: { uuid: nodeUuid },
            data: { trafficUsedBytes: { increment: bytes } },
        });
    }

    public async findByUUID(uuid: string): Promise<NodesEntity | null> {
        const result = await this.prisma.tx.nodes.findUnique({
            where: { uuid },
            include: INCLUDE_RESOLVED_INBOUNDS,
        });
        if (!result) {
            return null;
        }
        return new NodesEntity(result);
    }

    public async update({ uuid, ...data }: Partial<NodesEntity>): Promise<NodesEntity> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { provider, activeInbounds, ...prismaData } = data;

        const result = await this.prisma.tx.nodes.update({
            where: { uuid },
            data: prismaData,
            include: INCLUDE_RESOLVED_INBOUNDS,
        });

        return new NodesEntity(result);
    }

    public async findByCriteria(dto: Partial<NodesEntity>): Promise<NodesEntity[]> {
        const nodesList = await this.prisma.tx.nodes.findMany({
            where: dto,
            orderBy: {
                viewPosition: 'asc',
            },
            include: INCLUDE_RESOLVED_INBOUNDS,
        });
        return nodesList.map((value) => new NodesEntity(value));
    }

    public async findFirstByCriteria(dto: Partial<NodesEntity>): Promise<NodesEntity | null> {
        const result = await this.prisma.tx.nodes.findFirst({
            where: dto,
            include: INCLUDE_RESOLVED_INBOUNDS,
        });

        if (!result) {
            return null;
        }

        return new NodesEntity(result);
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.nodes.delete({ where: { uuid } });
        return !!result;
    }

    public async reorderMany(dto: IReorderNode[]): Promise<boolean> {
        await this.prisma.withTransaction(async () => {
            for (const { uuid, viewPosition } of dto) {
                await this.prisma.tx.nodes.updateMany({
                    where: { uuid },
                    data: { viewPosition },
                });
            }
        });

        await this.prisma.tx
            .$executeRaw`SELECT setval('nodes_view_position_seq', (SELECT MAX(view_position) FROM nodes) + 1)`;

        return true;
    }

    public async countOnlineUsers(): Promise<number> {
        const result = await this.prisma.tx.nodes.aggregate({
            where: {
                isConnected: true,
            },
            _sum: {
                usersOnline: true,
            },
        });

        return result._sum.usersOnline || 0;
    }

    public async removeInboundsFromNode(nodeUuid: string): Promise<boolean> {
        const result = await this.qb.kysely
            .deleteFrom('configProfileInboundsToNodes')
            .where('nodeUuid', '=', getKyselyUuid(nodeUuid))
            .executeTakeFirst();

        return !!result;
    }

    public async addInboundsToNode(nodeUuid: string, inboundsUuids: string[]): Promise<boolean> {
        const result = await this.qb.kysely
            .insertInto('configProfileInboundsToNodes')
            .values(
                inboundsUuids.map((uuid) => ({
                    nodeUuid: getKyselyUuid(nodeUuid),
                    configProfileInboundUuid: getKyselyUuid(uuid),
                })),
            )
            .executeTakeFirst();

        return !!result;
    }
}
