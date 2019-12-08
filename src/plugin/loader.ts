import { Plugin } from './host'
import { dependencies } from '../../plugins'
import chalk = require('chalk')

const prefix = chalk.blueBright('Load plugin')

for (const id in dependencies) {
  console.log(prefix, `${id} @ ${dependencies[id]}`)
  const plugin = new Plugin(id)
  plugin.active()
}
