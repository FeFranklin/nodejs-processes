// https://images.contentstack.io/v3/assets/bltb6530b271fddd0b1/bltceaa6cf20d328bd5/5eb7cdc1b1f2e27c950d2aaa/V_AGENTS_587x900_Jett.png
// https://juststickers.in/wp-content/uploads/2020/12/jett-pixelart.png

// backgorunds
// https://funilrys.com/user/pages/programming/javascript/random-background/abstract.jpg
// https://static.vecteezy.com/system/resources/previews/003/322/066/original/pastel-colour-shape-abstract-background-with-blue-green-yellow-free-vector.jpg
// https://img.freepik.com/free-vector/retro-styled-pattern-background_1048-6593.jpg

import { createServer } from 'http'
import { parse,fileURLToPath } from 'url'
import { Worker } from 'worker_threads'
import { dirname } from 'path'
import sharp from 'sharp'

const currentForlder = dirname(fileURLToPath(import.meta.url))
const workerFilename = 'worker.js'

async function joinImages (images) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(`${currentForlder}/${workerFilename}`)
    worker.postMessage(images)
    worker.once('message', resolve)
    worker.once('error', reject)
    worker.once('exit', code => {
      if (code !== 0 ) {
        return reject(new Error(`Thread ${worker.threadId} stopped with exit code ${code}`))
      }

      console.log(`the thread ${worker.threadId} exited.`)
    })
  })
}

async function handler (req, res) {
  if (req.url.includes('joinImages')) {
    const { query: { img, bg }} = parse(req.url, true)
    const imgBase64 = await joinImages({
      img,
      bg
    })

    res.writeHead(200, {
      'Content-Type': 'text/html'
    })

    res.end(`<img style="width:100%;height:100%" src="data:image/jpeg;base64,${imgBase64}" />`)
    return
  }

  return res.end('ok')
}

createServer(handler).listen(3000, () => console.log('listenning on 3000.'))

// query working example
// http://localhost:3000/joinImages?img=https://static.wikia.nocookie.net/mkwikia/images/e/ee/Predator_render.png&bg=https://wallpaperaccess.com/full/3057585.jpg