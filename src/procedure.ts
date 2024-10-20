import { z } from 'zod'
import type { Action, ActionType, Transformer } from './types'

type Resolver<Context, Input, Output> = (param: { ctx: Context; input: Input }) => Output | Promise<Output>

type ActionBuilder<Type extends ActionType, Context, Schema extends z.ZodType> = <Output>(
  resolver: Resolver<Context, z.infer<Schema>, Output>,
) => Action<Type, z.input<Schema>, Output>

type Middleware<Context, NewContext> = (ctx: Context) => NewContext | Promise<NewContext>

type Procedure<Context> = {
  use: <NewContext>(middleware: Middleware<Context, NewContext>) => Procedure<NewContext>
  query: ActionBuilder<'query', Context, z.ZodVoid>
  mutation: ActionBuilder<'mutation', Context, z.ZodVoid>
  input: <Schema extends z.ZodType>(
    Schema: Schema,
  ) => {
    query: ActionBuilder<'query', Context, Schema>
    mutation: ActionBuilder<'mutation', Context, Schema>
  }
}

type ProcedureBuilder = <Context>(options: {
  createContext?: () => Context | Promise<Context>
  transformer?: Transformer
}) => Procedure<Context>

export const createProcedure: ProcedureBuilder = ({ createContext = () => new Promise(() => {}), transformer }) => {
  type Context = Awaited<ReturnType<typeof createContext>>

  const getActionBuilder =
    <Type extends ActionType, Schema extends z.ZodType>(Schema: Schema): ActionBuilder<Type, Context, Schema> =>
    (resolver) =>
    async (input) => {
      const output = await resolver({
        ctx: await createContext(),
        input: Schema.parse(input) as z.infer<typeof Schema>,
      })
      return transformer?.stringify(output) ?? output
    }

  return {
    use: (middleware) =>
      createProcedure({
        createContext: async () => await middleware(await createContext()),
        transformer,
      }),
    query: getActionBuilder(z.void()),
    mutation: getActionBuilder(z.void()),
    input: (Schema) => ({
      query: getActionBuilder(Schema),
      mutation: getActionBuilder(Schema),
    }),
  }
}
