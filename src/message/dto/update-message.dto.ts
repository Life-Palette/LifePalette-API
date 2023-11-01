import { IsNotEmpty } from 'class-validator'
export class UpdateMessageDto {
  @IsNotEmpty({ message: '消息id不能为空' })
  id: number
}
