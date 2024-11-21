import { ActiveUserInbounds } from '@prisma/client';

export class ActiveUserInboundEntity implements ActiveUserInbounds {
    uuid: string;
    userUuid: string;
    inboundUuid: string;

    constructor(activeUserInbound: Partial<ActiveUserInbounds>) {
        Object.assign(this, activeUserInbound);
        return this;
    }
}
