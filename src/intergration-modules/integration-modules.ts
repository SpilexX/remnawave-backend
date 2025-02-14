import { ConditionalModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { PrometheusReporterModule } from './prometheus-reporter/prometheus-reporter.module';
import { TelegramBotModule } from './telegram-bot/telegram-bot.module';
import { WebhookModule } from './webhook-module/webhook.module';

@Module({
    imports: [
        PrometheusReporterModule,
        ConditionalModule.registerWhen(TelegramBotModule, 'IS_TELEGRAM_ENABLED'),
        ConditionalModule.registerWhen(WebhookModule, 'WEBHOOK_ENABLED'),
    ],
})
export class IntegrationModules {}
