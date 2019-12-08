interface IPluginLoadInfo {
  mainPath: string
  id: string
}

declare namespace plugin {
  function load(id: string): IPluginLoadInfo
  const dependencies: { [key: string]: string }
}

export = plugin
