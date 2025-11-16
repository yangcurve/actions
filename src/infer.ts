import { type Caller } from './caller'
import { type Action } from './types'

export type InferActionInput<Actions extends Caller<Record<string, unknown>>> = Omit<
  {
    [Key in keyof Actions]: Actions[Key] extends Action<infer Info> ? Info['input']
    : Actions[Key] extends Record<string, unknown> ? InferActionInput<Actions[Key] & { __brand: 'Caller' }>
    : never
  },
  '__brand'
>
export type InferActionOutput<Actions extends Caller<Record<string, unknown>>> = Omit<
  {
    [Key in keyof Actions]: Actions[Key] extends Action<infer Info> ? Info['output']
    : Actions[Key] extends Record<string, unknown> ? InferActionOutput<Actions[Key] & { __brand: 'Caller' }>
    : never
  },
  '__brand'
>
