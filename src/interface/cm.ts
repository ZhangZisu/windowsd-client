import { invokeRemote } from '../rpc/host'
import { get } from 'request-promise-native'
import chalk from 'chalk'

const logPrefix = chalk.bgYellow.black('Interface CM')

export const endpoints: Map<string, string> = new Map()
export const lazyTimeouts: Map<string, NodeJS.Timeout> = new Map()

const lazyDelay = 500 // 0.5s

export function updateDeviceLazy (id: string) {
  const timeout = lazyTimeouts.get(id)
  timeout && clearTimeout(timeout)
  lazyTimeouts.set(id, setTimeout(updateDevice, lazyDelay, id))
}

export async function updateDevice (id: string) {
  console.log(logPrefix, 'update', id)
  try {
    const eps = <string[]> await invokeRemote('endpoints', {}, { target: id })
    for (const ep of eps) {
      if (await testConn(ep, id)) {
        endpoints.set(id, ep)
        console.log(logPrefix, id, '->', ep)
        return
      }
    }
  } catch (e) {
    endpoints.delete(id)
    console.log(logPrefix, id, 'removed')
  }
}

async function testConn (endpoint: string, id: string) {
  try {
    const result = <boolean> await get(`/${id}`, { host: endpoint, json: true })
    return result
  } catch (e) {
    return false
  }
}
