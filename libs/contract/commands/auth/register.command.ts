import { z } from 'zod';

import { REST_API } from '../../api';
export namespace RegisterCommand {
    export const url = REST_API.AUTH.REGISTER;
    export const TSQ_url = url;

    export const RequestSchema = z.object({
        username: z.string(),
        password: z
            .string()
            .min(24, 'Password must contain at least 24 characters')
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]/,
                'Password must contain uppercase and lowercase letters and numbers',
            ),
    });

    export type Request = z.infer<typeof RequestSchema>;

    export const ResponseSchema = z.object({
        response: z.object({
            accessToken: z.string(),
        }),
    });

    export type Response = z.infer<typeof ResponseSchema>;
}
