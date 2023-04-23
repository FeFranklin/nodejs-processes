import { parentPort } from 'worker_threads'
import sharp from 'sharp'
import axios from 'axios'

async function downloadFile(url) {
  const response = await axios.get(url, {
    responseType: 'arraybuffer'
  })

  return response.data
}

async function onMessage({ img, bg }) {
  const firstLayer = await sharp(await downloadFile(img)).toBuffer()

  const bgLayer = await sharp(await downloadFile(bg))
  .composite([
    { input: firstLayer, gravity: sharp.gravity.south }
  ])
  .toBuffer()

  parentPort.postMessage(bgLayer.toString('base64'))

} 



parentPort.on('message', onMessage)