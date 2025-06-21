import { z } from 'zod';

import { InfraBillingHistoryRecordSchema } from '../../models';
import { INFRA_BILLING_ROUTES, REST_API } from '../../api';
import { getEndpointDetails } from '../../constants';

export namespace GetInfraBillingHistoryRecordsCommand {
    export const url = REST_API.INFRA_BILLING.GET_BILLING_HISTORY;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        INFRA_BILLING_ROUTES.GET_BILLING_HISTORY,
        'get',
        'Get infra billing history',
    );

    export const RequestQuerySchema = z.object({
        start: z.coerce
            .number()
            .default(0)
            .describe(
                'Start index (offset) of the billing history records to return, default is 0',
            ),
        size: z.coerce
            .number()
            .min(1, 'Size (limit) must be greater than 0')
            .max(500, 'Size (limit) must be less than 500')
            .describe('Number of users to return, no more than 500')
            .default(50),
    });

    export type RequestQuery = z.infer<typeof RequestQuerySchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            records: z.array(InfraBillingHistoryRecordSchema),
            total: z.number(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
