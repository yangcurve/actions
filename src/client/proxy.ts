import {
  type QueryClient,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
} from '@tanstack/react-query'
import { type Action, type ActionType } from '@/types'

type ClientQueryAction<
  Info extends {
    input: unknown
    output: unknown
  },
> = (
  input: Info['input'],
  options?: Omit<UseQueryOptions<Info['output']>, 'queryFn' | 'queryKey'>,
  queryClient?: QueryClient,
) => UseQueryResult<Info['output']>

type ClientMutationAction<
  Info extends {
    input: unknown
    output: unknown
  },
> = (
  options?: Omit<UseMutationOptions<Info['output'], Error, Info['input']>, 'mutationFn' | 'mutationKey'>,
  queryClient?: QueryClient,
) => UseMutationResult<Info['output'], Error, Info['input']>

export type ClientProxy<Actions extends Record<string, unknown>> = {
  [Key in keyof Actions]: Key extends string ?
    Actions[Key] extends (
      Action<{
        type: infer Type extends ActionType
        input: infer Input
        output: infer Output
      }>
    ) ?
      Type extends 'query' ?
        { useQuery: ClientQueryAction<{ input: Input; output: Output }> }
      : { useMutation: ClientMutationAction<{ input: Input; output: Output }> }
    : Actions[Key] extends Record<string, unknown> ? ClientProxy<Actions[Key]>
    : never
  : never
}

export const createClientProxy = <Actions extends Record<string, unknown>>(
  actions: Actions,
  ...path: readonly string[]
): ClientProxy<Actions> =>
  new Proxy(
    {},
    {
      get: <Input, Output>(_: unknown, key: string) =>
        key === 'useQuery' ?
          (((input, options, queryClient) =>
            useQuery(
              {
                ...options,
                queryFn: () =>
                  // @ts-expect-error ...
                  path.reduce((acc, key) => acc[key], actions)(input),
                queryKey: [...path, input],
              },
              queryClient,
            )) as ClientQueryAction<{ input: Input; output: Output }>)
        : key === 'useMutation' ?
          (((options, queryClient) =>
            useMutation(
              {
                ...options,
                mutationFn: (input) =>
                  // @ts-expect-error ...
                  path.reduce((acc, key) => acc[key], actions)(input),
                mutationKey: path,
              },
              queryClient,
            )) as ClientMutationAction<{ input: Input; output: Output }>)
        : createClientProxy(actions, ...path, key),
    },
  ) as ClientProxy<Actions>
