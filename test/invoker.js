const repl = require('repl')
const io = require('socket.io-client')
const uuid = require('uuid/v4')
const argv = require('yargs').argv
const deasync = require('deasync')

const conn = io('http://localhost:5000', {
  extraHeaders: {
    'user-agent': 'User-Agent: Test/0'
  },
  query: {
    deviceID: argv.device
  }
})

conn.on('connect', () => {
  console.log('Connected')
})

conn.on('error', (err) => {
  console.error(err)
  process.exit(1)
})

const cbs = new Map()

function invokeAsync (method, args, cfg, cb) {
  const asyncID = uuid()
  cbs.set(asyncID, (result, error) => {
    cbs.delete(asyncID)
    cb(error, result)
  })
  conn.emit('rpc', [asyncID, method, args, cfg])
}

/* global invoke */
global.invoke = deasync(invokeAsync)
/* global il */
global.il = (method, args) => invoke(method, args, { local: true })
/* global ir */
global.ir = (method, args, target) => invoke(method, args, { target })

conn.on('rpc', (msg) => {
  const [asyncID, result, errstr] = msg
  const cb = cbs.get(asyncID)
  if (!cb) return
  if (errstr) return cb(result, new Error(errstr))
  return cb(result, null)
})

const main = async () => {
  console.log(il('cli_args', {}))
  console.table(ir('list_devices', {}))
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
