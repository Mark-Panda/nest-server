import { ApiProperty } from '@app/public-decorator';
/**
 * 检查重复名称请求
 */
export class RepeatNameQueryDto  {
    @ApiProperty('新模型名称')
    modelName: string;

    @ApiProperty('旧模型名称')
    oldModelName: string;
}


/**
 * 预览模型请求
 */
export class PreviewModelDto{
    modelList: Object;
}

/**
 * restful接口返回
 */
export class ResponseSuccessDto{
    @ApiProperty('成功响应结构')
    data: string | boolean | Object;
}