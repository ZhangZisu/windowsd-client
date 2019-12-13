const repl = require('repl')
const argv = require('yargs').argv
const deasync = require('deasync')
const request = require('request-promise-native')

const url = `http://127.0.0.1:5000/${argv.device}/rpc`

function invokeAsync(method, args, cfg, cb) {
  request.post(url, { body: { method, args, cfg }, json: true })
    .then(result => cb(undefined, result))
    .catch(err => cb(err))
}

/* global invoke */
global.invoke = deasync(invokeAsync)
/* global il */
global.il = (method, args) => invoke(method, args || {}, { local: true })
/* global ir */
global.ir = (method, args, target) => invoke(method, args || {}, { target })

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

main().catch(err => {
  console.log(err.message)
})
