import { generate } from 'randomstring'
import { spawn } from 'child_process'
import { P2PHost } from './rpc/p2p'
import { join } from 'path'
import { GetMappedAddress, SendMessage, ParseAddr, IMappedAddress } from './nat'

const binPath = join(__dirname, '..', 'bin')

function getOS () {
  switch (process.platform) {
    case 'win32':return 'windows'
    case 'linux':return 'linux'
    default:return ''
  }
}

function getArch () {
  switch (process.arch) {
    case 'arm': return 'arm'
    case 'arm64': return 'arm64'
    case 'ia32': return '386'
    case 'x32': return '386'
    case 'x64': return 'amd64'
    default: return ''
  }
}

function getBinaryPath (type: 'client' | 'server') {
  let path = join(binPath, `${type}_${getOS()}_${getArch()}`)
  if (process.platform === 'win32') path = path + '.exe'
  return path
}

interface BaseLizConfig {
  crypt?: 'aes' | 'aes-128' | 'aes-192' | 'salsa20' | 'blowfish' | 'twofish' | 'cast5' | '3des' | 'tea' | 'xtea' | 'xor' | 'sm4' | 'none'
  mtu?: number
  sndwnd?: number
  rcvwnd?: number
  ds?: number
  ps?: number
  dscp?: number
  nocomp?: boolean
  acknodelay?: boolean
  nodelay?: number
  interval?: number
  resend?: number
  nc?: number
  sockbuf?: number
  smuxbuf?: number
  streambuf?: number
  keepalive?: number
}

interface LizConfig extends Object, BaseLizConfig {
  key: string
  [key: string]: any
}

const defaultLizConfig: LizConfig = {
  key: 'password',
  crypt: 'aes',
  mtu: 1350,
  sndwnd: 128,
  rcvwnd: 512,
  ds: 10,
  ps: 3,
  dscp: 46,
  nocomp: true,
  acknodelay: false,
  nodelay: 1,
  interval: 10,
  resend: 2,
  nc: 1,
  sockbuf: 4194304,
  smuxbuf: 4194304,
  streambuf: 2097152,
  keepalive: 1
}

function generateGenericArgs (cfg: LizConfig) {
  const args = []
  for (const name in defaultLizConfig) {
    switch (typeof defaultLizConfig[name]) {
      case 'string':
        args.push(`--${name} ${cfg.hasOwnProperty!(name) ? cfg[name] : defaultLizConfig[name]}`)
        break
      case 'number':
        args.push(`--${name} ${cfg.hasOwnProperty!(name) ? cfg[name] : defaultLizConfig[name]}`)
        break
      case 'boolean':
        if (cfg.hasOwnProperty!(name) ? cfg[name] : defaultLizConfig[name]) {
          args.push(`--${name}`)
        }
        break
    }
  }
  return args
}

function generateServerArgs (bind: string, cfg: LizConfig) {
  return [`--bind ${bind}`, ...generateGenericArgs(cfg)]
}

function generateClientArgs (bind: string, target: string, listen: string, cfg: LizConfig) {
  return [`--bind ${bind}`, `--target ${target}`, `--listen ${listen}`, ...generateGenericArgs(cfg)]
}

function startLizServer (bind: string, cfg: LizConfig) {
  const binary = getBinaryPath('server')
  const args = generateServerArgs(bind, cfg)
  const cp = spawn(binary, args, { detached: true, stdio: 'ignore', shell: true })
  cp.unref()
}

function startLizClient (bind: string, target: string, listen: string, cfg: LizConfig) {
  const binary = getBinaryPath('client')
  const args = generateClientArgs(bind, target, listen, cfg)
  const cp = spawn(binary, args, { detached: true, stdio: 'ignore', shell: true })
  cp.unref()
}

export async function RPCStartLizServer (deviceID: string, arg: any) {
  console.log(`${deviceID} RPCStartLizServer`)
  const { key, cfg, port } = arg
  if (typeof key !== 'string') throw new Error('Bad Arg: key')
  if (typeof cfg !== 'object') throw new Error('Bad Arg: cfg')
  if (typeof port !== 'number') throw new Error('Bad Arg: port')
  startLizServer(`:${port}`, { key, ...cfg })
}

export async function LizClientActive (deviceID: string, listen: string, baseCfg: BaseLizConfig, rpc: P2PHost) {
  const key = generate(20)
  console.log('Using password ' + key)

  const cfg: LizConfig = { key, ...baseCfg }

  const local = await GetMappedAddress()
  const remote: IMappedAddress = await rpc.invokeAsync(deviceID, 'get_mapped_address')
  const localBind = ParseAddr(local.bind)
  const remoteBind = ParseAddr(remote.bind)
  await SendMessage('SB666!', 5, 100, localBind.port, remote.mapped)
  await rpc.invokeAsync(deviceID, 'send_message', { msg: 'SB233!', repeat: 5, interval: 100, port: remoteBind.port, remote: local.mapped })
  await rpc.invokeAsync(deviceID, 'start_liz_srv', { key, cfg, port: remoteBind.port })
  startLizClient(`:${localBind.port}`, remote.mapped, listen, cfg)
}

export async function LizClientPassive (deviceID: string, listen: string, baseCfg: BaseLizConfig, rpc: P2PHost) {
  const key = generate(20)
  console.log('Using password ' + key)

  const cfg: LizConfig = { key, ...baseCfg }

  const local = await GetMappedAddress()
  const remote: IMappedAddress = await rpc.invokeAsync(deviceID, 'get_mapped_address')
  const localBind = ParseAddr(local.bind)
  const remoteBind = ParseAddr(remote.bind)
  await rpc.invokeAsync(deviceID, 'send_message', { msg: 'SB233!', repeat: 5, interval: 100, port: remoteBind.port, remote: local.mapped })
  await SendMessage('SB666!', 5, 100, localBind.port, remote.mapped)
  await rpc.invokeAsync(deviceID, 'start_liz_srv', { key, cfg, port: remoteBind.port })
  startLizClient(`:${localBind.port}`, remote.mapped, listen, cfg)
}
