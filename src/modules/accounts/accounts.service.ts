import { ConflictException, Injectable, ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { LoginDto, RegisterAccountDto, UpdateProfileDto } from './dto/account.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/account.dto';
import { EmailService } from '../email/email.service';

type Account = { id: string; role: 'mentor' | 'mentee'; name: string; email: string; passwordHash: string; profile: Record<string, unknown>; createdAt: string; updatedAt: string };

@Injectable()
export class AccountsService {
  private readonly dataPath = process.env.ACCOUNTS_JSON_PATH || join(process.cwd(), 'data', 'accounts.json');
  private accounts: Account[];
  private readonly passwordResets = new Map<string, { codeHash: string; expiresAt: number }>();
  private readonly tokenSecret = process.env.AUTH_SECRET || randomBytes(32).toString('hex');

  constructor(private readonly email: EmailService) { this.accounts = this.load(); }

  register(dto: RegisterAccountDto) {
    const email = dto.email.trim().toLowerCase();
    if (this.accounts.some(account => account.email === email)) throw new ConflictException('An account already exists with this email. Please log in instead.');
    const now = new Date().toISOString();
    const account: Account = { id: `usr_${randomBytes(8).toString('hex')}`, role: dto.role, name: dto.name.trim(), email, passwordHash: this.hash(dto.password), profile: dto.profile || {}, createdAt: now, updatedAt: now };
    this.accounts.unshift(account); this.save();
    return this.session(account);
  }

  login(dto: LoginDto) {
    const account = this.accounts.find(item => item.email === dto.email.trim().toLowerCase());
    if (!account) throw new UnauthorizedException('No account exists with this email address.');
    if (dto.role && account.role !== dto.role) throw new UnauthorizedException(`This email is registered as a ${account.role}, not a ${dto.role}.`);
    if (!this.verify(dto.password, account.passwordHash)) throw new UnauthorizedException('Incorrect password. Please try again.');
    return this.session(account);
  }

  current(token: string) { return this.publicAccount(this.accountFromToken(token)); }

  update(token: string, dto: UpdateProfileDto) {
    const account = this.accountFromToken(token);
    account.profile = { ...account.profile, ...dto.profile };
    if (dto.name?.trim()) account.name = dto.name.trim();
    account.updatedAt = new Date().toISOString(); this.save();
    return this.publicAccount(account);
  }

  mentors() { return this.accounts.filter(account => account.role === 'mentor').map(account => this.publicAccount(account)); }
  people(role?: 'mentor' | 'mentee') { return this.accounts.filter(account => !role || account.role === role).map(account => this.publicAccount(account)); }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const account = this.findByEmail(dto.email);
    if (!account) return { message: 'If that account exists, a reset code has been sent.' };
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.passwordResets.set(account.email, { codeHash: this.hash(code), expiresAt: Date.now() + 15 * 60 * 1000 });
    try {
      const delivered = await this.email.sendAutomatedMessage(account.email, 'Your MentorMatcher password reset code', `Hi ${account.name},\n\nYour password reset code is: ${code}\n\nIt expires in 15 minutes. If you did not request this, you can safely ignore this email.`);
      if (!delivered) throw new Error('Email delivery is not configured.');
      return { message: 'A password reset code has been sent. Check your inbox and spam folder.' };
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        return { message: 'Email delivery is not configured. Local test code created below.', delivery: 'local', developmentCode: code };
      }
      this.passwordResets.delete(account.email);
      throw new ServiceUnavailableException('We could not deliver the reset email. Please ask the site owner to check the verified Resend sender address and email configuration.');
    }
  }

  resetPassword(dto: ResetPasswordDto) {
    const account = this.findByEmail(dto.email);
    if (!account) throw new UnauthorizedException('No account exists with this email address.');
    account.passwordHash = this.hash(dto.newPassword);
    account.updatedAt = new Date().toISOString();
    this.save();
    return { message: 'Password updated. You can now log in with your new password.' };
  }

  deleteAccount(token: string) {
    const account = this.accountFromToken(token);
    const index = this.accounts.findIndex(item => item.id === account.id);
    if (index === -1) throw new UnauthorizedException('Account not found.');
    this.accounts.splice(index, 1);
    this.save();
    return { success: true, message: 'Account deleted successfully.' };
  }

  private findByEmail(email: string) {
    const normalized = (email || '').trim().toLowerCase();
    return this.accounts.find(item => item.email === normalized);
  }

  private session(account: Account) { return { token: this.tokenFor(account), account: this.publicAccount(account) }; }
  private publicAccount(account: Account) { const { passwordHash, ...safe } = account; return safe; }
  private tokenFor(account: Account) { const payload = `${account.id}.${Date.now()}.${randomBytes(12).toString('hex')}`; return `${payload}.${createHmac('sha256', this.tokenSecret).update(payload).digest('hex')}`; }
  private accountFromToken(token: string) {
    const [id, issuedAt, nonce, signature] = (token || '').split('.'); const payload = [id, issuedAt, nonce].join('.');
    const expected = createHmac('sha256', this.tokenSecret).update(payload).digest('hex');
    if (!id || !signature || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) throw new UnauthorizedException('Your session has expired. Please log in again.');
    const account = this.accounts.find(item => item.id === id); if (!account) throw new UnauthorizedException('Your account was not found.'); return account;
  }
  private hash(password: string) { const salt = randomBytes(16).toString('hex'); return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`; }
  private verify(password: string, stored: string) { const [salt, digest] = stored.split(':'); const candidate = scryptSync(password, salt, 64).toString('hex'); return timingSafeEqual(Buffer.from(digest), Buffer.from(candidate)); }
  private load(): Account[] { try { if (!existsSync(this.dataPath)) return []; return JSON.parse(readFileSync(this.dataPath, 'utf8')); } catch { return []; } }
  private save() {
    try {
      const directory = dirname(this.dataPath);
      if (!existsSync(directory)) mkdirSync(directory, { recursive: true });
      writeFileSync(this.dataPath, JSON.stringify(this.accounts, null, 2), 'utf8');
    } catch (error) {
      console.warn(
        `[AccountsService] Warning: Could not write accounts to ${this.dataPath}. ` +
        `This is expected in read-only environments (e.g. Vercel). ` +
        `Data will remain in-memory for this instance. Error: ${error.message}`
      );
    }
  }
}
