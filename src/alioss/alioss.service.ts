import { upload } from './../config/upload'
import { Injectable } from '@nestjs/common'
import { CreateAliossDto } from './dto/create-alioss.dto'
import { UpdateAliossDto } from './dto/update-alioss.dto'
import Client from 'ali-oss'
import dayjs from 'dayjs'
import OSS from 'ali-oss'

@Injectable()
export class AliossService {
  private client: any
  public constructor() {
    this.client = new OSS({
      region: '****',
      accessKeyId: '****',
      accessKeySecret: 'R****',
      bucket: 'nest-js',
      cname: true,
      endpoint: 'nest-js.oss-accelerate.aliyuncs.com',
    })
  }

  /**
   * 上传文件
   * @param localPath
   * @param ossPath
   * @param size
   */
  public async uploadFile(localPath: string, ossPath: string, size: number): Promise<string> {
    if (size > 5 * 1024 * 1024) {
      // 设置MB
      return await this.resumeUpload(ossPath, localPath)
    } else {
      return await this.upload(ossPath, localPath)
    }
  }
  // oss put上传文件
  private async upload(ossPath: string, localPath: string): Promise<string> {
    let res
    try {
      res = await this.client.put(ossPath, localPath)
      // 将文件设置为公共可读
      await this.client.putACL(ossPath, 'public-read')
    } catch (error) {
      console.log(error)
    }
    return res.url
  }

  // oss put上传文件，直接传入file
  public async aliUploadFile(file: Express.Multer.File): Promise<any> {
    const nowDay = dayjs().format('YYYY-MM-DD')
    const ossPath = `/nestDev/${nowDay}/-${file.originalname}`

    const res = await this.client.put(ossPath, file.buffer)
    // console.log('res', res)
    const { url, name } = res
    // 将文件设置为公共可读
    await this.client.putACL(ossPath, 'public-read')
    const result = {
      url,
      name,
    }
    return result
  }
  // oss 分片上传文件
  public async multipartUpload(file: Express.Multer.File): Promise<any> {
    const nowDay = dayjs().format('YYYY-MM-DD')
    const ossPath = `/nestDev/${nowDay}/-${file.originalname}`
    const res = await this.client.multipartUpload(ossPath, file.buffer, {
      async progress(percent: number, cpt: any) {
        console.log('percent', percent)
        console.log('cpt', cpt)
      },
    })
    console.log('res', res)
    const { url, name } = res
    // 将文件设置为公共可读
    await this.client.putACL(ossPath, 'public-read')
    const result = {
      url,
      name,
    }
    return result
  }

  // oss 断点上传
  private async resumeUpload(ossPath: string, localPath: string) {
    let checkpoint: any = 0
    let bRet = ''
    for (let i = 0; i < 3; i++) {
      try {
        let result = this.client.get().multipartUpload(ossPath, localPath, {
          checkpoint,
          async progress(percent: number, cpt: any) {
            checkpoint = cpt
          },
        })
        // 将文件设置为公共可读
        await this.client.putACL(ossPath, 'public-read')
        bRet = result.url
        break
      } catch (error) {
        // console.log(error)
      }
    }
    console.log('resumeUpload:::::', bRet)
    return bRet
  }
  /**
   * 删除一个文件
   */
  public async deleteOne(filepath: string) {
    if (filepath == null) {
      return
    }
    try {
      let result = this.client.delete(filepath)
    } catch (e) {
      console.log(e)
    }
  }

  /**
   * 删除多个文件
   * @param filepathArr
   */
  public async deleteMulti(filepathArr: string[]): Promise<void> {
    try {
      let result = this.client.deleteMulti(filepathArr, { quiet: true })
      // console.log(result);
    } catch (e) {
      console.log(e)
    }
  }
  /**
   * 获取文件的url
   * @param filePath
   */
  public async getFileSignatureUrl(filePath: string): Promise<string> {
    if (filePath == null) {
      console.log('get file signature failed: file name can not be empty')
      return null
    }
    let result = ''
    try {
      result = this.client.signatureUrl(filePath, { expires: 36000 })
    } catch (err) {
      console.log(err)
    }

    return result
  }
  // 判断文件是否存在
  public async existObject(ossPath: string): Promise<boolean> {
    try {
      let result = this.client.get(ossPath)
      if (result.res.status == 200) {
        return true
      }
    } catch (e) {
      if (e.code == 'NoSuchKey') {
        return false
      }
    }
    return false
  }
  // 上传照片
  async uploadImage(file: any): Promise<any> {
    console.log('file', file)
    try {
      const ossUrl = await this.upload(`/nestDev/${file.originalname}`, `E:/Upload/image/${file.originalname}`)
      console.log('ossUrl', ossUrl)
      return {
        code: 200,
        data: ossUrl,
        message: '上传成功',
      }
    } catch (error) {
      return {
        code: 503,
        msg: `Service error: ${error}`,
      }
    }
  }

