import { register } from '../plugin/host'
import { cliArgs } from '../cli'
import chalk from 'chalk'
import { invokeRemote } from '../rpc'
import { isUUID } from '../misc/regexp'

const hosts: Map<string, string> = new Map()

const logPrefix = chalk.bgCyan('DNS')

register('dns_upd', async function (args) {
  const { k, v } = args
  if (typeof k !== 'string') throw new Error('Bad Arg: k')
  if (typeof v !== 'string') throw new Error('Bad Arg: v')
  hosts.set(k, v)
  return { k: cliArgs.hostname, v: cliArgs.device }
})

export function setDNS (k: string, v: string) {
  hosts.set(k, v)
  console.log(logPrefix, `${k}->${v}`)
}

export function resolveDNS (name: string) {
  if (isUUID.test(name)) {
    return name
  }
  return hosts.get(name)
}

register('dns_resolve', async function (args) {
  const { name } = args
  if (typeof name !== 'string') throw new Error('Bad Arg: name')
  return resolveDNS(name)
})

export async function updateDNS (id: string) {
  const { k, v } = <any> await invokeRemote('dns_upd', { k: cliArgs.hostname, v: cliArgs.device }, { target: id })
  setDNS(k, v)
}
