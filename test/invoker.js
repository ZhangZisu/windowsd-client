const argv = require('yargs')
  .option('base', {
    default: '127.0.0.1:5000',
    demandOption: true,
    type: 'string'
  })
  .option('device', {
    demandOption: true,
    type: 'string'
  })
  .argv

const repl = require('repl')
const deasync = require('deasync')
const request = require('request-promise-native')

const url = `http://${argv.base}/${argv.device}/rpc`
console.log(url)

function invokeAsync(method, args, cfg, cb) {
  request.post(url, { body: { method, args, cfg }, json: true })
    .then(result => cb(undefined, result))
    .catch(err => cb(err.response.body))
}

/* global invoke */
global.invoke = deasync(invokeAsync)
/* global il */
global.il = (method, args) => invoke(method, args || {}, { l: true })
/* global ir */
global.ir = (method, args, t) => {
  if (t) {
    t = il('dns_res', { name: t })
    if (!t) throw new Error('DNS Failed')
    return invoke(method, args || {}, { t })
  } else {
    return invoke(method, args || {}, {})
  }
}

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
