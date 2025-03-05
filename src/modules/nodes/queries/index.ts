import { GetNodesByCriteriaHandler } from './get-nodes-by-criteria';
import { GetEnabledNodesHandler } from './get-enabled-nodes';
import { GetOnlineNodesHandler } from './get-online-nodes';

export const QUERIES = [GetEnabledNodesHandler, GetOnlineNodesHandler, GetNodesByCriteriaHandler];
