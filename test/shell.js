const request = require('request')
const argv = require('yargs').argv

const url = `http://127.0.0.1:5000/${argv.device}/sh`

function createShell() {
  const conn = request.post(url)
  process.stdin.pipe(conn)
  conn.pipe(process.stdout)
}

console.log('Connecting...')
createShell()
