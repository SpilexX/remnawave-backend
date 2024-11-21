import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { NodesUsageHistoryConverter } from './nodes-usage-history.converter';
import { NodesUsageHistoryRepository } from './repositories/nodes-usage-history.repository';
import { NodesUsageHistoryController } from './nodes-usage-history.controller';
import { NodesUsageHistoryService } from './nodes-usage-history.service';

@Module({
    imports: [CqrsModule],
    controllers: [NodesUsageHistoryController],
    providers: [NodesUsageHistoryRepository, NodesUsageHistoryConverter, NodesUsageHistoryService],
})
export class NodesUsageHistoryModule {}
