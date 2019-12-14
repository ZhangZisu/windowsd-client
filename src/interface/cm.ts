import { get } from 'request-promise-native'

import { logInterfaceCM, beautifyUUID } from '@/shared/logger'
import { invoke, localHost } from '@/router'
import { bus } from '@/shared/bus'

export const endpoints: Map<string, string> = new Map()
export const lazyTimeouts: Map<string, NodeJS.Timeout> = new Map()

const lazyDelay = 500 // 0.5s

function cancelDeviceUpdate (id: string) {
  const timeout = lazyTimeouts.get(id)
  timeout && clearTimeout(timeout)
}

export function updateDeviceLazy (id: string) {
  cancelDeviceUpdate(id)
  lazyTimeouts.set(id, setTimeout(updateDevice, lazyDelay, id))
}

export async function updateDevice (id: string) {
  logInterfaceCM('update', beautifyUUID(id))
  try {
    const eps = <string[]> await invoke('endpoints', {}, { target: id })
    for (const ep of eps) {
      if (await testConn(ep, id)) {
        endpoints.set(id, ep)
        logInterfaceCM(beautifyUUID(id), '->', ep)
        return
      }
    }
  } catch (e) {
    endpoints.delete(id)
  }
}

async function testConn (endpoint: string, id: string) {
  try {
    const result = <boolean> await get(`http://${endpoint}/${id}`, { json: true, timeout: 1000 })
    return result
  } catch (e) {
    return false
  }
}

bus.on('system', (msg) => {
  if (msg.event === 'online' || msg.event === 'offline') {
    const deviceID = <string>msg.deviceID
    updateDeviceLazy(deviceID)
  }
})

localHost.builtin.register('update_ep', async function (args) {
  const { device, alter } = args
  if (typeof device !== 'string') throw new Error('Bad Arg: device')
  if (alter && typeof alter !== 'string') throw new Error('Bad Arg: alter')
  if (alter) {
    cancelDeviceUpdate(device)
    if (await testConn(alter, device)) {
      endpoints.set(device, alter)
      logInterfaceCM(beautifyUUID(device), '->', alter)
      return true
    }
    return false
  } else {
    updateDeviceLazy(device)
    return true
  }
})
