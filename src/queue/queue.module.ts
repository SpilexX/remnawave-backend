import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';

import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';

import { BasicAuthMiddleware } from '@common/middlewares/basic-auth.middleware';
import { useBullBoard } from '@common/utils/startup-app';
import { BULLBOARD_ROOT } from '@libs/contracts/api';

import { NodeHealthCheckQueueModule } from './node-health-check/node-health-check.module';
import { StartAllNodesQueueModule } from './start-all-nodes/start-all-nodes.module';
import { StartNodeQueueModule } from './start-node/start-node.module';
import { NodeUsersQueueModule } from './node-users/node-users.module';
import { StopNodeQueueModule } from './stop-node/stop-node.module';

const queueModules = [
    StartAllNodesQueueModule,
    StartNodeQueueModule,
    StopNodeQueueModule,
    NodeHealthCheckQueueModule,
    NodeUsersQueueModule,
];

const bullBoard = [
    BullBoardModule.forRoot({
        route: BULLBOARD_ROOT,
        adapter: ExpressAdapter,
        boardOptions: {
            uiConfig: {
                boardTitle: 'Remnawave',
                boardLogo: {
                    path: 'https://remna.st/img/logo.svg',
                    width: 32,
                    height: 32,
                },
                locale: {
                    lng: 'en',
                },
                pollingInterval: {
                    showSetting: true,
                },
                miscLinks: [
                    {
                        text: 'Remnawave',
                        url: 'https://remna.st',
                    },
                    {
                        text: 'Telegram',
                        url: 'https://t.me/remnawave',
                    },
                ],
            },
        },
        middleware: [BasicAuthMiddleware],
    }),
];

@Global()
@Module({
    imports: [
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                connection: {
                    host: configService.getOrThrow<string>('REDIS_HOST'),
                    port: configService.getOrThrow<number>('REDIS_PORT'),
                    db: configService.getOrThrow<number>('REDIS_DB'),
                    password: configService.get<string | undefined>('REDIS_PASSWORD'),
                },
                defaultJobOptions: {
                    removeOnComplete: 500,
                    removeOnFail: 500,
                },
            }),
            inject: [ConfigService],
        }),

        ...(useBullBoard() ? bullBoard : []),

        ...queueModules,
    ],
    exports: [...queueModules],
})
export class QueueModule {}
