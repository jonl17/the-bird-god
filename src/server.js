import Fastify from 'fastify'
import fs, { readFileSync } from 'fs'
import { readFilesFromDir } from './utils.js'

// const result = JSON.parse(fs.readFileSync('./src/tweets/war_tweets.json'))

const fastify = Fastify({
  logger: true,
})

const path = 'src/new-tweets/'

fastify.get('/all-tweets', async (reqeust, reply) => {
  await fs.readdir(path, (err, files) => {
    if (err) {
      console.log(err)
    } else {
      return reply.send(files)
    }
  })
})

fastify.get('/all-tweets/:filename', async (request, reply) => {
  const files = await fs.readdir(path, (err, files) => {
    if (err) {
      throw new Error('not found mac')
    } else {
      const file = files.find((file) => file === request.params.filename)
      if (!file) {
        reply.send('not found maco, probably typo: ', request.params.filename)
      } else {
        reply.send(JSON.parse(fs.readFileSync(`${path}${file}`)))
      }
    }
  })
})

// Run the server!
fastify.listen(3333, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})
