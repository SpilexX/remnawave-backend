import { parseMode } from '@grammyjs/parse-mode';
import { OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';
import { InjectBot } from '@grammyjs/nestjs';
import { Bot, Context } from 'grammy';
import dayjs from 'dayjs';

import { EVENTS } from '@libs/contracts/constants';

import { BOT_NAME } from '../../constants';
import { NodeEvent } from './interfaces';

export class NodesEvents {
    private readonly adminId: string;

    constructor(
        @InjectBot(BOT_NAME)
        private readonly bot: Bot<Context>,
        private readonly configService: ConfigService,
    ) {
        this.adminId = configService.getOrThrow<string>('TELEGRAM_ADMIN_ID');
        this.bot.api.config.use(parseMode('html'));
    }

    @OnEvent(EVENTS.NODE.CREATED)
    async onNodeCreated(event: NodeEvent): Promise<void> {
        const msg = `
💻 <b>#nodeCreated</b>
➖➖➖➖➖➖➖➖➖
<b>Name:</b> <code>${event.node.name}</code>
<b>Address:</b> <code>${event.node.address}</code>
<b>Port:</b> <code>${event.node.port}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.NODE.MODIFIED)
    async onNodeModified(event: NodeEvent): Promise<void> {
        const msg = `
📝 <b>#nodeModified</b>
➖➖➖➖➖➖➖➖➖
<b>Name:</b> <code>${event.node.name}</code>
<b>Address:</b> <code>${event.node.address}</code>
<b>Port:</b> <code>${event.node.port}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.NODE.DISABLED)
    async onNodeDisabled(event: NodeEvent): Promise<void> {
        const msg = `
� <b>#nodeDisabled</b>
➖➖➖➖➖➖➖➖➖
<b>Name:</b> <code>${event.node.name}</code>
<b>Address:</b> <code>${event.node.address}</code>
<b>Port:</b> <code>${event.node.port}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.NODE.ENABLED)
    async onNodeEnabled(event: NodeEvent): Promise<void> {
        const msg = `
🟢 <b>#nodeEnabled</b>
➖➖➖➖➖➖➖➖➖
<b>Name:</b> <code>${event.node.name}</code>
<b>Address:</b> <code>${event.node.address}</code>
<b>Port:</b> <code>${event.node.port}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.NODE.CONNECTION_LOST)
    async onNodeConnectionLost(event: NodeEvent): Promise<void> {
        const msg = `
🚨 <b>#nodeConnectionLost</b>
<b>Connection to node lost</b>
➖➖➖➖➖➖➖➖➖
<b>Name:</b> <code>${event.node.name}</code>
<b>Reason:</b> <code>${event.node.lastStatusMessage}</code>
<b>Last status change:</b> <code>${dayjs(event.node.lastStatusChange).format('DD.MM.YYYY HH:mm')}</code>
<b>Address:</b> <code>${event.node.address}:${event.node.port}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }

    @OnEvent(EVENTS.NODE.CONNECTION_RESTORED)
    async onNodeConnectionRestored(event: NodeEvent): Promise<void> {
        const msg = `
🟢 <b>#nodeConnectionRestored</b>
<b>Connection to node restored</b>
➖➖➖➖➖➖➖➖➖
<b>Name:</b> <code>${event.node.name}</code>
<b>Reason:</b> <code>${event.node.lastStatusMessage}</code>
<b>Last status change:</b> <code>${dayjs(event.node.lastStatusChange).format('DD.MM.YYYY HH:mm')}</code>
<b>Address:</b> <code>${event.node.address}:${event.node.port}</code>
        `;
        await this.bot.api.sendMessage(this.adminId, msg);
    }
}
