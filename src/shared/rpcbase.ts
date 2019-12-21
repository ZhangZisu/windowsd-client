export interface IRPCConfig {
  s?: string
  t?: string
  o?: number
  l?: boolean
}

export type Invoker = (method: string, args: any, cfg: IRPCConfig) => Promise<any>

export abstract class RPCHost {
  protected invoker: Invoker
  constructor (invoker: Invoker) {
    this.invoker = invoker
  }

  abstract invoke(method: string, args: any, cfg: IRPCConfig): Promise<any>
}
