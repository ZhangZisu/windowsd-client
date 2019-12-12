import { WebDAVServer, PhysicalFileSystem } from 'webdav-server/lib/index.v2'
import { localHost } from '@/router'

export const DAVServer = new WebDAVServer()

localHost.builtin.register('mount', async function (args: any) {
  const { dst, src } = args
  if (typeof dst !== 'string') throw new Error('Bad Arg: dst')
  if (typeof src !== 'string') throw new Error('Bad Arg: src')
  return DAVServer.setFileSystemAsync(dst, new PhysicalFileSystem(src))
})

localHost.builtin.register('umount', async function (args: any) {
  const { dst } = args
  if (typeof dst !== 'string') throw new Error('Bad Arg: dst')
  return DAVServer.removeFileSystemSync(dst)
})
