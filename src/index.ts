import io from 'socket.io-client'
import { argv } from 'yargs'
import { P2PHost } from './rpc/p2p'
import { SRVHost } from './rpc/srv'
import { RPCGetEnvs } from './rpc/api'
import { LizClientActive, RPCStartLizServer, LizClientPassive } from './liz'
import { RPCGetMappedAddress, RPCSendMessage } from './nat'

const self = argv.device as string

const socket = io('http://api.zhangzisu.cn:8080', { query: { deviceID: self } })

socket.on('connect', () => {
  console.log('connected!')
})

const p2p = new P2PHost(self, (msg) => socket.emit('p2p-rpc', msg))
socket.on('p2p-rpc', p2p.input.bind(p2p))
p2p.register('get_envs', RPCGetEnvs)
p2p.register('start_liz_srv', RPCStartLizServer)
p2p.register('get_mapped_address', RPCGetMappedAddress)
p2p.register('send_message', RPCSendMessage)

const srv = new SRVHost((msg) => socket.emit('srv-rpc', msg))
socket.on('srv-rpc', srv.input.bind(srv))

srv.invoke('list_devices', undefined, (r) => {
  console.log('List of devices:')
  console.table(r)
})

if (argv.connectActive) {
  LizClientActive(argv.connectActive as string, ':4080', {}, p2p)
    .then(() => {
      console.log('started')
    })
    .catch((e: any) => {
      console.log(e)
    })
}

if (argv.connectPassive) {
  LizClientPassive(argv.connectPassive as string, ':4080', {}, p2p)
    .then(() => {
      console.log('started')
    })
    .catch((e: any) => {
      console.log(e)
    })
}
