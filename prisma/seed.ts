import comment from './seed/comment'
import lesson from './seed/lesson'
import system from './seed/system'
import tag from './seed/tag'
import topic from './seed/topic'
import user from './seed/user'
import video from './seed/video'
import like from './seed/like'
import collection from './seed/collection'
// import qr from './seed/qr'
async function run() {
  await user()
  await tag()
  await system()
  await lesson()
  await topic()
  await video()
  await comment()
  await like()
  await collection()
  // await qr()
}

run()
