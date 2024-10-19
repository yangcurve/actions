import { type Action } from './action'
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
  options?: Omit<UseMutationOptions<Output, Error, Input>, 'mutationFn'>,
  queryClient?: QueryClient,
) => UseMutationResult<Output, Error, Input>

type ClientProxy<Actions extends Record<string, unknown>, Path extends readonly string[] = []> = {
  [Key in keyof Actions]: Key extends string ?
    Actions[Key] extends Action<infer Type, infer Input, infer Output> ?
      Type extends 'query' ?
        { useQuery: ClientQueryAction<Input, Output> }
      : { useMutation: ClientMutationAction<Input, Output> }
    : Actions[Key] extends Record<string, unknown> ? ClientProxy<Actions[Key], [...Path, Key]>
    : never
  : never
}
export const createClientProxy = <Actions extends Record<string, unknown>>(
  actions: Actions,
  path: readonly string[] = [],
): ClientProxy<Actions> =>
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
                queryKey: [...path, key, input],
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
              },
              queryClient,
            )) as ClientMutationAction<Input, Output>)
        : createClientProxy(actions, [...path, key]),
    },
  ) as ClientProxy<Actions>
