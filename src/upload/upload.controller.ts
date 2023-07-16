import { uploadParams } from '@/helper'
import { Controller, Post, UploadedFile, Body } from '@nestjs/common'
import { Image, generateThumbnail } from './upload'

@Controller('upload')
export class UploadController {
  @Post('image')
  @Image()
  async image(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: any, // 使用MulterFormData解析请求正文中的表单数据
  ) {
    const thumbnailSize = formData.thumbnailSize || 200 // 获取传递的thumbnailSize参数值，如果没有则使用默认值200
    const thumbnailPath = await generateThumbnail(file.path, thumbnailSize)
    return uploadParams(file, thumbnailPath)
  }
}
