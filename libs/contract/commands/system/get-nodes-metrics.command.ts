import { z } from 'zod';

import { getEndpointDetails } from '../../constants';
import { REST_API, SYSTEM_ROUTES } from '../../api';

export namespace GetNodesMetricsCommand {
    export const url = REST_API.SYSTEM.STATS.NODES_METRICS;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        SYSTEM_ROUTES.STATS.NODES_METRICS,
        'get',
        'Get Nodes Metrics',
    );

    export const ResponseSchema = z.object({
        response: z.object({
            nodes: z.array(
                z.object({
                    nodeUuid: z.string(),
                    nodeName: z.string(),
                    countryEmoji: z.string(),
                    providerName: z.string(),
                    usersOnline: z.number(),
                    inboundsStats: z.array(
                        z.object({
                            tag: z.string(),
                            upload: z.string(),
                            download: z.string(),
                        }),
                    ),
                    outboundsStats: z.array(
                        z.object({
                            tag: z.string(),
                            upload: z.string(),
                            download: z.string(),
                        }),
                    ),
                }),
            ),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
