const io = require('socket.io-client')
const uuid = require('uuid/v4')

const conn = io('http://localhost:5000')

conn.on('connect', () => {
  console.log('Connected')
})

const cbs = new Map()

function invoke (method, args) {
  return new Promise((resolve, reject) => {
    const asyncID = uuid()
    cbs.set(asyncID, (result, error) => {
      cbs.delete(asyncID)
      if (error) return reject(error)
      return resolve(result)
    })
    conn.emit('rpc', [asyncID, method, args])
  })
}

conn.on('rpc', (msg) => {
  const [asyncID, result, errstr] = msg
  const cb = cbs.get(asyncID)
  if (!cb) return
  if (errstr) return cb(result, new Error(errstr))
  return cb(result, null)
})

const main = async () => {
  const r = await invoke('cli_args')
  console.log(r)
}

main()
