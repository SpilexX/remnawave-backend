import { Injectable } from '@nestjs/common';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { TransactionHost } from '@nestjs-cls/transactional';
import { ICrud } from '@common/types/crud-port';
import { ActiveUserInboundEntity } from '../entities/active-user-inbound.entity';
import { ActiveUserInboundsConverter } from '../converters/active-user-inbounds.converter';

@Injectable()
export class ActiveUserInboundsRepository implements ICrud<ActiveUserInboundEntity> {
    constructor(
        private readonly prisma: TransactionHost<TransactionalAdapterPrisma>,
        private readonly activeUserInboundsConverter: ActiveUserInboundsConverter,
    ) {}

    public async findAll(): Promise<ActiveUserInboundEntity[]> {
        const activeUserInbounds = await this.prisma.tx.activeUserInbounds.findMany();
        return this.activeUserInboundsConverter.fromPrismaModelsToEntities(activeUserInbounds);
    }

    public async deleteMany(userUuids: string[]): Promise<number> {
        const result = await this.prisma.tx.activeUserInbounds.deleteMany({
            where: {
                userUuid: {
                    in: userUuids,
                },
            },
        });
        return result.count;
    }

    public async createMany(userUuid: string, inboundUuids: string[]): Promise<number> {
        const result = await this.prisma.tx.activeUserInbounds.createMany({
            data: inboundUuids.map((inboundUuid) => ({ userUuid, inboundUuid })),
        });
        return result.count;
    }

    public async getActiveInboundsTags(userUuid: string): Promise<string[]> {
        const result = await this.prisma.tx.activeUserInbounds.findMany({
            where: { userUuid },
            include: {
                inbound: true,
            },
        });
        return result.map((item) => item.inbound.tag);
    }

    public async create(entity: ActiveUserInboundEntity): Promise<ActiveUserInboundEntity> {
        const model = this.activeUserInboundsConverter.fromEntityToPrismaModel(entity);
        const result = await this.prisma.tx.activeUserInbounds.create({
            data: {
                ...model,
            },
        });

        return this.activeUserInboundsConverter.fromPrismaModelToEntity(result);
    }

    public async findByUUID(uuid: string): Promise<ActiveUserInboundEntity | null> {
        const result = await this.prisma.tx.activeUserInbounds.findUnique({
            where: { uuid },
        });
        if (!result) {
            return null;
        }
        return this.activeUserInboundsConverter.fromPrismaModelToEntity(result);
    }

    public async update({
        uuid,
        ...data
    }: Partial<ActiveUserInboundEntity>): Promise<ActiveUserInboundEntity> {
        const model = this.activeUserInboundsConverter.fromEntityToPrismaModel({
            uuid,
            ...data,
        } as ActiveUserInboundEntity);
        const result = await this.prisma.tx.activeUserInbounds.update({
            where: { uuid },
            data: {
                ...model,
            },
        });

        return this.activeUserInboundsConverter.fromPrismaModelToEntity(result);
    }

    public async findByCriteria(
        dto: Partial<ActiveUserInboundEntity>,
    ): Promise<ActiveUserInboundEntity[]> {
        const model = this.activeUserInboundsConverter.fromEntityToPrismaModel(
            dto as ActiveUserInboundEntity,
        );
        const list = await this.prisma.tx.activeUserInbounds.findMany({
            where: {
                ...model,
            },
        });
        return this.activeUserInboundsConverter.fromPrismaModelsToEntities(list);
    }

    public async findFirst(): Promise<ActiveUserInboundEntity | null> {
        const result = await this.prisma.tx.activeUserInbounds.findFirst();
        if (!result) {
            return null;
        }
        return this.activeUserInboundsConverter.fromPrismaModelToEntity(result);
    }

    public async deleteByUUID(uuid: string): Promise<boolean> {
        const result = await this.prisma.tx.activeUserInbounds.delete({ where: { uuid } });
        return !!result;
    }
}
