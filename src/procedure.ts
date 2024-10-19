import { type Action, type ActionType } from './action'
import { z } from 'zod'

type ActionBuilder<Type extends ActionType, Schema extends z.ZodType> = <Output>(
  resolver: (input: z.infer<Schema>) => Output,
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
    await resolver(Schema.parse(input))

type Procedure = {
  query: ActionBuilderWithoutInput<'query'>
  mutation: ActionBuilderWithoutInput<'mutation'>
  input: ActionBuilderWithInput
}

export const procedure = {
  query: getActionBuilder(z.void()),
  mutation: getActionBuilder(z.void()),
  input: (Schema) => ({
    query: getActionBuilder(Schema),
    mutation: getActionBuilder(Schema),
  }),
} satisfies Procedure
