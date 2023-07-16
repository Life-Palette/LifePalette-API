import { IsNotEmpty } from 'class-validator'

// update-tag
export class UpdateTagDto {
  @IsNotEmpty({ message: '标签名不能为空' })
  title: string

  cover?: string

  thumbnailPath?: string
}
