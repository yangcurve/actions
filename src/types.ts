export type ActionType = 'query' | 'mutation'

type IsOptional<T> = undefined extends T ? true : false

export type Action<
  Info extends {
    type: ActionType
    input: unknown
    output: unknown
  },
> =
  IsOptional<Info['input']> extends true
    ? (input?: Info['input']) => Promise<Info['output']>
    : (input: Info['input']) => Promise<Info['output']>

export type Transformer = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stringify: (value: any) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parse: (value: any) => any
}
