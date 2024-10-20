export type ActionType = 'query' | 'mutation'
export type Action<_Type extends ActionType, Input, Output> = (input: Input) => Promise<Output>

export type Transformer = {
  // biome-ignore lint/suspicious/noExplicitAny: ...
  stringify: (value: any) => any
  // biome-ignore lint/suspicious/noExplicitAny: ...
  parse: (value: any) => any
}
