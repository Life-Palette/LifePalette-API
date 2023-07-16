import { PrismaService } from '@/prisma/prisma.service'
import { Injectable, BadRequestException } from '@nestjs/common'
import { CreateTagDto } from './dto/create-tag.dto'
import { UpdateTagDto } from './dto/update-tag.dto'
import { getFileurl, paginateT } from '@/helper'

@Injectable()
export class TagService {
  constructor(private readonly prisma: PrismaService) {}
  create(createTagDto: CreateTagDto) {
    return this.prisma.tag.create({
      data: { title: createTagDto.title, cover: createTagDto.cover, thumbnailPath: createTagDto.thumbnailPath },
    })
  }

  async findAll(page: number, pSize: number, sort: string, title?: string, tagId?: number) {
    const where = {}
    title && (where['title'] = { contains: title })
    // content && (where['content'] = { contains: content })
    tagId && (where['TopicTag'] = { some: { tagId } })

    const sortWay = sort.split(',').find((item) => ['desc', 'asc'].includes(item)) || 'desc'
    const sortField = sort.split(',').find((item) => !['desc', 'asc'].includes(item)) || 'createdAt'
    const data = await this.prisma.tag.findMany({
      skip: (page - 1) * pSize,
      take: pSize,
      orderBy: { [sortField]: sortWay },
    })
    const baseData = data.map((item) => {
      return {
        ...item,
        cover: item.cover ? getFileurl(item.cover) : '',
        coverPath: item.cover,
        thumbnail: item.thumbnailPath ? getFileurl(item.thumbnailPath) : '',
      }
    })
    const total = await this.prisma.tag.count({ where })
    return paginateT({ page, data: baseData, size: pSize, total })
  }

  findOne(id: number) {
    return this.prisma.tag.findUnique({
      where: { id },
    })
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    return this.prisma.tag
      .findMany({
        where: { title: updateTagDto.title, id: { not: id } },
      })
      .then((res) => {
        if (res.length) {
          // return Promise.reject('标签名已存在')
          // throw new Error('标签名已存在')
          throw new BadRequestException({
            code: 400,
            message: '标签名已存在',
            result: null,
            timestamp: Date.now(),
          })
        } else {
          return this.prisma.tag.update({
            where: { id },
            data: updateTagDto,
          })
        }
      })
  }

  remove(id: number) {
    return this.prisma.tag.delete({ where: { id } })
  }
}
