export type ActionType = 'query' | 'mutation'
export type Action<
  Info extends {
    type: ActionType
    input: unknown
    output: unknown
  },
> = (input: Info['input']) => Promise<Info['output']>

export type Transformer = {
  // biome-ignore lint/suspicious/noExplicitAny: ...
  stringify: (value: any) => any
  // biome-ignore lint/suspicious/noExplicitAny: ...
  parse: (value: any) => any
}
