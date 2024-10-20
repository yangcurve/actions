export type ActionType = 'query' | 'mutation'
export type Action<_Type extends ActionType, Input, Output> = (input: Input) => Promise<Output>

export type Transformer =
  | {
      stringify: (value: any) => any // eslint-disable-line @typescript-eslint/no-explicit-any
      parse: (value: any) => any // eslint-disable-line @typescript-eslint/no-explicit-any
      serialize?: undefined
      deserialize?: undefined
    }
  | {
      stringify?: undefined
      parse?: undefined
      serialize: (value: any) => any // eslint-disable-line @typescript-eslint/no-explicit-any
      deserialize: (value: any) => any // eslint-disable-line @typescript-eslint/no-explicit-any
    }
