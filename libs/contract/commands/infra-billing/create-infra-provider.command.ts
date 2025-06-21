import { z } from 'zod';

import { INFRA_BILLING_ROUTES, REST_API } from '../../api';
import { getEndpointDetails } from '../../constants';
import { InfraProviderSchema } from '../../models';

export namespace CreateInfraProviderCommand {
    export const url = REST_API.INFRA_BILLING.CREATE_PROVIDER;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        INFRA_BILLING_ROUTES.CREATE_PROVIDER,
        'post',
        'Create infra provider',
    );

    export const RequestSchema = z.object({
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(30, 'Name must be less than 255 characters'),
        faviconLink: z.string().url().optional(),
        loginUrl: z.string().url().optional(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: InfraProviderSchema,
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
