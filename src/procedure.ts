import { type ActionBuilder, type ActionType, type ProcedureBuilder } from './types'
import { z } from 'zod'

export const createProcedure: ProcedureBuilder = (createContext) => {
  type Context = Awaited<ReturnType<typeof createContext>>
  const getActionBuilder =
    <T extends ActionType, Schema extends z.ZodTypeAny>(
      schema: Schema,
    ): ActionBuilder<T, Context, Schema> =>
    (resolver) =>
    async (input) =>
      await resolver({
        ctx: await createContext(),
        input: schema.parse(input) as typeof input,
      })

  return {
    use: (middleware) => createProcedure(() => createContext().then(middleware)),
    mutation: getActionBuilder(z.void()),
    query: getActionBuilder(z.void()),
    input: (schema) => ({
      mutation: getActionBuilder(schema),
      query: getActionBuilder(schema),
    }),
  }
}
