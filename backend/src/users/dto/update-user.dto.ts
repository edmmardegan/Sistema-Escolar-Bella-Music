//Local: src/usuarios/dto/update-user.dto.ts

import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// Omitimos a senha no Update para que a troca de senha seja feita apenas via Patch (Segurança)
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['senha'] as const),
) {}
