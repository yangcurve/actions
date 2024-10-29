import { type Action, type ActionType, type Transformer } from './types'
import { z } from 'zod'

type Resolver<Context, Input, Output> = (param: { ctx: Context; input: Input }) => Output | Promise<Output>

type ActionBuilder<Type extends ActionType, Context, Schema extends z.ZodType> = <Output>(
  resolver: Resolver<Context, z.infer<Schema>, Output>,
) => Action<{ type: Type; input: z.input<Schema>; output: Output }>

type MiddlewareResult<
  Info extends {
    ctx: unknown
  },
> = {
  __ctx: Info['ctx']
  __brand: 'MiddlewareResult'
}

type Middleware<Context> = (params: {
  ctx: Context
  next: {
    (): Promise<MiddlewareResult<{ ctx: Context }>>
    <NewContext>(newCtx: NewContext): Promise<MiddlewareResult<{ ctx: NewContext }>>
  }
}) => ReturnType<typeof params.next>

type Procedure<Context> = {
  use: <M extends Middleware<Context>, NewContext = Awaited<ReturnType<M>>['__ctx']>(
    middleware: M,
  ) => Procedure<NewContext>
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
  createContext: () => Context | Promise<Context>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  middlewares: Middleware<any>[]
}) => Procedure<Context>

export const createProcedureFactory = ({ transformer }: { transformer?: Transformer }) => {
  const __createProcedure: ProcedureBuilder = ({ createContext, middlewares }) => {
    type Context = Awaited<ReturnType<typeof createContext>>

    const getActionBuilder =
      <Type extends ActionType, Schema extends z.ZodType>(Schema: Schema): ActionBuilder<Type, Context, Schema> =>
      (resolver) =>
      async (input?: z.input<Schema>) => {
        const invokeMiddlewares = async (ctx: Context, ...middlewares: Middleware<Context>[]) =>
          middlewares.length === 0
            ? await resolver({ ctx, input: Schema.parse(input) })
            : await (middlewares[0] as Middleware<Context>)({
                ctx,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                next: async (newCtx?: any) => (await invokeMiddlewares(newCtx ?? ctx, ...middlewares.slice(1))) as any,
              })
        const output = await invokeMiddlewares(await createContext(), ...middlewares)
        return transformer?.stringify(output) ?? output
      }

    return {
      use: <M extends Middleware<Context>, NewContext = ReturnType<M>>(middleware: M) =>
        __createProcedure({
          createContext: createContext as () => Promise<NewContext>,
          middlewares: [...middlewares, middleware],
        }),
      query: getActionBuilder<'query', z.ZodVoid>(z.void()),
      mutation: getActionBuilder<'mutation', z.ZodVoid>(z.void()),
      input: (Schema) => ({
        query: getActionBuilder(Schema),
        mutation: getActionBuilder(Schema),
      }),
    }
  }

  const createProcedure = <Context>({
    createContext,
  }: {
    createContext?: () => Context | Promise<Context>
  } = {}) =>
    __createProcedure<Context>({
      createContext: createContext ?? (() => new Promise(() => {})),
      middlewares: [],
    })

  return createProcedure
}
