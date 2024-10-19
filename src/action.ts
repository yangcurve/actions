import { z } from 'zod'

export type ActionType = 'query' | 'mutation'
export type Action<_Type extends ActionType, Input, Output> = (input: Input) => Promise<Output>

type ActionBuilder<Type extends ActionType, Schema extends z.ZodType> = <Output>(
  resolver: (input: z.infer<Schema>) => Output | Promise<Output>,
) => Action<Type, z.input<Schema>, Output>

type ActionBuilderWithoutInput<Type extends ActionType> = ActionBuilder<Type, z.ZodVoid>

type ActionBuilderWithInput = <Schema extends z.ZodType>(
  Schema: Schema,
) => {
  query: ActionBuilder<'query', Schema>
  mutation: ActionBuilder<'mutation', Schema>
}

const getActionBuilder =
  <T extends ActionType, Schema extends z.ZodTypeAny>(Schema: Schema): ActionBuilder<T, Schema> =>
  (resolver) =>
  async (input) =>
    resolver(Schema.parse(input))

export const a = {
  query: getActionBuilder(z.void()),
  mutation: getActionBuilder(z.void()),
  input: (Schema) => ({
    query: getActionBuilder(Schema),
    mutation: getActionBuilder(Schema),
  }),
} satisfies {
  query: ActionBuilderWithoutInput<'query'>
  mutation: ActionBuilderWithoutInput<'mutation'>
  input: ActionBuilderWithInput
}
