import { Module } from '@nestjs/common';
import { BussinessController } from './bussiness.controller';
import { BussinessService } from './bussiness.service';

@Module({
  controllers: [BussinessController],
  providers: [BussinessService],
})
export class BussinessModule {}
