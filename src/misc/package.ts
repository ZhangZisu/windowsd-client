import { readFileSync } from 'fs'
import { join } from 'path'

interface IPackageJSON {
  name: string
  version: string
  main: string
  repository: string
  author: string
  license: string
}

export const packageJson = <IPackageJSON>JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json')).toString())
