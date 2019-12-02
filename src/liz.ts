import { generate } from 'randomstring'
import { P2PHost } from './rpc/p2p'
import { GetMappedAddress, SendMessage, ParseAddr, IMappedAddress } from './nat'
import { startLizClient, startLizServer } from '@zhangzisu/liz'

export async function RPCStartLizServer (deviceID: string, arg: any) {
  console.log(`${deviceID} RPCStartLizServer`)
  const { key, cfg, port } = arg
  if (typeof key !== 'string') throw new Error('Bad Arg: key')
  if (typeof cfg !== 'object') throw new Error('Bad Arg: cfg')
  if (typeof port !== 'number') throw new Error('Bad Arg: port')
  const pid = startLizServer({ bind: `:${port}`, key, ...cfg })
  console.log('LizServer started pid: ' + pid)
}

export async function LizClientActive (deviceID: string, listen: string, baseCfg: {}, rpc: P2PHost) {
  const key = generate(20)
  console.log('Using password ' + key)

  const cfg = { key, ...baseCfg }

  const local = await GetMappedAddress()
  const remote: IMappedAddress = await rpc.invokeAsync(deviceID, 'get_mapped_address')
  const localBind = ParseAddr(local.bind)
  const remoteBind = ParseAddr(remote.bind)
  await SendMessage('SB666!', 5, 100, localBind.port, remote.mapped)
  await rpc.invokeAsync(deviceID, 'send_message', { msg: 'SB233!', repeat: 5, interval: 100, port: remoteBind.port, remote: local.mapped })
  await rpc.invokeAsync(deviceID, 'start_liz_srv', { key, cfg, port: remoteBind.port })
  const pid = startLizClient({ bind: `:${localBind.port}`, target: remote.mapped, listen: listen, ...cfg })
  console.log('LizClient started pid: ' + pid)
}

export async function LizClientPassive (deviceID: string, listen: string, baseCfg: {}, rpc: P2PHost) {
  const key = generate(20)
  console.log('Using password ' + key)

  const cfg = { key, ...baseCfg }

  const local = await GetMappedAddress()
  const remote: IMappedAddress = await rpc.invokeAsync(deviceID, 'get_mapped_address')
  const localBind = ParseAddr(local.bind)
  const remoteBind = ParseAddr(remote.bind)
  await rpc.invokeAsync(deviceID, 'send_message', { msg: 'SB233!', repeat: 5, interval: 100, port: remoteBind.port, remote: local.mapped })
  await SendMessage('SB666!', 5, 100, localBind.port, remote.mapped)
  await rpc.invokeAsync(deviceID, 'start_liz_srv', { key, cfg, port: remoteBind.port })
  const pid = startLizClient({ bind: `:${localBind.port}`, target: remote.mapped, listen: listen, ...cfg })
  console.log('LizClient started pid: ' + pid)
}
