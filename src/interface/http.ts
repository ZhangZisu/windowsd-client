import { createServer } from 'http'

import { app } from '@/interface/express'
import { cliArgs } from '@/cli'
import { logInterfaceHTTP } from '@/misc/logger'

export const server = createServer(app)

server.listen(cliArgs.api, () => {
  logInterfaceHTTP(server.address())
})
