import yargs from 'yargs'
import { hostname } from 'os'

export const cliArgs = yargs
  .option('api', {
    default: 5000,
    demandOption: true,
    type: 'number'
  })
  .option('device', {
    demandOption: true,
    type: 'string'
  })
  .option('server', {
    default: 'http://api.zhangzisu.cn:8080',
    demandOption: true,
    type: 'string'
  })
  .option('hostname', {
    default: hostname(),
    type: 'string'
  })
  .argv
