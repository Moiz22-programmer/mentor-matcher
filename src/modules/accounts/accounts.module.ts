import { Module } from '@nestjs/common';
import { AccountsController } from './accounts.controller';
import { AccountsService } from './accounts.service';
import { EmailModule } from '../email/email.module';

@Module({ imports: [EmailModule], controllers: [AccountsController], providers: [AccountsService], exports: [AccountsService] })
export class AccountsModule {}
