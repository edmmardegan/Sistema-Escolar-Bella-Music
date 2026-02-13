import { PartialType } from '@nestjs/mapped-types';
import { CreateAlunoDto } from './create-aluno.dto';

// O PartialType faz com que todos os campos do CreateAlunoDto
// tornem-se opcionais (@IsOptional) automaticamente para a edição.
export class UpdateAlunoDto extends PartialType(CreateAlunoDto) {}
