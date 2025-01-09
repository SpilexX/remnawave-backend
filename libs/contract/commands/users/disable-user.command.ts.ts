import { z } from 'zod';

import { UsersSchema } from '../../models/users.schema';
import { REST_API } from '../../api';
export namespace DisableUserCommand {
    export const url = REST_API.USERS.DISABLE_USER;
    export const TSQ_url = url(':uuid');

    export const RequestSchema = z.object({
        uuid: z.string().uuid(),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: UsersSchema.extend({
            subscriptionUrl: z.string(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
