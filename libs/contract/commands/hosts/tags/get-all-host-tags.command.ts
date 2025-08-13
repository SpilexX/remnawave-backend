import { z } from 'zod';

import { getEndpointDetails } from '../../../constants';
import { REST_API, HOSTS_ROUTES } from '../../../api';

export namespace GetAllHostTagsCommand {
    export const url = REST_API.HOSTS.TAGS.GET;
    export const TSQ_url = url;

    export const endpointDetails = getEndpointDetails(
        HOSTS_ROUTES.TAGS.GET,
        'get',
        'Get all existing host tags',
    );

    export const ResponseSchema = z.object({
        response: z.object({
            tags: z.array(z.string()),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
