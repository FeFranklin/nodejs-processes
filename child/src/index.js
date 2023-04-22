import { fork } from 'child_process'
import { setTimeout } from 'timers/promises'
import { pipeline } from 'stream/promises'
import { Writable } from 'stream'
import { createReadStream } from 'fs'
import csvtojson from 'csvtojson'

const database = './data/Mock_dataset.csv'
const backgroundTaskdatabase = './src/backgroundTask.js'
const PROCESS_COUNT = 10
const replications = []
const processes = new Map()
for (let i = 0; i < PROCESS_COUNT; i++) {
  const child = fork(backgroundTaskdatabase, [database])
  child.on('exit', () => {
    console.log(`process ${child.pid} exited.`)
    processes.delete(child.pid)
  })
  child.on('error', error => {
    console.log(`process ${child.pid} has an error.`, error)
    process.exit
  })

  child.on('message', msg => {
    if (replications.includes(msg)) return
    
    replications.push(msg)
    console.log(`${msg} is duplicated.`)
  })
  // await setTimeout(100)
  // child.send('Hello world')
  processes.set(child.pid, child)
}

function roundRobin (array, index = 0) {
  return function () {
    if (index >= array.length) {
      index = 0
    }

    return array[index++]
  }
}

// for (let i = 0; i < 100; i++) {
//   console.count(getProcess().pid)
// }
const getProcess = roundRobin([...processes.values()])
console.log(`starting with ${processes.size} processes`)

await setTimeout(100)
await pipeline(
  createReadStream(database),
  csvtojson(),
  Writable({
    write(chunk, enc, cb) {
      const chosenProcess = getProcess()
      chosenProcess.send(JSON.parse(chunk))
      cb()
    }
  })
)