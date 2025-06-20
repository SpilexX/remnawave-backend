import { InternalSquads } from '@prisma/client';

import { Injectable } from '@nestjs/common';

import { UniversalConverter } from '@common/converter/universalConverter';

import { InternalSquadEntity } from './entities/internal-squad.entity';

const modelToEntity = (model: InternalSquads): InternalSquadEntity => {
    return new InternalSquadEntity(model);
};

const entityToModel = (entity: InternalSquadEntity): InternalSquadEntity => {
    return {
        uuid: entity.uuid,
        name: entity.name,
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
    };
};

@Injectable()
export class InternalSquadConverter extends UniversalConverter<
    InternalSquadEntity,
    InternalSquads
> {
    constructor() {
        super(modelToEntity, entityToModel);
    }
}
