import { TResetPeriods, TUsersStatus } from '@libs/contracts/constants';

import { UserWithActiveInboundsEntity } from '../entities/user-with-active-inbounds.entity';
import { InboundsEntity } from '../../inbounds/entities/inbounds.entity';

export class GetUserResponseModel {
    public readonly uuid: string;
    public readonly username: string;
    public readonly shortUuid: string;
    public readonly status: TUsersStatus;
    public readonly expireAt: Date;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;
    public readonly subscriptionUuid: string;
    public readonly usedTrafficBytes: number;
    public readonly lifetimeUsedTrafficBytes: number;
    public readonly trafficLimitBytes: number;
    public readonly trafficLimitStrategy: TResetPeriods;
    public readonly subLastUserAgent: null | string;
    public readonly subLastOpenedAt: Date | null;
    public readonly onlineAt: Date | null;
    public readonly subRevokedAt: Date | null;
    public readonly lastTrafficResetAt: Date | null;
    public readonly trojanPassword: string;
    public readonly vlessUuid: string;
    public readonly ssPassword: string;
    public readonly activeUserInbounds: InboundsEntity[];
    public readonly subscriptionUrl: string;

    constructor(entity: UserWithActiveInboundsEntity) {
        this.uuid = entity.uuid;
        this.username = entity.username;
        this.shortUuid = entity.shortUuid;
        this.status = entity.status;
        this.expireAt = entity.expireAt;
        this.createdAt = entity.createdAt;
        this.updatedAt = entity.updatedAt;
        this.subscriptionUuid = entity.subscriptionUuid;
        this.usedTrafficBytes = Number(entity.usedTrafficBytes);
        this.lifetimeUsedTrafficBytes = Number(entity.lifetimeUsedTrafficBytes);
        this.trafficLimitBytes = Number(entity.trafficLimitBytes);
        this.trafficLimitStrategy = entity.trafficLimitStrategy;
        this.subLastUserAgent = entity.subLastUserAgent;
        this.subLastOpenedAt = entity.subLastOpenedAt;
        this.onlineAt = entity.onlineAt;
        this.subRevokedAt = entity.subRevokedAt;
        this.lastTrafficResetAt = entity.lastTrafficResetAt;
        this.activeUserInbounds = entity.activeUserInbounds;
        this.trojanPassword = entity.trojanPassword;
        this.vlessUuid = entity.vlessUuid;
        this.ssPassword = entity.ssPassword;
        this.subscriptionUrl = `https://${process.env.SUB_PUBLIC_DOMAIN}/${entity.shortUuid}`; // TODO: find a better way to get the subscription url
    }
}
