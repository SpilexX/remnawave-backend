import { CqrsModule } from '@nestjs/cqrs';
import { Module } from '@nestjs/common';

import { InternalSquadRepository } from './repositories/internal-squad.repository';
import { InternalSquadController } from './internal-squad.controller';
import { InternalSquadConverter } from './internal-squad.converter';
import { InternalSquadService } from './internal-squad.service';
import { COMMANDS } from './commands';

@Module({
    imports: [CqrsModule],
    controllers: [InternalSquadController],
    providers: [InternalSquadRepository, InternalSquadService, InternalSquadConverter, ...COMMANDS],
})
export class InternalSquadModule {}
