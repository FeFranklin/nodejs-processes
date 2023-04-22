import { pipeline } from 'stream/promises'
import { Writable, Transform } from 'stream'
import { createReadStream } from 'fs'
import csvtojson from 'csvtojson'
import { setTimeout } from 'timers/promises'

const database = process.argv[2]

async function onMessage (msg) {

  const existingNames = new Set()

  await pipeline(
    createReadStream(database),
    csvtojson(),
    Transform({
      transform(chunk, enc, cb) {
        const data = JSON.parse(chunk)
        if (data.Name !== msg.Name) return cb()

        if (existingNames.has(msg.Name)) {
          return cb(null, msg.Name)
        }

        existingNames.add(msg.Name)
        cb()
      }
    }),
    Writable({
      write(chunk, enc, cb) {
        if (!chunk) return cb()

        process.send(chunk.toString())
        cb()
      }
    })
  )
}

process.on('message', onMessage)

// process.on('message', msg => console.log('msg from child', msg.Name))
// console.log(`I am ready ${process.pid}`)

// killing processes after inactivity
await setTimeout(5000)
process.channel.unref()