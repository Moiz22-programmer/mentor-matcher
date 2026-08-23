import { Body, Controller, Delete, Get, Headers, Patch, Post, Query } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { LoginDto, RegisterAccountDto, ResetPasswordDto, RequestPasswordResetDto, UpdateProfileDto } from './dto/account.dto';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accounts: AccountsService) {}
  @Post('register') register(@Body() dto: RegisterAccountDto) { return this.accounts.register(dto); }
  @Post('login') login(@Body() dto: LoginDto) { return this.accounts.login(dto); }
  @Post('password-reset/request') requestReset(@Body() dto: RequestPasswordResetDto) { return this.accounts.requestPasswordReset(dto); }
  @Post('password-reset/confirm') confirmReset(@Body() dto: ResetPasswordDto) { return this.accounts.resetPassword(dto); }
  @Get('me') me(@Headers('authorization') authorization?: string) { return this.accounts.current(this.token(authorization)); }
  @Patch('me') update(@Headers('authorization') authorization: string | undefined, @Body() dto: UpdateProfileDto) { return this.accounts.update(this.token(authorization), dto); }
  @Delete('me') deleteAccount(@Headers('authorization') authorization?: string) { return this.accounts.deleteAccount(this.token(authorization)); }
  @Get('mentors') mentors() { return this.accounts.mentors(); }
  @Get('people') people(@Query('role') role?: 'mentor' | 'mentee') { return this.accounts.people(role); }
  private token(header?: string) { return header?.replace(/^Bearer\s+/i, '') || ''; }
}
