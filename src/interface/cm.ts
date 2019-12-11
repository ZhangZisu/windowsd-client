import { AddressInfo } from 'net'
import { invokeRemote } from '../rpc/host'
import { get } from 'request-promise-native'

export const endpoints: Map<string, AddressInfo> = new Map()

export async function updateDevice (id: string) {
  try {
    const eps = <AddressInfo[]> await invokeRemote('endpoints', {}, { target: id })
    for (const ep of eps) {
      if (await testConn(ep, id)) {
        endpoints.set(id, ep)
        return
      }
    }
  } catch (e) {
    endpoints.delete(id)
  }
}

async function testConn (endpoint: AddressInfo, id: string) {
  try {
    const result = <boolean> await get(`/${id}`, { host: endpoint.address, port: endpoint.port, json: true })
    return result
  } catch (e) {
    return false
  }
}
