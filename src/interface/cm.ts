import { get } from 'request-promise-native'

import { logInterfaceCM } from '@/shared/logger'
import { invoke, localHost } from '@/router'
import { bus } from '@/shared/bus'

export const endpoints: Map<string, string> = new Map()
export const lazyTimeouts: Map<string, { timeout: NodeJS.Timeout, running: boolean }> = new Map()

const lazyDelay = 500 // 0.5s

export function updateDevice (id: string, eps?: string[]) {
  const info = lazyTimeouts.get(id)
  if (info) {
    if (info.running) return
    clearTimeout(info.timeout)
  }
  lazyTimeouts.set(id, {
    timeout: setTimeout(async () => {
      lazyTimeouts.get(id)!.running = true
      logInterfaceCM('update', id)
      try {
        eps = eps || <string[]> await invoke('endpoints', {}, { t: id })
        try {
          await Promise.all(eps.map(ep => trickyTestConn(ep, id)))
          logInterfaceCM(id, '-?')
        } catch (ep) {
          endpoints.set(id, ep)
          logInterfaceCM(id, '->', ep)
        }
      } catch (e) {
        logInterfaceCM(id, 'offline')
      } finally {
        lazyTimeouts.delete(id)
      }
    }, lazyDelay),
    running: false
  })
}

async function trickyTestConn (endpoint: string, id: string) {
  let result: boolean
  try {
    result = await get(`http://${endpoint}/${id}`, { json: true, timeout: 1000 })
  } catch (e) {
    // logInterfaceCM('Test', endpoint, 'failed')
    return
  }
  if (typeof result === 'boolean' && result) throw endpoint // That's the trick
}

bus.on('system', (msg) => {
  if (msg.event === 'online' || msg.event === 'offline') {
    const deviceID = <string>msg.deviceID
    updateDevice(deviceID)
  }
})

localHost.builtin.register('update_ep', async function (args) {
  const { device, alter } = args
  if (typeof device !== 'string') throw new Error('Bad Arg: device')
  if (alter && typeof alter !== 'string') throw new Error('Bad Arg: alter')
  if (alter) {
    updateDevice(device, [alter])
    return true
  } else {
    updateDevice(device)
    return true
  }
})
