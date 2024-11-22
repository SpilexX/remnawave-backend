import { Injectable } from '@nestjs/common';
import { UniversalConverter } from '@common/converter/universalConverter';
import { UserTrafficHistory } from '@prisma/client';
import { UserTrafficHistoryEntity } from './entities/user-traffic-history.entity';

const modelToEntity = (model: UserTrafficHistory): UserTrafficHistoryEntity => {
    return new UserTrafficHistoryEntity(model);
};

const entityToModel = (entity: UserTrafficHistoryEntity): UserTrafficHistory => {
    return {
        uuid: entity.uuid,
        userUuid: entity.userUuid,
        usedBytes: entity.usedBytes,
        resetAt: entity.resetAt,
    };
};

@Injectable()
export class UserTrafficHistoryConverter extends UniversalConverter<
    UserTrafficHistoryEntity,
    UserTrafficHistory
> {
    constructor() {
        super(modelToEntity, entityToModel);
    }
}
