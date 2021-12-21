import { Injectable } from '@nestjs/common';
// import { Injectable, Inject, CACHE_MANAGER } from '@nestjs/common';
// import { ClientProxy } from '@nestjs/microservices';
// import { ConfigService } from '@nestjs/config';
import { rootPath  } from '@app/public-tool';
import path from 'path';
import fs from 'fs';
import { parse } from 'graphql';
import { LoggerService } from '@app/public-module';
import { RepeatNameQueryDto } from './bussiness.dto';

@Injectable()
export class BussinessService {
    constructor(private readonly loggerService: LoggerService) {}

    /**
    * 检验模型名称是否重复
    */
    async checkRepeatName(data: RepeatNameQueryDto, req: any) {
        this.loggerService.log(req.body, '请求体');
        let { modelName, oldModelName } = data;
        let oldDocument: any = {
            kind: 'Document',
            definitions: [],
            loc: {}
        };
        if (oldModelName && oldModelName.trim().toLowerCase() === modelName.trim().toLowerCase()) {
            return false;
        }
        const allFile = fs.readdirSync(`${rootPath}/schema/own/models`);
        if (allFile && allFile.length > 0) {
            for (let i = 0; i < allFile.length; i++) {
                const terminalFile = path.join(rootPath, 'schema/own/models/' + allFile[i]);
                const oldGraphql = fs.readFileSync(terminalFile, { encoding: 'utf-8' });
                if (oldGraphql.trim() !== '') {
                    oldDocument = parse(oldGraphql);
                    if (oldDocument.definitions.length > 0) {
                        for (let modelNode of oldDocument.definitions) {
                            if (modelNode.name.value.toLowerCase() === modelName.trim().toLowerCase()) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    }
}
