import { ConfigService } from '@nestjs/config';

import { XRayConfig } from '@common/helpers/xray-config';

import { ConfigTemplatesService } from '@modules/subscription/config-templates.service';

import { UserWithActiveInboundsEntity } from '../../../users/entities/user-with-active-inbounds.entity';
import { HostWithInboundTagEntity } from '../../../hosts/entities/host-with-inbound-tag.entity';

export interface IGenerateSubscription {
    config: XRayConfig;
    configService: ConfigService;
    encodedTag?: string;
    hosts: HostWithInboundTagEntity[];
    isOutlineConfig: boolean;
    user: UserWithActiveInboundsEntity;
    userAgent: string;
    configTemplatesService: ConfigTemplatesService;
}
