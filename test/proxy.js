const request = require('request')
const argv = require('yargs').argv
const net = require('net')

const url = `http://127.0.0.1:5000/${argv.device}/proxy`

net.createServer((socket) => {
  const conn = request.post(url, { qs: { host: '172.31.11.6', port: '22' } })
  socket.pipe(conn)
  conn.on('response', (res) => {
    if (res.statusCode === 200) {
      res.pipe(socket)
    } else {
      console.log('Proxy failed')
    }
    res.on('error', () => {
      socket.destroy()
    })
  })
  socket.on('error', () => {
  })
}).listen(1234)
