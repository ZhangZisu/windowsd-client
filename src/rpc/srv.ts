import uuid from 'uuid/v4'
import { serverConn } from '../transport'

type SRVOutput = (msg: any) => void
type SRVCallback = (result: any, err: string | undefined) => void

interface SRVRequest {
  m: string
  u: string
  a?: any
}

interface SRVResponse {
  u: string
  r?: string
  e?: string
}

interface SRVContext {
  cb: SRVCallback
}

class SRVHost {
  output: SRVOutput
  contexts: Map<string, SRVContext>

  constructor (output: SRVOutput) {
    this.output = output
    this.contexts = new Map()
  }

  invoke (method: string, arg: any, cb: SRVCallback) {
    const u = uuid()
    this.contexts.set(u, { cb })
    const req: SRVRequest =
      typeof arg === 'undefined'
        ? { m: method, u }
        : { m: method, u, a: arg }
    this.output(req)
  }

  invokeAsync (method: string, arg?: any) {
    return new Promise<any>((resolve, reject) => {
      this.invoke(method, arg, (result, err) => {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      })
    })
  }

  input (msg: SRVResponse) {
    const ctx = this.contexts.get(msg.u)
    if (!ctx) {
      console.log('Missed SRVRPC response: ' + msg.u)
      return
    }
    this.contexts.delete(msg.u)
    ctx.cb(msg.r, msg.e)
  }
}

export const srvHost = new SRVHost((msg) => serverConn.emit('srv-rpc', msg))
serverConn.on('srv-rpc', srvHost.input.bind(srvHost))
