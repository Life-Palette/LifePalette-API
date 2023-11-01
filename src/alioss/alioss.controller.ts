import { Controller, Get, Post, Body, Query, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common'
import { AliossService } from './alioss.service'
import { CreateAliossDto } from './dto/create-alioss.dto'
import { UpdateAliossDto } from './dto/update-alioss.dto'
import { Image, File, generateThumbnail } from './upload'
import { FileInterceptor } from '@nestjs/platform-express'

@Controller('alioss')
export class AliossController {
  constructor(private readonly aliossService: AliossService) {}

  @Post()
  create(@Body() createAliossDto: CreateAliossDto) {
    // return this.aliossService.create(createAliossDto);
  }

  @Get()
  async findAll() {
    return await this.aliossService.getSignature()
    // return {}
  }
  @Post('image')
  @Image()
  async image(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: any, // 使用MulterFormData解析请求正文中的表单数据
  ) {
    console.log('file', file)
    return await this.aliossService.aliUploadFile(file)
  }
  @Post('mulUpload')
  @File()
  async mulUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body() formData: any, // 使用MulterFormData解析请求正文中的表单数据
  ) {
    console.log('file', file)
    return await this.aliossService.multipartUpload(file)
  }

  @Get('getInitMultipartUploadId')
  async initMultipartUpload(@Query('name') name?: string) {
    return await this.aliossService.getInitMultipartUploadId(name)
  }

  @Post('uploadPart')
  // @File()
  @UseInterceptors(FileInterceptor('file'))
  async uploadPart(@UploadedFile() file: Express.Multer.File, @Body() formData: any) {
    // console.log('formData', formData)
    // console.log('file', file)
    return await this.aliossService.uploadPartFunc(formData, file)
  }

  @Post('completeMul')
  async completeMul(@Body() bodyDta: any) {
    return await this.aliossService.completeMultipartUpload(bodyDta)
  }

  // 基本上传
  @Post('uploadBase')
  @UseInterceptors(FileInterceptor('file'))
  async baseUpload(@UploadedFile() file: Express.Multer.File, @Body() formData: any) {
    return await this.aliossService.baseUpload(file, formData)
  }
}
