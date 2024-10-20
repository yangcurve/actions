import { type Caller } from './caller'

export type ActionType = 'query' | 'mutation'
export type Action<_Type extends ActionType, Input, Output> = (input: Input) => Promise<Output>

export type InferActionInput<Actions extends Caller<Record<string, unknown>>> = Omit<
  {
    [Key in keyof Actions]: Actions[Key] extends Action<ActionType, infer Input, unknown> ? Input
    : Actions[Key] extends Record<string, unknown> ? InferActionInput<Actions[Key] & { __brand: 'caller' }>
    : never
  },
  '__brand'
>
export type InferActionOutput<Actions extends Caller<Record<string, unknown>>> = Omit<
  {
    [Key in keyof Actions]: Actions[Key] extends Action<ActionType, unknown, infer Output> ? Output
    : Actions[Key] extends Record<string, unknown> ? InferActionOutput<Actions[Key] & { __brand: 'caller' }>
    : never
  },
  '__brand'
>
