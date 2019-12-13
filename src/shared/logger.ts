import chalk from 'chalk'

export function logRemoteIO (...args: any) {
  console.log(chalk.bgRed.black('Remote'), chalk.green('IO'), ...args)
}

export function logPluginHost (...args: any) {
  console.log(chalk.bgBlue.black('Plugin'), chalk.red('Host'), ...args)
}

export function logPluginInstance (id: string, ...args: any) {
  console.log(chalk.bgBlue.black('Plugin'), chalk.blue(id), ...args)
}

export function logMisc (...args: any) {
  console.log(chalk.bgGray('Misc'), ...args)
}

export function logInterfaceHTTP (...args: any) {
  console.log(chalk.bgYellow.black('Interface'), chalk.green('HTTP'), ...args)
}

export function logInterfaceCM (...args: any) {
  console.log(chalk.bgYellow.black('Interface'), chalk.blue('CM'), ...args)
}

export function logDNS (...args: any) {
  console.log(chalk.blue('DNS'), ...args)
}
