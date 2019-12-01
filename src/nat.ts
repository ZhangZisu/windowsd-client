import { createSocket } from 'dgram'

export function ParseAddr (addr: string) {
  const tokens = addr.split(':')
  if (tokens.length !== 2) throw new Error('Addr parse error')
  const port = parseInt(tokens[1])
  if (!(port > 1024 && port < 65536)) throw new Error('Addr parse: Invalid port')
  return { address: tokens[0], port }
}

export interface IMappedAddress {
  mapped: string
  bind: string
}

export function GetMappedAddress () {
  return new Promise<IMappedAddress>((resolve, reject) => {
    const socket = createSocket('udp4')
    socket.bind()
    socket.on('error', (e) => reject(e))
    socket.on('listening', () => {
      const request = Buffer.from('FUCK IT')

      const i = setInterval(() => {
        socket.send(request, 3379, 'api.zhangzisu.cn')
      }, 100)

      socket.on('message', (msg, rinfo) => {
        if (rinfo.port !== 3379 && rinfo.address !== '27.122.58.114') return
        const mapped = Buffer.from(msg.toString(), 'base64').toString()
        const bind = `${socket.address().address}:${socket.address().port}`
        clearInterval(i)
        socket.close(() => {
          resolve({ mapped: mapped, bind })
        })
      })
    })
  })
}

export async function RPCGetMappedAddress (deviceID: string) {
  console.log(`${deviceID} GetMappedAddress`)
  return GetMappedAddress()
}

export function SendMessage (msg: string, repeat: number, interval: number, port: number, remote: string) {
  return new Promise((resolve, reject) => {
    const parsed = ParseAddr(remote)

    const socket = createSocket('udp4')
    socket.bind(port)
    socket.on('error', (e) => reject(e))
    socket.on('listening', () => {
      let n = 0
      const send = (err: Error | null) => {
        if (err) {
          return reject(err)
        }
        if (n++ > repeat) {
          socket.close(() => {
            resolve()
          })
        } else {
          socket.send(msg, parsed.port, parsed.address, (e: Error | null) => setTimeout(send, interval, e))
        }
      }
      send(null)
    })
  })
}

export async function RPCSendMessage (deviceID: string, arg: any) {
  console.log(`${deviceID} RPCSendMessage`)
  const { msg, repeat, interval, port, remote } = arg
  if (typeof msg !== 'string') throw new Error('Bad arg: msg')
  if (typeof repeat !== 'number') throw new Error('Bad arg: repeat')
  if (typeof interval !== 'number') throw new Error('Bad arg: interval')
  if (typeof port !== 'number') throw new Error('Bad arg: port')
  if (typeof remote !== 'string') throw new Error('Bad arg: addr')
  return SendMessage(msg, repeat, interval, port, remote)
}
