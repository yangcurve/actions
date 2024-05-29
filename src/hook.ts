import {
  type FlattenObjectKeysWithFilter,
  type InferActionFromKey,
  type InferActionIOFromAction,
  type InferTarget,
  type Action,
} from './types'
import {
  useMutation,
  useQuery,
  type UndefinedInitialDataOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'
import _ from 'lodash'

export const createClientApi = <As extends Record<string, unknown>>(actions: As) => {
  type QueryKey = FlattenObjectKeysWithFilter<'query', As>
  type MutationKey = FlattenObjectKeysWithFilter<'mutation', As>
  type ActionKey = QueryKey | MutationKey

  type InferActionIOFromKey<
    Target extends InferTarget,
    Key extends ActionKey,
    As extends Record<string, unknown>,
  > = InferActionIOFromAction<Target, InferActionFromKey<Key, As>>
  type InferActionType<Key extends ActionKey> = InferActionIOFromKey<'type', Key, As>
  type InferActionInput<Key extends ActionKey> = InferActionIOFromKey<'input', Key, As>
  type InferActionOutput<Key extends ActionKey> = InferActionIOFromKey<'output', Key, As>

  type UseActionQueryOptions<Key extends QueryKey> = Omit<
    Omit<UndefinedInitialDataOptions<InferActionOutput<Key>>, 'queryFn'>,
    'queryKey'
  >
  type UseActionMutationOptions<Key extends MutationKey> = Omit<
    Omit<
      UseMutationOptions<InferActionOutput<Key>, Error, InferActionInput<Key>, unknown>,
      'mutationKey'
    >,
    'mutationFn'
  >

  const getAction = <Key extends ActionKey>(actionKey: Key) =>
    _.get(actions, actionKey) as Action<
      InferActionType<Key>,
      InferActionInput<Key>,
      InferActionOutput<Key>
    >

  return {
    query:
      <Key extends QueryKey>(actionKey: Key) =>
      (input: InferActionInput<Key>, options?: UseActionQueryOptions<Key>) => {
        const defaultOptions = {
          queryKey: [...actionKey.split('.'), input],
          queryFn: () => getAction(actionKey)(input),
        }
        return useQuery({
          ...defaultOptions,
          ...options,
        })
      },

    mutation:
      <Key extends MutationKey>(actionKey: Key) =>
      (options?: UseActionMutationOptions<Key>) =>
        useMutation({
          mutationKey: actionKey.split('.'),
          mutationFn: (input: InferActionInput<Key>) => getAction(actionKey)(input),
          ...options,
        }),
  }
}

// const createUseQueryHook =
//   <Type extends 'query' | 'suspenseQuery', Input, Output>(
//     action: Action<'query', Input, Output>,
//     keys: string[],
//     type: Type,
//   ) =>
//   (input: Input) =>
//     (type === 'query' ? tanstackQuery : tanstackSuspenseQuery)({
//       queryKey: [...keys, input],
//       queryFn: () => action(input),
//     })
// const createUseMutationHook =
//   <Input, Output>(action: Action<'mutation', Input, Output>, keys: string[]) =>
//   (options?: Omit<Omit<UseMutationOptions<Output, Error, Input>, 'mutationKey'>, 'mutationFn'>) =>
//     tanstackMutation({
//       mutationKey: keys,
//       mutationFn: (input: Input) => action(input),
//       ...options,
//     })

// const createHandler = (key: string[]): ProxyHandler<object> => ({
//   get(target, prop: keyof typeof target) {
//     const newKey = [...key, prop]
//     if (typeof target[prop] === 'object') return new Proxy(target[prop], createHandler(newKey))
//     return {
//       useMutation: createUseMutationHook(target[prop], newKey),
//       useQuery: createUseQueryHook(target[prop], newKey, 'query'),
//       useSuspenseQuery: createUseQueryHook(target[prop], newKey, 'suspenseQuery'),
//     }
//   },
// })

// type ClientApi<As extends Record<string, unknown>> = {
//   [Key in keyof As]: As[Key] extends Record<string, unknown>
//     ? ClientApi<As[Key]>
//     : As[Key] extends Action<infer Type, infer Input, infer Output>
//       ? 'mutation' extends Type
//         ? { useMutation: ReturnType<typeof createUseMutationHook<Input, Output>> }
//         : {
//             useQuery: ReturnType<typeof createUseQueryHook<'query', Input, Output>>
//             useSuspenseQuery: ReturnType<typeof createUseQueryHook<'suspenseQuery', Input, Output>>
//           }
//       : never
// }

// export const createClientApi = <As extends Record<string, unknown>>(actions: As) =>
//   new Proxy(actions, createHandler([])) as ClientApi<As>

// const createUseQueryHook =
//   <Type extends 'query' | 'suspenseQuery', Input, Output>(
//     action: Action<'query', Input, Output>,
//     keys: string[],
//     type: Type,
//   ) =>
//   (input: Input) =>
//     (type === 'query' ? tanstackQuery : tanstackSuspenseQuery)({
//       queryKey: [...keys, input],
//       queryFn: () => action(input),
//     })
// const createUseMutationHook =
//   <Input, Output>(action: Action<'mutation', Input, Output>, keys: string[]) =>
//   (options?: Omit<Omit<UseMutationOptions<Output, Error, Input>, 'mutationKey'>, 'mutationFn'>) =>
//     tanstackMutation({
//       mutationKey: keys,
//       mutationFn: (input: Input) => action(input),
//       ...options,
//     })

// type ClientApi<As extends Record<string, unknown>> = {
//   [Key in keyof As]: As[Key] extends Record<string, unknown>
//     ? ClientApi<As[Key]>
//     : As[Key] extends Action<infer Type, infer Input, infer Output>
//       ? 'mutation' extends Type
//         ? { useMutation: ReturnType<typeof createUseMutationHook<Input, Output>> }
//         : {
//             useQuery: ReturnType<typeof createUseQueryHook<'query', Input, Output>>
//             useSuspenseQuery: ReturnType<typeof createUseQueryHook<'suspenseQuery', Input, Output>>
//           }
//       : never
// }

// export const createClientApi = <As extends Record<string, unknown>>(actions: As) =>
//   (() => {
//     const api = {}
//     const loop = (actions: As, prevKeys: string[] = []) => {
//       for (const key in actions) {
//         const newKeys = [...prevKeys, key]
//         if (typeof actions[key] === 'object') {
//           // @ts-ignore
//           loop(actions[key], newKeys)
//         } else {
//           _.set(api, newKeys, {
//             // @ts-ignore
//             useMutation: createUseMutationHook(actions[key], newKeys),
//             // @ts-ignore
//             useQuery: createUseQueryHook(actions[key], newKeys, 'query'),
//             // @ts-ignore
//             useSuspenseQuery: createUseQueryHook(actions[key], newKeys, 'suspenseQuery'),
//           })
//         }
//       }
//     }
//     loop(actions)
//     return api
//   })() as ClientApi<As>

// type HookType = 'mutation' | 'query' | 'suspenseQuery'
// type QueryOptions<Key extends ActionKey, Type extends HookType> = Omit<
//   Omit<
//     'query' extends Type
//       ? UndefinedInitialDataOptions<
//           InferActionOutput<Key>,
//           Error,
//           InferActionOutput<Key>,
//           unknown[]
//         >
//       : UseSuspenseQueryOptions<InferActionOutput<Key>, Error, InferActionOutput<Key>, unknown[]>,
//     'queryKey'
//   >,
//   'queryFn'
// >
// type Options<Key extends ActionKey, Type extends HookType> = 'mutation' extends Type
//   ? MutationOptions<Key>
//   : QueryOptions<Key, Type>

// export const createHooks = <As extends Record<string, unknown>>(actions: As) => {
//   type ActionKey = FlattenObjectKeys<As>

//   type InferActionInput<Key extends ActionKey> = InferActionIOFromKey<'input', As, Key>
//   type InferActionOutput<Key extends ActionKey> = InferActionIOFromKey<'output', As, Key>
//   type InferActionType<Key extends ActionKey> = InferActionIOFromKey<'type', As, Key>

//   type ActionQueryOptions<Output> = Omit<
//     Omit<UndefinedInitialDataOptions<Output, Error, Output, readonly unknown[]>, 'queryKey'>,
//     'queryFn'
//   >
//   type ActionMutationOptions<Input, Output> = Omit<
//     Omit<UseMutationOptions<Output, Error, Input, unknown>, 'mutationKey'>,
//     'mutationFn'
//   >

//   const getAction = <Key extends ActionKey>(actionKey: Key) =>
//     _.get(actions, actionKey) as Action<
//       InferActionType<Key>,
//       InferActionInput<Key>,
//       InferActionOutput<Key>
//     >
//   return {
//     useQ: <Key extends ActionKey>(
//       actionKey: Key,
//       input: InferActionInput<Key>,
//       options?: ActionQueryOptions<InferActionOutput<Key>>,
//     ) =>
//       useQuery({
//         ...options,
//         queryKey: [...actionKey.split('.'), input],
//         queryFn: () => getAction(actionKey)(input),
//       }),
//     useM: <Key extends ActionKey>(
//       actionKey: Key,
//       options?: ActionMutationOptions<InferActionInput<Key>, InferActionOutput<Key>>,
//     ) =>
//       useMutation({
//         ...options,
//         mutationKey: actionKey.split('.'),
//         mutationFn: (input: InferActionInput<Key>) => getAction(actionKey)(input),
//       }),
//   }
// }
