const repl = require('repl')
const io = require('socket.io-client')
const uuid = require('uuid/v4')
var deasync = require('deasync')

const conn = io('http://localhost:5000', {
  extraHeaders: {
    'user-agent': 'User-Agent: Test/0'
  }
})

conn.on('connect', () => {
  console.log('Connected')
})

const cbs = new Map()

function invokeAsync (method, args, cb) {
  const asyncID = uuid()
  cbs.set(asyncID, (result, error) => {
    cbs.delete(asyncID)
    cb(error, result)
  })
  conn.emit('rpc', [asyncID, method, args])
}

/* global invoke */
global.invoke = deasync(invokeAsync)

conn.on('rpc', (msg) => {
  const [asyncID, result, errstr] = msg
  const cb = cbs.get(asyncID)
  if (!cb) return
  if (errstr) return cb(result, new Error(errstr))
  return cb(result, null)
})

const main = async () => {
  console.log(invoke('cli_args', {}))
  const srv = repl.start({ useGlobal: true, prompt: '$ ' })
  srv.setupHistory('.invoker.log', (err) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
  })
  srv.on('exit', () => {
    console.log('Bye!')
    process.exit(0)
  })
}

main()
