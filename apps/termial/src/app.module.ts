import { Module } from '@nestjs/common';
import { GlobalModule } from '@app/public-module';
import { BussinessModule } from './bussiness/bussiness.module';
import { AccountAdminModule } from './admin/admin.module';

@Module({
  imports: [
    GlobalModule.forRoot({
      yamlFilePath: ['apps/terimal.yaml'],
      // microservice: ['ACCOUNT_SERVICE', 'INFOS_SERVICE'],
      // cache: true,
      // upload: true,
    }),
    BussinessModule,
    AccountAdminModule
  ],
})
export class AppModule {}
