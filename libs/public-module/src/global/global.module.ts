import { APP_PIPE, APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { Module, DynamicModule, ValidationPipe, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { rootPath, AllExceptionFilter, TransformInterceptor } from '@app/public-tool';
import { LoggerModule } from '../logger';

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

import redisStore from 'cache-manager-redis-store';
import { load } from 'js-yaml';
import { merge, cloneDeepWith } from 'lodash';

export interface GlobalModuleOptions {
  yamlFilePath?: string[]; // 配置文件路径
  microservice?: string[]; // 开启微服务模块
  typeorm?: boolean; // 开启 orm 模块
  upload?: boolean; // 开启文件上传模块
  cache?: boolean; // 开启缓存模块
}

/**
 * 全局模块
 */
@Module({})
export class GlobalModule {
  /**
   * 全局模块初始化
   */
  static forRoot(options: GlobalModuleOptions): DynamicModule {
    const { yamlFilePath = [], typeorm, cache, } = options || {};

    const imports: DynamicModule['imports'] = [
      // 配置模块
      ConfigModule.forRoot({
        isGlobal: true,
        cache: true,
        load: [
          () => {
            let configs: any = {};
            const configPath = [
              'config.yaml',
              'config.microservice.yaml',
              'config.jwt.yaml',
              `${process.env.NODE_ENV || 'development'}.yaml`,
              ...yamlFilePath,
            ];
            for (let path of configPath) {
              try {
                // 读取并解析配置文件
                const filePath = join(rootPath, 'config', path);
                if (existsSync(filePath)) configs = merge(configs, load(readFileSync(filePath, 'utf8')));
              } catch { }
            }
            // 递归将 null 转 空字符串
            configs = cloneDeepWith(configs, (value) => {
              if (value === null) return '';
            });

            return configs;
          },
        ],
      }),
      // 日志模块
      LoggerModule.forRoot({
        isGlobal: true,
        useFactory: (configService: ConfigService) => {
          const path = configService.get('logsPath');
          return { filename: join(rootPath, `logs/${path}/${path}.log`) };
        },
        inject: [ConfigService],
      }),
    ];


    // 启动 orm 模块
    if (typeorm) {
      imports.push(
        TypeOrmModule.forRootAsync({
          useFactory: (configService: ConfigService) => {
            const db = configService.get('db');
            return { ...db, autoLoadEntities: true };
          },
          inject: [ConfigService],
        })
      );
    }


    // 开启缓存模块
    if (cache) {
      imports.push({
        ...CacheModule.registerAsync({
          useFactory: (configService: ConfigService) => {
            const { redis } = configService.get('cache');
            // 使用 redis 做缓存服务
            return redis?.host ? { store: redisStore, ...redis } : {};
          },
          inject: [ConfigService],
        }),
        global: true,
      });
    }



    return {
      module: GlobalModule,
      imports,
      providers: [
        // 全局使用验证管道，并统一报错处理
        { provide: APP_PIPE, useValue: new ValidationPipe({ transform: true }) },
        // 异常过滤器
        { provide: APP_FILTER, useClass: AllExceptionFilter },
        // 响应参数转化拦截器
        { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
      ],
    };
  }
}
