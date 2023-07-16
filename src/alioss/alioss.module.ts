import { Module } from '@nestjs/common';
import { AliossService } from './alioss.service';
import { AliossController } from './alioss.controller';

@Module({
  controllers: [AliossController],
  providers: [AliossService]
})
export class AliossModule {}
