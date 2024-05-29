import { type z } from 'zod'

export type ActionType = 'query' | 'mutation'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export type Action<_ extends ActionType, Input, Output> = (input: Input) => Promise<Output>

type Resolver<Context extends object, Input, Output> = (param: {
  ctx: Context
  input: Input
}) => Promise<Output>
export type ActionBuilder<
  Type extends ActionType,
  Context extends object,
  Schema extends z.ZodType,
> = <Output>(
  resolver: Resolver<Context, z.infer<Schema>, Output>,
) => Action<Type, z.infer<Schema>, Output>

type ActionBuilderWithoutInput<Type extends ActionType, Context extends object> = ActionBuilder<
  Type,
  Context,
  z.ZodVoid
>
type ActionBuilderWithInput<Context extends object> = <Schema extends z.ZodType>(
  schema: Schema,
) => {
  query: ActionBuilder<'query', Context, Schema>
  mutation: ActionBuilder<'mutation', Context, Schema>
}
type Middleware<Context extends object, NewContext extends Context> = (ctx: Context) => NewContext
type Procedure<Context extends object> = {
  use: <NewContext extends Context>(
    middleware: Middleware<Context, NewContext>,
  ) => Procedure<NewContext>
  input: ActionBuilderWithInput<Context>
  query: ActionBuilderWithoutInput<'query', Context>
  mutation: ActionBuilderWithoutInput<'mutation', Context>
}
export type ProcedureBuilder = <Context extends object>(
  createContext: () => Promise<Context>,
) => Procedure<Context>

export type FlattenObjectKeysWithFilter<
  Type extends ActionType,
  Obj extends Record<string, unknown>,
  Key = keyof Obj,
> = Key extends string
  ? Obj[Key] extends Action<infer T, never, unknown>
    ? T extends Type
      ? `${Key}`
      : never
    : Obj[Key] extends Record<string, unknown>
      ? `${Key}.${FlattenObjectKeysWithFilter<Type, Obj[Key]>}`
      : never
  : never

export type FlattenObjectKeys<
  Obj extends Record<string, unknown>,
  Key = keyof Obj,
> = Key extends string
  ? Obj[Key] extends Record<string, unknown>
    ? `${Key}.${FlattenObjectKeys<Obj[Key]>}`
    : `${Key}`
  : never
export type InferActionFromKey<
  Key extends string,
  As extends Record<string, unknown>,
> = Key extends `${infer First}.${infer Rest}`
  ? As[First] extends Record<string, unknown>
    ? InferActionFromKey<Rest, As[First]>
    : As[First]
  : Key extends `${infer Key}`
    ? As[Key]
    : never
export type InferTarget = 'type' | 'input' | 'output'
export type InferActionIOFromAction<Target extends InferTarget, A> =
  A extends Action<infer Type, infer Input, infer Output>
    ? 'type' extends Target
      ? Type
      : 'input' extends Target
        ? Input
        : Output
    : never
export type InferActionIOFromKey<
  Target extends InferTarget,
  Key extends FlattenObjectKeys<As>,
  As extends Record<string, unknown>,
> = InferActionIOFromAction<Target, InferActionFromKey<Key, As>>
