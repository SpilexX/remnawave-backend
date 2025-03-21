import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'node:crypto';
import dayjs from 'dayjs';

import { USER_STATUSES_TEMPLATE } from '@libs/contracts/constants/templates/user-statuses';
import { TemplateEngine } from '@common/utils/templates/replace-templates-values';
import { XRayConfig } from '@common/helpers/xray-config/xray-config.validator';
import { prettyBytesUtil } from '@common/utils/bytes/pretty-bytes.util';
import { USERS_STATUS } from '@libs/contracts/constants';

import { UserWithActiveInboundsEntity } from '../../users/entities/user-with-active-inbounds.entity';
import { HostWithInboundTagEntity } from '../../hosts/entities/host-with-inbound-tag.entity';
import { FormattedHosts } from '../generators/interfaces/formatted-hosts.interface';
export class FormatHosts {
    private config: XRayConfig;
    private hosts: HostWithInboundTagEntity[];
    private user: UserWithActiveInboundsEntity;
    private configService: ConfigService;

    constructor(
        config: XRayConfig,
        hosts: HostWithInboundTagEntity[],
        user: UserWithActiveInboundsEntity,
        configService: ConfigService,
    ) {
        this.config = config;
        this.hosts = hosts;
        this.user = user;
        this.configService = configService;
    }

    private generate(): FormattedHosts[] {
        const formattedHosts: FormattedHosts[] = [];

        let specialRemarks: string[] = [];

        if (this.user.status !== USERS_STATUS.ACTIVE) {
            switch (this.user.status) {
                case USERS_STATUS.EXPIRED:
                    specialRemarks = this.configService.getOrThrow('EXPIRED_USER_REMARKS');
                    break;
                case USERS_STATUS.DISABLED:
                    specialRemarks = this.configService.getOrThrow('DISABLED_USER_REMARKS');
                    break;
                case USERS_STATUS.LIMITED:
                    specialRemarks = this.configService.getOrThrow('LIMITED_USER_REMARKS');
                    break;
            }

            specialRemarks.forEach((remark) => {
                formattedHosts.push({
                    remark,
                    address: '0.0.0.0',
                    port: 0,
                    protocol: 'trojan',
                    path: '',
                    host: '',
                    tls: 'tls',
                    sni: '',
                    alpn: '',
                    pbk: '',
                    fp: '',
                    sid: '',
                    spx: '',
                    ais: false,
                    network: 'tcp',
                    password: {
                        trojanPassword: '00000',
                        vlessPassword: randomUUID(),
                        ssPassword: '00000',
                    },
                });
            });

            return formattedHosts;
        }

        for (const inputHost of this.hosts) {
            const inbound = this.config.getInbound(inputHost.inboundTag.tag);

            if (!inbound) {
                continue;
            }

            const remark = TemplateEngine.replace(inputHost.remark, {
                DAYS_LEFT: dayjs(this.user.expireAt).diff(dayjs(), 'day'),
                TRAFFIC_USED: prettyBytesUtil(this.user.usedTrafficBytes, true, 3),
                TRAFFIC_LEFT: prettyBytesUtil(
                    this.user.trafficLimitBytes - this.user.usedTrafficBytes,
                    true,
                    3,
                ),
                TOTAL_TRAFFIC: prettyBytesUtil(this.user.trafficLimitBytes, true, 3),
                STATUS: USER_STATUSES_TEMPLATE[this.user.status],
            });
            const address = inputHost.address;
            const port = inputHost.port;
            const network = inbound.streamSettings?.network;
            const protocol = inbound.protocol;
            const path =
                inputHost.path ||
                inbound.streamSettings?.wsSettings?.path ||
                inbound.streamSettings?.httpSettings?.path ||
                '';

            const host = inputHost.host || inbound.streamSettings?.httpSettings?.host || '';
            const tls = inbound.streamSettings?.security || '';

            const isDomain = (str: string): boolean => {
                const domainRegex =
                    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
                return domainRegex.test(str);
            };

            let sni =
                inputHost.sni ||
                inbound.streamSettings?.realitySettings?.serverNames?.[0] ||
                inbound.streamSettings?.tlsSettings?.serverName;

            if (!sni) {
                sni = '';
            }

            if (!sni && isDomain(inputHost.address)) {
                sni = inputHost.address;
            }

            const fp =
                inputHost.fingerprint || inbound.streamSettings?.tlsSettings?.fingerprint || '';

            const alpn =
                inputHost.alpn || inbound.streamSettings?.tlsSettings?.alpn?.join(',') || '';

            // Public key
            const pbk = inbound.streamSettings?.realitySettings?.publicKey || '';

            // Short ID
            const shortIds = inbound.streamSettings?.realitySettings?.shortIds || [];
            const sid =
                shortIds.length > 0 ? shortIds[Math.floor(Math.random() * shortIds.length)] : '';

            const spx = inbound.streamSettings?.realitySettings?.spiderX || '';

            const ais = inputHost.allowInsecure ? true : false;

            formattedHosts.push({
                remark,
                address,
                port,
                protocol,
                path,
                host,
                tls,
                sni,
                alpn,
                pbk,
                fp,
                sid,
                spx,
                ais,
                network,
                password: {
                    trojanPassword: this.user.trojanPassword,
                    vlessPassword: this.user.vlessUuid,
                    ssPassword: this.user.ssPassword,
                },
            });
        }

        return formattedHosts;
    }

    public static format(
        config: XRayConfig,
        hosts: HostWithInboundTagEntity[],
        user: UserWithActiveInboundsEntity,
        configService: ConfigService,
    ): FormattedHosts[] {
        try {
            return new FormatHosts(config, hosts, user, configService).generate();
        } catch {
            return [];
        }
    }
}
