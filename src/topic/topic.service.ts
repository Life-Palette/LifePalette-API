import { ConfigType } from '@nestjs/config'
import { PrismaService } from './../prisma/prisma.service'
import { Inject, Injectable } from '@nestjs/common'
import { CreateTopicDto } from './dto/create-topic.dto'
import { UpdateTopicDto } from './dto/update-topic.dto'
import { app } from '@/config/app'
import { paginateT } from '@/helper'
import { User } from '@prisma/client'
import _ from 'lodash'
import { getFileurl } from '@/helper'

@Injectable()
export class TopicService {
  constructor(private readonly prisma: PrismaService, @Inject(app.KEY) private appConfig: ConfigType<typeof app>) {}
  create(createTopicDto: CreateTopicDto, user: User) {
    const { tagIds } = createTopicDto
    const topicData = {
      ...createTopicDto,
      userId: user.id,
    }
    // 如果没有传tagIds，则默认加上1
    !tagIds && (topicData['TopicTag'] = { create: [{ tagId: 1 }] })
    tagIds && (topicData['TopicTag'] = { create: tagIds.map((tagId) => ({ tagId: +tagId })) })
    if (topicData.tagIds) {
      delete topicData.tagIds
    }
    return this.prisma.topic.create({
      data: topicData,
    })
  }

  async findAll(page: number, pSize: number, sort: string, title?: string, tagId?: number, keywords?: string) {
    const where = {}
    title && (where['title'] = { contains: title })
    // content && (where['content'] = { contains: content })
    tagId && (where['TopicTag'] = { some: { tagId } })
    keywords &&
      (where['OR'] = [
        { title: { contains: keywords } },
        { content: { contains: keywords } }
      ])

    const sortWay = sort.split(',').find((item) => ['desc', 'asc'].includes(item)) || 'desc'
    const sortField = sort.split(',').find((item) => !['desc', 'asc'].includes(item)) || 'createdAt'

    const data = await this.prisma.topic.findMany({
      skip: (page - 1) * pSize,
      take: pSize,
      orderBy: { [sortField]: sortWay },
      where,
      include: {
        User: {
          select: { id: true, name: true, avatar: true },
        },
        TopicTag: true,
      },
    })

    const newData = data.map(async (item) => {
      const filesTemp = item.files ? item.files : []
      const fileList = Array.isArray(filesTemp) ? filesTemp : [filesTemp]
      // console.log('item',item)
      // tag
      const tags = item.TopicTag.map((item) => item.tagId)
      const tagList = await this.prisma.tag.findMany({ where: { id: { in: tags } } })

      return {
        ...item,
        files: fileList,
        tags: tagList,
      }
    })
    const total = await this.prisma.topic.count({ where })
    const pagedata = await Promise.all(newData)
    return paginateT({ page, data: pagedata, size: pSize, total })
  }

  async findOne(id: number, userId?: number) {
    const baseData = await this.prisma.topic.findUnique({
      where: { id },
      include: {
        User: { select: { id: true, avatar: true, name: true } },
        comments: true,
        likes: true,
        collections: true,
        TopicTag: true,
      },
    })
    // 获取tag名称，现在只有tagTd
    const tags = baseData.TopicTag.map((item) => item.tagId)
    const tagList = await this.prisma.tag.findMany({ where: { id: { in: tags } } })

    // baseData.cover = baseData.cover ? getFileurl(baseData.cover) : ''
    const filesTemp = baseData.files ? baseData.files : []
    const fileList = Array.isArray(filesTemp) ? filesTemp : [filesTemp]
    const like =
      userId &&
      (await this.prisma.like.findFirst({
        where: { topicId: id, userId },
      }))
    const newData = {
      ...baseData,
      files: fileList,
      like: !!like,
      tags: tagList,
    }
    return newData
  }

  async update(id: number, updateTopicDto: UpdateTopicDto) {
    const baseData = await this.prisma.topic.update({
      where: { id },
      data: { ..._.pick(updateTopicDto, ['title', 'content', 'files']) },
    })
    const filesTemp = baseData.files ? baseData.files : []
    const fileList = Array.isArray(filesTemp) ? filesTemp : [filesTemp]
    const files = fileList.map((item: any) => {
      const baseData = {
        file: getFileurl(item.filePath),
        filePath: item.filePath,
      }
      if (item.thumbnailPath) {
        baseData['thumbnailUrl'] = getFileurl(item.thumbnailPath)
        baseData['thumbnailPath'] = item.thumbnailPath
      }
      return baseData
    })
    return {
      ...baseData,
      files,
    }
  }

  remove(id: number) {
    return this.prisma.topic.delete({ where: { id } })
  }

  async removeMany(ids: number[]) {
    if (ids.length === 0) {
      throw new Error('Empty ID list')
    }
    const deleteTempIds = JSON.parse(JSON.stringify(ids))
    const deleteIds = deleteTempIds.ids || []
    const idList = deleteIds.map((item) => parseInt(item))
    // console.log('idlist', idList)
    const deleteResult = await this.prisma.topic.deleteMany({ where: { id: { in: idList } } }).catch((err) => {
      throw new Error(err)
    })

    if (deleteResult.count !== idList.length) {
      throw new Error(`Failed to delete ${idList.length - deleteResult.count} topics`)
    } else {
      return deleteResult
    }
  }
}
