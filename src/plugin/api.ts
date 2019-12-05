import { register } from './host'
import { cliArgs } from '../cli'

register('cli_args', function () {
  return {
    device: cliArgs.device
  }
})
