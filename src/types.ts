import { type UseMutationOptions, type UseMutationResult, type UseQueryResult } from '@tanstack/react-query'
import { type z } from 'zod'

export type ActionType = 'query' | 'mutation'
export type Action<_Type extends ActionType, Input, Output> = (input: Input) => Promise<Output>

export type ActionBuilder<Type extends ActionType, Schema extends z.ZodType> = <Output>(
  resolver: (input: z.infer<Schema>) => Output,
) => Action<Type, z.input<Schema>, Output>

type ActionBuilderWithoutInput<Type extends ActionType> = ActionBuilder<Type, z.ZodVoid>

type ActionBuilderWithInput = <Schema extends z.ZodType>(
  Schema: Schema,
) => {
  query: ActionBuilder<'query', Schema>
  mutation: ActionBuilder<'mutation', Schema>
}

export type Procedure = {
  query: ActionBuilderWithoutInput<'query'>
  mutation: ActionBuilderWithoutInput<'mutation'>
  input: ActionBuilderWithInput
}

export type ClientQueryAction<Input, Output> = (input: Input) => UseQueryResult<Output>

export type ClientMutationAction<Input, Output> = (
  options?: Omit<UseMutationOptions<Output, unknown, Input>, 'mutationFn'>,
) => UseMutationResult<Output, unknown, Input>

export type ClientSideProxy<Actions extends Record<string, unknown>, Path extends ReadonlyArray<string>> = {
  [Key in keyof Actions]: Key extends string ?
    Actions[Key] extends Action<infer Type, infer Input, infer Output> ?
      Type extends 'query' ? { useQuery: ClientQueryAction<Input, Output> }
      : Type extends 'mutation' ? { useMutation: ClientMutationAction<Input, Output> }
      : never
    : Actions[Key] extends Record<string, unknown> ? ClientSideProxy<Actions[Key], [...Path, Key]>
    : never
  : never
}
