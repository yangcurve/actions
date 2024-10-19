import { type Action } from './action'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  type QueryClient,
} from '@tanstack/react-query'

type ClientQueryAction<Input, Output> = (
  input: Input,
  options?: Omit<UseQueryOptions<Output>, 'queryFn' | 'queryKey'>,
  queryClient?: QueryClient,
) => UseQueryResult<Output>

type ClientMutationAction<Input, Output> = (
  options?: Omit<UseMutationOptions<Output, Error, Input>, 'mutationFn' | 'mutationKey'>,
  queryClient?: QueryClient,
) => UseMutationResult<Output, Error, Input>

type ClientApi<Actions extends Record<string, unknown>> = {
  [Key in keyof Actions]: Key extends string ?
    Actions[Key] extends Action<infer Type, infer Input, infer Output> ?
      Type extends 'query' ?
        { useQuery: ClientQueryAction<Input, Output> }
      : { useMutation: ClientMutationAction<Input, Output> }
    : Actions[Key] extends Record<string, unknown> ? ClientApi<Actions[Key]>
    : never
  : never
}

type ClientProxyUtils<Actions extends Record<string, unknown>> = {
  [Key in keyof Actions]: Key extends string ?
    Actions[Key] extends Action<infer Type, infer Input, unknown> ?
      Type extends 'query' ?
        {
          invalidate: (input?: Input) => Promise<void>
        }
      : {
          isMutating: () => number
        }
    : Actions[Key] extends Record<string, unknown> ? ClientProxyUtils<Actions[Key]>
    : never
  : never
} & {
  invalidate: () => Promise<void>
}

type ClientProxy<Actions extends Record<string, unknown>> = {
  api: ClientApi<Actions>
  useUtils: () => ClientProxyUtils<Actions>
}

const createClientApi = <Actions extends Record<string, unknown>>(
  actions: Actions,
  path: readonly string[] = [],
): ClientApi<Actions> =>
  new Proxy(
    {},
    {
      get: <Input, Output>(_target: unknown, key: string) =>
        key === 'useQuery' ?
          (((input, options, queryClient) =>
            useQuery(
              {
                ...options,
                // @ts-expect-error ...
                queryFn: () => path.reduce((acc, key) => acc[key], actions)(input),
                queryKey: [...path, input],
              },
              queryClient,
            )) as ClientQueryAction<Input, Output>)
        : key === 'useMutation' ?
          (((options, queryClient) =>
            useMutation(
              {
                ...options,
                // @ts-expect-error ...
                mutationFn: (input) => path.reduce((acc, key) => acc[key], actions)(input),
                mutationKey: path,
              },
              queryClient,
            )) as ClientMutationAction<Input, Output>)
        : createClientApi(actions, [...path, key]),
    },
  ) as ClientApi<Actions>

const createClientProxyUtils = <Actions extends Record<string, unknown>>(
  actions: Actions,
  queryClient: QueryClient,
  path: readonly string[] = [],
): ClientProxyUtils<Actions> =>
  new Proxy(
    {},
    {
      get: <Input>(_target: unknown, key: string) =>
        key === 'invalidate' ?
          (input?: Input) => queryClient.invalidateQueries({ queryKey: [...path, input].filter(Boolean) })
        : key === 'isMutating' ? () => queryClient.isMutating({ mutationKey: path })
        : createClientProxyUtils(actions, queryClient, [...path, key]),
    },
  ) as ClientProxyUtils<Actions>

export const createClientProxy = <Actions extends Record<string, unknown>>(actions: Actions) =>
  ({
    api: createClientApi(actions),
    useUtils: () => {
      const queryClient = useQueryClient()
      return createClientProxyUtils(actions, queryClient)
    },
  }) satisfies ClientProxy<Actions>
