interface IPluginLoadInfo {
  mainPath: string
  id: string
}

declare function load(id: string): IPluginLoadInfo

export = load
