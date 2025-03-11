import * as CONTROLLERS from './controllers';

export const ROOT = '/api' as const;
export const METRICS_ROOT = '/metrics' as const;
export const BULLBOARD_ROOT = '/queues' as const;

export const REST_API = {
    AUTH: {
        LOGIN: `${ROOT}/${CONTROLLERS.AUTH_CONTROLLER}/${CONTROLLERS.AUTH_ROUTES.LOGIN}`,
        REGISTER: `${ROOT}/${CONTROLLERS.AUTH_CONTROLLER}/${CONTROLLERS.AUTH_ROUTES.REGISTER}`,
        GET_STATUS: `${ROOT}/${CONTROLLERS.AUTH_CONTROLLER}/${CONTROLLERS.AUTH_ROUTES.GET_STATUS}`,
    },
    API_TOKENS: {
        CREATE: `${ROOT}/${CONTROLLERS.API_TOKENS_CONTROLLER}/${CONTROLLERS.API_TOKENS_ROUTES.CREATE}`,
        DELETE: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.API_TOKENS_CONTROLLER}/${CONTROLLERS.API_TOKENS_ROUTES.DELETE}/${uuid}`,
        GET_ALL: `${ROOT}/${CONTROLLERS.API_TOKENS_CONTROLLER}/${CONTROLLERS.API_TOKENS_ROUTES.GET_ALL}`,
    },
    KEYGEN: {
        GET: `${ROOT}/${CONTROLLERS.KEYGEN_CONTROLLER}/${CONTROLLERS.KEYGEN_ROUTES.GET}`,
    },
    NODES: {
        CREATE: `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.CREATE}`,
        DELETE: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.DELETE}/${uuid}`,
        UPDATE: `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.UPDATE}`,
        GET_ALL: `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.GET_ALL}`,
        RESTART: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.RESTART}/${uuid}`,
        GET_ONE: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.GET_ONE}/${uuid}`,
        DISABLE: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.DISABLE}/${uuid}`,
        ENABLE: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.ENABLE}/${uuid}`,
        RESTART_ALL: `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.RESTART_ALL}`,
        STATS: {
            USAGE_BY_RANGE: `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.STATS.USAGE_BY_RANGE}`,
        },
        REORDER: `${ROOT}/${CONTROLLERS.NODES_CONTROLLER}/${CONTROLLERS.NODES_ROUTES.REORDER}`,
    },
    XRAY: {
        GET_CONFIG: `${ROOT}/${CONTROLLERS.XRAY_CONTROLLER}/${CONTROLLERS.XRAY_ROUTES.GET_CONFIG}`,
        UPDATE_CONFIG: `${ROOT}/${CONTROLLERS.XRAY_CONTROLLER}/${CONTROLLERS.XRAY_ROUTES.UPDATE_CONFIG}`,
    },
    INBOUNDS: {
        GET_INBOUNDS: `${ROOT}/${CONTROLLERS.INBOUNDS_CONTROLLER}/${CONTROLLERS.INBOUNDS_ROUTES.GET_INBOUNDS}`,
    },
    USERS: {
        CREATE: `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.CREATE}`,
        GET_BY_UUID: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.GET_BY_UUID}/${uuid}`,
        GET_BY_SHORT_UUID: (shortUuid: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.GET_BY_SHORT_UUID}/${shortUuid}`,
        GET_BY_USERNAME: (username: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.GET_BY_USERNAME}/${username}`,
        GET_BY_SUBSCRIPTION_UUID: (subscriptionUuid: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.GET_BY_SUBSCRIPTION_UUID}/${subscriptionUuid}`,
        REVOKE_SUBSCRIPTION: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.REVOKE_SUBSCRIPTION}/${uuid}`,
        DISABLE_USER: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.DISABLE_USER}/${uuid}`,
        ENABLE_USER: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.ENABLE_USER}/${uuid}`,
        DELETE_USER: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.DELETE_USER}/${uuid}`,
        UPDATE: `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.UPDATE}`,
        GET_ALL_V2: `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.GET_ALL_V2}`,
        RESET_USER_TRAFFIC: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.RESET_USER_TRAFFIC}/${uuid}`,
        BULK: {
            DELETE_BY_STATUS: `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.BULK.DELETE_BY_STATUS}`,
        },
        GET_BY_TELEGRAM_ID: (telegramId: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.GET_BY_TELEGRAM_ID}/${telegramId}`,
        GET_BY_EMAIL: (email: string) =>
            `${ROOT}/${CONTROLLERS.USERS_CONTROLLER}/${CONTROLLERS.USERS_ROUTES.GET_BY_EMAIL}/${email}`,
    },
    SUBSCRIPTION: {
        GET: (shortUuid: string) =>
            `${ROOT}/${CONTROLLERS.SUBSCRIPTION_CONTROLLER}/${CONTROLLERS.SUBSCRIPTION_ROUTES.GET}/${shortUuid}`,
        GET_INFO: (shortUuid: string) =>
            `${ROOT}/${CONTROLLERS.SUBSCRIPTION_CONTROLLER}/${shortUuid}${CONTROLLERS.SUBSCRIPTION_ROUTES.GET_INFO}`,
    },
    HOSTS: {
        CREATE: `${ROOT}/${CONTROLLERS.HOSTS_CONTROLLER}/${CONTROLLERS.HOSTS_ROUTES.CREATE}`,
        GET_ALL: `${ROOT}/${CONTROLLERS.HOSTS_CONTROLLER}/${CONTROLLERS.HOSTS_ROUTES.GET_ALL}`,
        UPDATE: `${ROOT}/${CONTROLLERS.HOSTS_CONTROLLER}/${CONTROLLERS.HOSTS_ROUTES.UPDATE}`,
        UPDATE_MANY: `${ROOT}/${CONTROLLERS.HOSTS_CONTROLLER}/${CONTROLLERS.HOSTS_ROUTES.UPDATE_MANY}`,
        REORDER: `${ROOT}/${CONTROLLERS.HOSTS_CONTROLLER}/${CONTROLLERS.HOSTS_ROUTES.REORDER}`,
        DELETE: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.HOSTS_CONTROLLER}/${CONTROLLERS.HOSTS_ROUTES.DELETE}/${uuid}`,
        GET_ONE: (uuid: string) =>
            `${ROOT}/${CONTROLLERS.HOSTS_CONTROLLER}/${CONTROLLERS.HOSTS_ROUTES.GET_ONE}/${uuid}`,
    },
    SYSTEM: {
        STATS: `${ROOT}/${CONTROLLERS.SYSTEM_CONTROLLER}/${CONTROLLERS.SYSTEM_ROUTES.STATS}`,
        BANDWIDTH: `${ROOT}/${CONTROLLERS.SYSTEM_CONTROLLER}/${CONTROLLERS.SYSTEM_ROUTES.BANDWIDTH}`,
        NODES_STATISTIC: `${ROOT}/${CONTROLLERS.SYSTEM_CONTROLLER}/${CONTROLLERS.SYSTEM_ROUTES.STATISTIC.NODES}`,
    },
    SUBSCRIPTION_TEMPLATE: {
        GET_INFO: (subscriptionType: string) =>
            `${ROOT}/${CONTROLLERS.SUBSCRIPTION_TEMPLATE_CONTROLLER}/${CONTROLLERS.SUBSCRIPTION_TEMPLATE_ROUTES.GET_TEMPLATE}/${subscriptionType}`,
        UPDATE_TEMPLATE: `${ROOT}/${CONTROLLERS.SUBSCRIPTION_TEMPLATE_CONTROLLER}/${CONTROLLERS.SUBSCRIPTION_TEMPLATE_ROUTES.UPDATE_TEMPLATE}`,
    },
    SUBSCRIPTION_SETTINGS: {
        GET_SETTINGS: `${ROOT}/${CONTROLLERS.SUBSCRIPTION_SETTINGS_CONTROLLER}/${CONTROLLERS.SUBSCRIPTION_SETTINGS_ROUTES.GET_SETTINGS}`,
        UPDATE_SETTINGS: `${ROOT}/${CONTROLLERS.SUBSCRIPTION_SETTINGS_CONTROLLER}/${CONTROLLERS.SUBSCRIPTION_SETTINGS_ROUTES.UPDATE_SETTINGS}`,
    },
} as const;
