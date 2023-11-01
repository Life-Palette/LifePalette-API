import { Type } from 'class-transformer'
import { IsNotEmpty, IsOptional } from 'class-validator'

export class CreateLikeDto {
  @Type(() => Number)
  userId: number

  @IsOptional()
  @Type(() => Number)
  topicId: number
}
