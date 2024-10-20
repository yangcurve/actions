export type ActionType = 'query' | 'mutation'
export type Action<_Type extends ActionType, Input, Output> = (input: Input) => Promise<Output>

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
