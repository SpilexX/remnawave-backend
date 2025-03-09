import { Injectable, Logger } from '@nestjs/common';

import { SubscriptionTemplateService } from '../subscription-template.service';
import { IFormattedHost } from './interfaces/formatted-hosts.interface';

interface StreamSettings {
    network: string;
    security?: string;
    wsSettings?: unknown;
    tcpSettings?: unknown;
    rawSettings?: unknown;
    xhttpSettings?: unknown;
    tlsSettings?: unknown;
    realitySettings?: unknown;
    sockopt?: unknown;
}

interface OutboundSettings {
    vnext?: Array<{
        address: string;
        port: number;
        users: Array<{
            id: string;
            security?: string;
            encryption?: string;
            flow?: string | undefined;

            alterId?: number;
            email?: string;
        }>;
    }>;
    servers?: Array<{
        address: string;
        port: number;
        password?: string;
        email?: string;
        method?: string;
        uot?: boolean;
        ivCheck?: boolean;
    }>;
}

interface Outbound {
    tag: string;
    protocol: string;
    settings: OutboundSettings;
    streamSettings?: StreamSettings;
    mux?: unknown;
}

interface XrayJsonConfig {
    remarks: string;
    outbounds: Outbound[];
}

@Injectable()
export class XrayJsonGeneratorService {
    private readonly logger = new Logger(XrayJsonGeneratorService.name);

    constructor(private readonly subscriptionTemplateService: SubscriptionTemplateService) {}

    public async generateConfig(hosts: IFormattedHost[]): Promise<string> {
        try {
            const templateContent = (await this.subscriptionTemplateService.getJsonTemplateByType(
                'XRAY_JSON',
            )) as XrayJsonConfig;

            const templatedOutbounds: XrayJsonConfig[] = [];

            for (const host of hosts) {
                if (!host) {
                    continue;
                }

                const templatedOutbound = this.createConfigForHost(host);
                if (templatedOutbound) {
                    templatedOutbounds.push(templatedOutbound);
                }
            }

            const preparedXrayJsonConfig: XrayJsonConfig[] = [];
            for (const templatedOutbound of templatedOutbounds) {
                preparedXrayJsonConfig.push({
                    ...templateContent,
                    outbounds: [...templatedOutbound.outbounds, ...templateContent.outbounds],
                    remarks: templatedOutbound.remarks,
                });
            }

            return this.renderConfigs(preparedXrayJsonConfig);
        } catch (error) {
            this.logger.error('Error generating xray-json config:', error);
            return '';
        }
    }

    private createConfigForHost(host: IFormattedHost): XrayJsonConfig | null {
        try {
            const outbounds: Outbound[] = [];

            const mainOutbound: Outbound = {
                tag: 'proxy',
                protocol: host.protocol,
                settings: this.createOutboundSettings(host),
                streamSettings: this.createStreamSettings(host),
            };

            outbounds.push(mainOutbound);

            return {
                remarks: host.remark,
                outbounds: outbounds,
            };
        } catch (error) {
            this.logger.error('Error creating config for host:', error);
            return null;
        }
    }

    private createOutboundSettings(host: IFormattedHost): OutboundSettings {
        switch (host.protocol) {
            case 'vless':
                const vnextWithoutFlow = {
                    vnext: [
                        {
                            address: host.address,
                            port: host.port,
                            users: [
                                {
                                    id: host.password.vlessPassword,
                                    encryption: 'none',
                                    flow: 'xtls-rprx-vision' as string | undefined,
                                },
                            ],
                        },
                    ],
                };

                if (
                    !(
                        ['reality', 'tls'].includes(host.tls) &&
                        ['raw', 'tcp'].includes(host.network) &&
                        host.headerType !== 'http'
                    )
                ) {
                    vnextWithoutFlow.vnext[0].users[0].flow = undefined;
                }

                return vnextWithoutFlow;

            case 'trojan':
                return {
                    servers: [
                        {
                            address: host.address,
                            port: host.port,
                            password: host.password.trojanPassword,
                        },
                    ],
                };

            case 'shadowsocks':
                return {
                    servers: [
                        {
                            address: host.address,
                            port: host.port,
                            password: host.password.ssPassword,
                            method: 'chacha20-ietf-poly1305',
                            uot: false,
                            ivCheck: false,
                        },
                    ],
                };

            default:
                return { vnext: [] };
        }
    }

