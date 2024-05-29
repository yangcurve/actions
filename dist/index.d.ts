import * as _tanstack_react_query from '@tanstack/react-query';
import { UndefinedInitialDataOptions, UseMutationOptions } from '@tanstack/react-query';
import { z } from 'zod';

type ActionType = 'query' | 'mutation';
type Action<_ extends ActionType, Input, Output> = (input: Input) => Promise<Output>;
type Resolver<Context extends object, Input, Output> = (param: {
    ctx: Context;
    input: Input;
}) => Promise<Output>;
type ActionBuilder<Type extends ActionType, Context extends object, Schema extends z.ZodType> = <Output>(resolver: Resolver<Context, z.infer<Schema>, Output>) => Action<Type, z.infer<Schema>, Output>;
type ActionBuilderWithoutInput<Type extends ActionType, Context extends object> = ActionBuilder<Type, Context, z.ZodVoid>;
type ActionBuilderWithInput<Context extends object> = <Schema extends z.ZodType>(schema: Schema) => {
    query: ActionBuilder<'query', Context, Schema>;
    mutation: ActionBuilder<'mutation', Context, Schema>;
};
type Middleware<Context extends object, NewContext extends Context> = (ctx: Context) => NewContext;
type Procedure<Context extends object> = {
    use: <NewContext extends Context>(middleware: Middleware<Context, NewContext>) => Procedure<NewContext>;
    input: ActionBuilderWithInput<Context>;
    query: ActionBuilderWithoutInput<'query', Context>;
    mutation: ActionBuilderWithoutInput<'mutation', Context>;
};
type ProcedureBuilder = <Context extends object>(createContext: () => Promise<Context>) => Procedure<Context>;
type FlattenObjectKeysWithFilter<Type extends ActionType, Obj extends Record<string, unknown>, Key = keyof Obj> = Key extends string ? Obj[Key] extends Action<infer T, never, unknown> ? T extends Type ? `${Key}` : never : Obj[Key] extends Record<string, unknown> ? `${Key}.${FlattenObjectKeysWithFilter<Type, Obj[Key]>}` : never : never;
type FlattenObjectKeys<Obj extends Record<string, unknown>, Key = keyof Obj> = Key extends string ? Obj[Key] extends Record<string, unknown> ? `${Key}.${FlattenObjectKeys<Obj[Key]>}` : `${Key}` : never;
type InferActionFromKey<Key extends string, As extends Record<string, unknown>> = Key extends `${infer First}.${infer Rest}` ? As[First] extends Record<string, unknown> ? InferActionFromKey<Rest, As[First]> : As[First] : Key extends `${infer Key}` ? As[Key] : never;
type InferTarget = 'type' | 'input' | 'output';
type InferActionIOFromAction<Target extends InferTarget, A> = A extends Action<infer Type, infer Input, infer Output> ? 'type' extends Target ? Type : 'input' extends Target ? Input : Output : never;
type InferActionIOFromKey<Target extends InferTarget, Key extends FlattenObjectKeys<As>, As extends Record<string, unknown>> = InferActionIOFromAction<Target, InferActionFromKey<Key, As>>;

declare const createClientApi: <As extends Record<string, unknown>>(actions: As) => {
    query: <Key extends FlattenObjectKeysWithFilter<"query", As>>(actionKey: Key) => (input: InferActionIOFromAction<"input", InferActionFromKey<Key, As>>, options?: Omit<Omit<UndefinedInitialDataOptions<InferActionIOFromAction<"output", InferActionFromKey<Key, As>>>, "queryFn">, "queryKey"> | undefined) => _tanstack_react_query.UseQueryResult<InferActionIOFromAction<"output", InferActionFromKey<Key, As>>, Error>;
    mutation: <Key_1 extends FlattenObjectKeysWithFilter<"mutation", As>>(actionKey: Key_1) => (options?: Omit<Omit<UseMutationOptions<InferActionIOFromAction<"output", InferActionFromKey<Key_1, As>>, Error, InferActionIOFromAction<"input", InferActionFromKey<Key_1, As>>, unknown>, "mutationKey">, "mutationFn"> | undefined) => _tanstack_react_query.UseMutationResult<InferActionIOFromAction<"output", InferActionFromKey<Key_1, As>>, Error, InferActionIOFromAction<"input", InferActionFromKey<Key_1, As>>, unknown>;
};

declare const createProcedure: ProcedureBuilder;

export { type Action, type ActionBuilder, type ActionType, type FlattenObjectKeys, type FlattenObjectKeysWithFilter, type InferActionFromKey, type InferActionIOFromAction, type InferActionIOFromKey, type InferTarget, type ProcedureBuilder, createClientApi, createProcedure };
