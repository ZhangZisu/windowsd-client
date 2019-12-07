import { cliArgs } from '../cli'
import { register } from '../plugin/host'

register('cli_args', function () {
  return {
    device: cliArgs.device
  }
})