    private createStreamSettings(host: IFormattedHost): StreamSettings {
        const streamSettings: StreamSettings = {
            network: host.network || 'tcp',
        };

        switch (host.network) {
            case 'ws':
                streamSettings.wsSettings = this.createWsSettings(host);
                break;

            case 'tcp':
            case 'raw':
                streamSettings.tcpSettings = this.createTcpSettings(host);
                break;

            case 'xhttp':
                streamSettings.xhttpSettings = this.createXHttpSettings(host);

                break;
        }

        if (host.tls === 'tls') {
            streamSettings.security = 'tls';
            streamSettings.tlsSettings = this.createTlsSettings(host);
        } else if (host.tls === 'reality') {
            streamSettings.security = 'reality';
            streamSettings.realitySettings = this.createRealitySettings(host);
        }

        return streamSettings;
    }

    private createWsSettings(host: IFormattedHost): Record<string, unknown> {
        const settings: Record<string, any> = {
            path: host.path,
            headers: {},
        };

        if (Array.isArray(host.host)) {
            settings.headers.Host = host.host[0];
        } else {
            settings.headers.Host = host.host;
        }

        if (host.additionalParams?.heartbeatPeriod) {
            settings.heartbeatPeriod = host.additionalParams.heartbeatPeriod;
        }

        return settings;
    }

    private createTcpSettings(host: IFormattedHost): Record<string, unknown> {
        const settings: Record<string, any> = {};

        if (host.headerType === 'http') {
            settings.header = { type: 'http' };
            settings.header.request = {
                version: '1.1',
                method: 'GET',
                headers: {
                    'Accept-Encoding': ['gzip', 'deflate'],
                    Connection: ['keep-alive'],
                    Pragma: 'no-cache',
                },
            };

            if (host.path) {
                settings.header.request.path = [host.path];
            }

            if (Array.isArray(host.host)) {
                settings.header.request.headers.Host = [host.host[0]];
            } else {
                settings.header.request.headers.Host = [host.host];
            }
        }

        return settings;
    }

    private createXHttpSettings(host: IFormattedHost): Record<string, unknown> {
        const settings: Record<string, any> = {
            mode: host.additionalParams?.mode || 'auto',
            headers: {},
            extra: {
                xmux: {},
            },
        };

        if (Array.isArray(host.host)) {
            settings.host = host.host[0];
        } else {
            settings.host = host.host;
        }

        if (host.path !== '') {
            settings.path = host.path;
        }

        if (host.additionalParams) {
            settings.extra.scMaxEachPostBytes = host.additionalParams.scMaxEachPostBytes || 1000000;
            settings.extra.scMinPostsIntervalMs = host.additionalParams.scMinPostsIntervalMs || 30;
            settings.extra.xPaddingBytes = host.additionalParams.xPaddingBytes || '100-1000';
            settings.extra.noGRPCHeader = Boolean(host.additionalParams.noGRPCHeader);
            settings.extra.noSSEHeader = false;

            settings.extra.xmux.cMaxReuseTimes = '0';
            settings.extra.xmux.hMaxRequestTimes = '0';
            settings.extra.xmux.hMaxReusableSecs = '0';
            settings.extra.xmux.maxConcurrency = '0';
        }

        return settings;
    }

    private createTlsSettings(host: IFormattedHost): Record<string, unknown> {
        const settings: Record<string, unknown> = {
            serverName: host.sni || '',
            allowInsecure: false,
            show: false,
        };

        if (host.fingerprint !== '') {
            settings.fingerprint = host.fingerprint;
        }

        if (host.alpn) {
            settings.alpn = Array.isArray(host.alpn) ? host.alpn : [host.alpn];
        }

        return settings;
    }

    private createRealitySettings(host: IFormattedHost): Record<string, unknown> {
        const settings: Record<string, unknown> = {
            serverName: host.sni,
            show: false,
        };

        if (host.publicKey) {
            settings.publicKey = host.publicKey;
        }

        if (host.shortId) {
            settings.shortId = host.shortId;
        }

        if (host.spiderX) {
            settings.spiderX = host.spiderX;
        }

        if (host.fingerprint !== '') {
            settings.fingerprint = host.fingerprint;
        }

        return settings;
    }

    private renderConfigs(templateContent: XrayJsonConfig[]): string {
        return JSON.stringify(templateContent, null, 0);
    }
}
