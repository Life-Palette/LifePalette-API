import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Role } from '../enum'
import { RoleGuard } from '../guards/role.guard'

export function Auth(roles: Role | Role[] = [Role.ADMIN, Role.USER]) {
  const roleArray = Array.isArray(roles) ? roles : [roles]
  return applyDecorators(SetMetadata('roles', roleArray), UseGuards(AuthGuard('jwt'), RoleGuard))
}
