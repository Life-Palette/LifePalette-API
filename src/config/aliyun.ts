import { registerAs } from '@nestjs/config'

export const aliyun = registerAs('aliyun', () => {
  return {
    access_key: 'LTAI5tQuEYQwBmw6x6fdww4t',
    access_secret: 'kmrJL6KEcjmPPFyVHvZ8FKqXIqGN8D',
    // access_key: process.env.ALIYUN_ACCESS_KEY || '',
    // access_secret: process.env.ALIYUN_ACCESS_SECRET || '',
    sms_sign: '趣寻',
    sms_code_template: 'SMS_220637848',
  }
})
