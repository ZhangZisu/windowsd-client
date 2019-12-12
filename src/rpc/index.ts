import uuid from 'uuid/v4'
import { sendRPC } from '../transport'
import { invokeLocal } from '../plugin/host'

type RPCCallback = (result: any, error?: Error) => void

const cbs: Map<string, RPCCallback> = new Map()

/**
 * This function is used to handle remote sent messages
 * @param msg
 */
export async function handleRemote (msg: any) {
  if (msg instanceof Array) {
    if (msg.length === 4) {
      // Request
      const [asyncID, method, args, cfg] = msg
      return handleRequest(asyncID, method, args, cfg)
    } else if (msg.length === 3) {
      // Response
      const [asyncID, result, errstr] = msg
      return handleResponse(asyncID, result, errstr)
    }
  }
}

function handleRequest (asyncID: string, method: string, args: any, cfg: any) {
  invokeLocal(method, args, cfg).then(result => {
    sendRPC([asyncID, result, null])
  }).catch(error => {
    sendRPC([asyncID, null, error.toString()])
  })
}

function handleResponse (asyncID: string, result: any, errstr: any) {
  const cb = cbs.get(asyncID)
  if (!cb) {
    console.log(`Missed response: ${asyncID}`)
    return
  }
  if (typeof errstr === 'string') return cb(result, new Error(errstr))
  return cb(result)
}

/**
 * invoke a remote function \
 * All args will be forwarded to windowsd-server \
 * A Remote RPC Call will be generated
 * @param method
 * @param args
 * @param cfg
 */
export function invokeRemote (method: string, args: any, cfg: any) {
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
