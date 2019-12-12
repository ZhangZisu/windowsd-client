import chalk from 'chalk'

export function logRemoteIO (...args: any) {
  console.log(chalk.bgRed.black('Remote'), chalk.green('IO'), ...args)
}

export function logTransportSystem (...args: any) {
  console.log(chalk.bgGreen.black('Transport'), chalk.yellow('System'), ...args)
}

export function logPluginHost (...args: any) {
  console.log(chalk.bgBlue.black('Plugin'), chalk.red('Host'), ...args)
}

export function logPluginInstance (id: string, ...args: any) {
  console.log(chalk.bgBlue.black('Plugin'), chalk.blue(id), ...args)
}

export function logPluginInstaller (...args: any) {
  console.log(chalk.bgBlue.black('Plugin'), chalk.cyan('Installer'), ...args)
}

export function logPluginMisc (...args: any) {
  console.log(chalk.bgBlue.black('Plugin'), chalk.gray('Misc'), ...args)
}

export function logInterfaceHTTP (...args: any) {
  console.log(chalk.bgYellow.black('Interface'), chalk.green('HTTP'), ...args)
}

export function logInterfaceHost (...args: any) {
  console.log(chalk.bgYellow.black('Interface'), chalk.yellow('Host'), ...args)
}

export function logInterfaceCM (...args: any) {
  console.log(chalk.bgYellow.black('Interface'), chalk.blue('CM'), ...args)
}

export function logAPIDNS (...args: any) {
  console.log(chalk.bgCyan.black('API'), chalk.blue('DNS'), ...args)
}
