import { type Action, type ActionType } from './action'

export type InferActionInput<Actions extends Record<string, unknown>> = {
  [Key in keyof Actions]: Actions[Key] extends Action<ActionType, infer Input, unknown> ? Input
  : Actions[Key] extends Record<string, unknown> ? InferActionInput<Actions[Key]>
  : never
}
export type InferActionOutput<Actions extends Record<string, unknown>> = {
  [Key in keyof Actions]: Actions[Key] extends Action<ActionType, unknown, infer Output> ? Output
  : Actions[Key] extends Record<string, unknown> ? InferActionOutput<Actions[Key]>
  : never
}
