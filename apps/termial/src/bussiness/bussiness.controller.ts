import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiOperation } from '@app/public-decorator';
import { BussinessService } from './bussiness.service';
import { RepeatNameQueryDto, ResponseSuccessDto } from './bussiness.dto';

@ApiTags('业务建模')
@Controller('terminals')
export class BussinessController {
  constructor(private readonly bussinessService: BussinessService) {}

  @Post()
  @ApiBody({ type: RepeatNameQueryDto })
  @ApiResponse({ status: 200, type: ResponseSuccessDto })
  @ApiOperation('检验模型名称是否重复')
  checkRepeatName(@Body() data: RepeatNameQueryDto, @Req() req) {
    return this.bussinessService.checkRepeatName(data, req);
  }

}
