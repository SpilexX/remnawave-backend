import { GetNodesByCriteriaHandler } from './get-nodes-by-criteria';
import { CountOnlineUsersHandler } from './count-online-users';
import { GetEnabledNodesHandler } from './get-enabled-nodes';
import { GetOnlineNodesHandler } from './get-online-nodes';
import { GetNodeByUuidHandler } from './get-node-by-uuid';
import { GetAllNodesHandler } from './get-all-nodes';

export const QUERIES = [
    GetEnabledNodesHandler,
    GetOnlineNodesHandler,
    GetNodesByCriteriaHandler,
    GetAllNodesHandler,
    CountOnlineUsersHandler,
    GetNodeByUuidHandler,
];
