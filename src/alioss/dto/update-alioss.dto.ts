import { PartialType } from '@nestjs/swagger';
import { CreateAliossDto } from './create-alioss.dto';

export class UpdateAliossDto extends PartialType(CreateAliossDto) {}
