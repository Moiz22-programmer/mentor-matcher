import { IsEmail, IsIn, IsNotEmpty, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterAccountDto {
  @IsIn(['mentor', 'mentee'])
  role: 'mentor' | 'mentee';

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsObject()
  profile: Record<string, unknown>;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsIn(['mentor', 'mentee'])
  role?: 'mentor' | 'mentee';
}

export class UpdateProfileDto {
  @IsObject()
  profile: Record<string, unknown>;

  @IsOptional()
  @IsString()
  name?: string;
}

export class RequestPasswordResetDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(['mentor', 'mentee'])
  role?: 'mentor' | 'mentee';
}

export class ResetPasswordDto extends RequestPasswordResetDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}
