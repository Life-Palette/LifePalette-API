import { IsNotEmpty } from 'class-validator'
export class CreateMessageDto {
  receiverId?: number
  objId?: number
  content?: string
  @IsNotEmpty({ message: '消息类型不能为空' })
  type: string
}
