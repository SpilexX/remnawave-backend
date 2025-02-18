import { utilities as nestWinstonModuleUtilities, WinstonModule } from 'nest-winston';
import { patchNestJsSwagger } from 'nestjs-zod';
import { NestFactory } from '@nestjs/core';
import { createLogger } from 'winston';
import compression from 'compression';
import * as winston from 'winston';
import { json } from 'express';
import helmet from 'helmet';

import { isDevelopment } from '@common/utils/startup-app';

import { AxiosService } from '@common/axios';

import { WorkerModule } from './worker.module';
import { WorkerRoutesGuard } from '@common/guards/worker-routes/worker-routes.guard';
import { NotFoundExceptionFilter } from '@common/exception/not-found-exception.filter';
import { ConfigService } from '@nestjs/config';

patchNestJsSwagger();

// const levels = {
//     error: 0,
//     warn: 1,
//     info: 2,
//     http: 3,
//     verbose: 4,
//     debug: 5,
//     silly: 6,
// };

const logger = createLogger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('', {
            colors: true,
            prettyPrint: true,
            processId: false,
            appName: false,
        }),
    ),
    level: isDevelopment() ? 'debug' : 'http',
});

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(WorkerModule, {
        logger: WinstonModule.createLogger({
            instance: logger,
        }),
    });

    app.use(json({ limit: '100mb' }));

    const config = app.get(ConfigService);

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'", '*'],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", '*'],
                    imgSrc: ["'self'", 'data:', '*'],
                    connectSrc: ["'self'", '*'],
                    workerSrc: ["'self'", 'blob:', '*'],
                },
            },
        }),
    );

    app.use(compression());

    app.useGlobalFilters(new NotFoundExceptionFilter());

    app.useGlobalGuards(new WorkerRoutesGuard({ allowedPaths: ['/queues'] }));

    app.enableShutdownHooks();

    await app.listen(Number(config.getOrThrow<string>('WORKER_PORT')));

    const axiosService = app.get(AxiosService);
    await axiosService.setJwt();
}
void bootstrap();
