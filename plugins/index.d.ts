interface IPluginLoadInfo {
  mainPath: string
  id: string
}

declare namespace plugin {
  function load(id: string): IPluginLoadInfo
  function dependencies(): { [key: string]: string }
  const pluginDir: string
}

export = plugin
