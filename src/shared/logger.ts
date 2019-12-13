import chalk from 'chalk'

const createLogger = (...prefix: any) =>
  (...args: any) => console.log(...prefix, ...args)

export const logRemoteIO = createLogger(chalk.bgRed.black('Remote'), chalk.green('IO'))
export const logPluginHost = createLogger(chalk.bgBlue.black('Plugin'), chalk.red('Host'))
export const logMisc = createLogger(chalk.bgGray('Misc'))
export const logInterfaceHTTP = createLogger(chalk.bgYellow.black('Interface'), chalk.green('HTTP'))
export const logInterfaceCM = createLogger(chalk.bgYellow.black('Interface'), chalk.blue('CM'))
export const logDNS = createLogger(chalk.blue('DNS'))
export const logStartup = createLogger(chalk.green('Startup'))

export function logPluginInstance (id: string, ...args: any) {
  console.log(chalk.bgBlue.black('Plugin'), chalk.blue(id), ...args)
}
