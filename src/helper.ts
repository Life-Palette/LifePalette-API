export const success = (message: string, data: any = {}, code = 0) => {
  return { message, data, code }
}

export const paginate = (data: { page: number; total: number; row: number; data: any[] }) => {
  return {
    data: {
      meta: {
        current_page: data.page,
        row: data.row,
        total: data.total,
        page_row: Math.ceil(data.total / data.row),
      },
      data: data.data,
    },
  }
}
export const paginateT = (data: { page: number; total: number; size: number; data: any[] }) => {
  return {
    data: {
      meta: {
        current_page: data.page,
        size: data.size,
        totalElements: data.total,
        totalPages: Math.ceil(data.total / data.size),
      },
      data: data.data,
    },
  }
}

export const getFileurl = (url: any, isNeedPathName = true) => {
  if (Array.isArray(url)) {
    return url.map((item) => getFileurl(item, isNeedPathName))
  }
  return `${process.env.URL}${isNeedPathName ? '/uploads/' : '/'}${url.replace(/\\/g, '/')}`
}

export const uploadParams = (file: Express.Multer.File, thumbnailPath?: string) => {
  const baseThumbnailPath = thumbnailPath ? thumbnailPath.replace('uploads/', '') : null
  return {
    file: getFileurl(file.filename),
    filePath: file.filename,
    thumbnail: thumbnailPath ? getFileurl(baseThumbnailPath) : null,
    thumbnailPath: thumbnailPath ? baseThumbnailPath : null,
  }
}

// 生成用户随机名字（用户_随机字符串）
export const randomName = () => {
  return `用户_${Math.random().toString(12).substr(2)}`
}
// 生成随机头像
export const randomAvatar = () => {
  const demoList = ['assets/default/boy.png', 'assets/default/girl.png']
  return getFileurl(demoList[Math.floor(Math.random() * demoList.length)], false)
}
