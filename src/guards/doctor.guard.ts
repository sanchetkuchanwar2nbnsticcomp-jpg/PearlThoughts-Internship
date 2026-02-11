import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UserRole } from '../auth/user.entity';

@Injectable()
export class DoctorGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext) {
    const isValid = await super.canActivate(context);
    if (!isValid) return false;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Doctor access only');
    }

    return true;
  }
}
