export type Invoker = (method: string, args: any, cfg: any) => Promise<any>

export abstract class RPCHost {
  protected invoker: Invoker
  constructor (invoker: Invoker) {
    this.invoker = invoker
  }

  abstract invoke(method: string, args: any, cfg: any): Promise<any>
}