  // 分片上传.initMultipartUpload、.uploadPart以及.completeMultipartUpload方法。
  public async getInitMultipartUploadId(bodyDta: any): Promise<any> {
    // console.log('bodyDta', bodyDta)
    const { name } = bodyDta
    const tempName = `nestDev/${bodyDta}`
    const res = await this.client.initMultipartUpload(tempName)
    const { uploadId } = res
    // console.log('res', res)
    return {
      code: 200,
      data: {
        uploadId,
        name,
      },
      message: '上传成功',
    }
  }
  public async uploadPartFunc(formData: any, fileP): Promise<any> {
    // console.log('fileP', fileP)
    // console.log('formData', formData)
    const { name, uploadId, chunk, file, start, end } = formData
    // console.log('file', file)
    const tempName = `nestDev/${name}`
    // console.log('tempName', tempName)
    const partNum = +chunk + 1
    const res = await this.client.uploadPart(tempName, uploadId, partNum, fileP.buffer).catch((err) => {
      console.log('err', err)
    })
    // const res = await this.client.uploadPart(tempName, uploadId, partNum, fileP.buffer, start, end).catch((err) => {
    //   console.log('err', err)
    // })
    // const res = await this.client.uploadPart(tempName, uploadId, 1, fileP.buffer)
    // const res = {} as any
    // console.log('res', res)
    // console.log('res', res.res.etag)
    const { etag } = res || {}
    return {
      code: 200,
      data: {
        etag,
      },
      message: '上传成功',
    }
  }

  // completeMultipartUpload
  public async completeMultipartUpload(bodyDta: any): Promise<any> {
    // console.log('bodyDta', bodyDta)
    const { name, uploadId, etags } = bodyDta
    const tempName = `nestDev/${name}`
    const result = await this.client.completeMultipartUpload(tempName, uploadId, etags)

    const {
      res: { statusCode, requestUrls },
    } = result || {}
    // console.log('result', result)

    if (statusCode === 200) {
      // console.log('requestUrls', requestUrls, tempName)
      await this.client.putACL(tempName, 'public-read')
    }

    const returnData = requestUrls[0].split('?')[0] || null

    // 根据name判断文件类型，如果是图片，就返回指定比例的缩略图，如果是视频，就返回视频的第一帧图
    const isImage = name.match(/\.(jpg|jpeg|png|gif)$/i)
    const isVideo = name.match(/\.(mp4|avi|rmvb|rm|asf|divx|mpg|mpeg|mpe|wmv|mkv|vob)$/i)
    const extra = {}
    if (isImage) {
      extra['thumbnail'] = `${returnData}?x-oss-process=image/resize,l_500`
    } else if (isVideo) {
      extra['cover'] = `${returnData}?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`
    }
    return {
      code: 200,
      data: {
        file: returnData,
        fileType: isImage ? 'IMAGE' : isVideo ? 'VIDEO' : 'OTHER',
        ...extra,
      },
      message: '上传成功',
    }
  }

  create(createAliossDto: CreateAliossDto) {
    return 'This action adds a new alioss'
  }

  findAll() {
    return `This action returns all alioss`
  }

  findOne(id: number) {
    return `This action returns a #${id} alioss`
  }

  update(id: number, updateAliossDto: UpdateAliossDto) {
    return `This action updates a #${id} alioss`
  }

  remove(id: number) {
    return `This action removes a #${id} alioss`
  }
  async getSignature() {
    const config = {
      // 填写你自己的 AccessKey
      accessKeyId: 'LTAI5tN5PnDYug4UQLwuuVha',
      accessKeySecret: 'RhAYCMyDwS8fJb6fjQUhNUslk42hX2',
      // 存储桶名字
      bucket: 'suqiqi',
      // 文件存储路径
      dir: 'test/',
    }

    const client = new Client(config)

    const date = new Date()
    // 时长加 1 天，作为签名的有限期
    date.setDate(date.getDate() + 1)

    const policy = {
      // 设置签名的有效期，格式为Unix时间戳
      expiration: date.toISOString(),
      conditions: [
        ['content-length-range', 0, 10485760000], // 设置上传文件的大小限制
      ],
    }

    // 生成签名，策略等信息
    const formData = client.calculatePostSignature(policy)

    // 生成 bucket 域名，客户端将向此地址发送请求
    const location = await client.getBucketLocation(config.bucket)
    const host = `http://${config.bucket}.${location.location}.aliyuncs.com`

    // 响应给客户端的签名和策略等信息
    return {
      expire: dayjs().add(1, 'days').unix().toString(),
      policy: formData.policy,
      signature: formData.Signature,
      accessId: formData.OSSAccessKeyId,
      host,
      dir: config.dir,
    }
  }

  // aliOssUpload()
  async aliOssUpload(file) {}

  // uniappUpload() 传入file: (binary)
  async baseUpload(file: Express.Multer.File, bodyDta: any): Promise<any> {
    // console.log('🦄-----file-----', file)
    const { originalname } = file
    const ossPath = `/nestDev/uniapp/${originalname}`
    const result = await this.client.put(ossPath, file.buffer)

    const {
      res: { statusCode, requestUrls },
    } = result || {}
    if (statusCode === 200) {
      // 将文件设置为公共可读
      await this.client.putACL(ossPath, 'public-read')
    }
    const returnData = requestUrls[0].split('?')[0] || null
    const { name } = result
    // console.log('🌳-----name-----', name)
    // console.log('🦄-----returnData-----', returnData)

    // 根据name判断文件类型，如果是图片，就返回指定比例的缩略图，如果是视频，就返回视频的第一帧图
    const isImage = name.match(/\.(jpg|jpeg|png|gif)$/i)
    const isVideo = name.match(/\.(mp4|avi|rmvb|rm|asf|divx|mpg|mpeg|mpe|wmv|mkv|vob)$/i)
    const extra = {}
    if (isImage) {
      extra['thumbnail'] = `${returnData}?x-oss-process=image/resize,l_500`
    } else if (isVideo) {
      extra['cover'] = `${returnData}?x-oss-process=video/snapshot,t_7000,f_jpg,w_0,h_0,m_fast`
    }
    return {
      code: 200,
      data: {
        file: returnData,
        fileType: isImage ? 'IMAGE' : isVideo ? 'VIDEO' : 'OTHER',
        ...extra,
      },
      message: '上传成功',
    }
  }
}
