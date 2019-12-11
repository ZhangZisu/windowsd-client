import { register } from '../plugin/host'
import { DAVServer } from '../interface/dav'
import { PhysicalFileSystem } from 'webdav-server/lib/index.v2'

register('dav_mount', async function (args: any) {
  const { dst, src } = args
  if (typeof dst !== 'string') throw new Error('Bad Arg: dst')
  if (typeof src !== 'string') throw new Error('Bad Arg: src')
  return DAVServer.setFileSystemAsync(dst, new PhysicalFileSystem(src))
})
