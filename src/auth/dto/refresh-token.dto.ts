
import {  IsNotEmpty } from 'class-validator'

export class RefreshTokenDto {
  @IsNotEmpty({ message: 'refreshToken不能为空' })
  refreshToken: string
}
