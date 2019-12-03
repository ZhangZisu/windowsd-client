import uuid from 'uuid/v4'
import { cliArgs } from '../cli'
import { serverConn } from '../transport'

type P2POutput = (msg: any) => void
type P2PCallback = (result: any, err: string | undefined) => void
type P2PFunction = (deviceID: string, arg: any) => any

interface P2PRequest {
  m: string
  u: string
  a?: any
  s: string
  t: string
}

interface P2PResponse {
  r?: any
  e?: string
  u: string
  t: string
}

interface P2PContext {
  cb: P2PCallback
}

class P2PHost {
  self: string
  output: P2POutput
  contexts: Map<string, P2PContext>
  functions: Map<string, P2PFunction>

  constructor (self: string, output: P2POutput) {
    this.self = self
    this.output = output
    this.contexts = new Map()
    this.functions = new Map()
  }

  invoke (deviceID: string, method: string, arg: any, cb: P2PCallback) {
    const u = uuid()
    this.contexts.set(u, { cb })
    const req: P2PRequest =
      typeof arg === 'undefined'
        ? { m: method, u, s: this.self, t: deviceID }
        : { m: method, u, a: arg, s: this.self, t: deviceID }
    this.output(req)
  }

  invokeAsync (deviceID: string, method: string, arg?: any) {
    return new Promise<any>((resolve, reject) => {
      this.invoke(deviceID, method, arg, (result, err) => {
        if (err) {
          return reject(err)
        }
        return resolve(result)
      })
    })
  }

  input (msg: any) {
    if ('m' in msg) {
      // P2P Request
      this.handleRequest(msg)
    } else {
      // P2P Response
      this.handleResponse(msg)
    }
  }

  private handleResponse (res: P2PResponse) {
    const ctx = this.contexts.get(res.u)
    if (!ctx) {
      console.log('Missed P2PRPC response: ' + res.u)
      return
    }
    this.contexts.delete(res.u)
    ctx.cb(res.r, res.e)
  }

  private handleRequest (req: P2PRequest) {
    if (this.functions.has(req.m)) {
      Promise.resolve(this.functions.get(req.m)!(req.s, req.a))
        .then(res => {
          if (typeof res !== 'undefined') {
            this.output({ r: res, u: req.u, t: req.s })
          } else {
            this.output({ u: req.u, t: req.s })
          }
        })
        .catch(err => {
          this.output({ e: err.toString(), u: req.u, t: req.s })
        })
    } else {
      this.output({ e: 'No such method', u: req.u, t: req.s })
    }
  }

  register (name: string, func: P2PFunction) {
    if (this.functions.has(name)) throw new Error('Duplicate registeration')
    this.functions.set(name, func)
  }
}

export const p2pHost = new P2PHost(cliArgs.device, (msg) => serverConn.emit('p2p-rpc', msg))
serverConn.on('p2p-rpc', p2pHost.input.bind(p2pHost))
