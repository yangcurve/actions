import { type Action } from '..'
import {
  useMutation,
  useQuery,
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

export type ClientApi<Actions extends Record<string, unknown>> = {
  [Key in keyof Actions]: Key extends string ?
    Actions[Key] extends Action<infer Type, infer Input, infer Output> ?
      Type extends 'query' ?
        { useQuery: ClientQueryAction<Input, Output> }
      : { useMutation: ClientMutationAction<Input, Output> }
    : Actions[Key] extends Record<string, unknown> ? ClientApi<Actions[Key]>
    : never
  : never
}

export const createClientApi = <Actions extends Record<string, unknown>>(
  actions: Actions,
  path: readonly string[] = [],
): ClientApi<Actions> =>
  new Proxy(
    {},
    {
      get: <Input, Output>(_: unknown, key: string) =>
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
