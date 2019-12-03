import uuid from 'uuid/v4'
import { sendRPC } from '../transport'

type RPCCallback = (result: any, error?: Error) => void

const cbs: Map<string, RPCCallback> = new Map()

export async function handle (msg: any) {
  if (msg instanceof Array) {
    if (msg.length === 4) {
      // Request
      // WIP
    } else if (msg.length === 3) {
      // Response
      const [asyncID, result, errstr] = msg
      const cb = cbs.get(asyncID)
      if (!cb) {
        console.log(`Missed response: ${asyncID}`)
        return
      }
      if (typeof errstr === 'string') cb(result, new Error(errstr))
      return cb(result)
    }
  }
}

export function invoke (method: string, args: any, cfg: any) {
  return new Promise((resolve, reject) => {
    const asyncID = uuid()
    cbs.set(asyncID, (result, error) => {
      cbs.delete(asyncID)
      if (error) return reject(error)
      return resolve(result)
    })
    sendRPC([asyncID, method, args, cfg])
  })
}
