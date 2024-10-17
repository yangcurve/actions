import { type ActionType, type Action } from './action'
import {
  useMutation,
  useQuery,
  type UndefinedInitialDataOptions,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryResult,
  type QueryClient,
} from '@tanstack/react-query'

type ClientQueryAction<Input, Output> = (
  input: Input,
  options?: Omit<UndefinedInitialDataOptions<Output>, 'queryFn' | 'queryKey'>,
  queryClient?: QueryClient,
) => UseQueryResult<Output>

type ClientMutationAction<Input, Output> = (
  options?: Omit<UseMutationOptions<Output, Error, Input>, 'mutationFn'>,
  queryClient?: QueryClient,
) => UseMutationResult<Output, Error, Input>

type ClientSideProxy<Actions extends Record<string, unknown>, Path extends ReadonlyArray<string>> = {
  [Key in keyof Actions]: Key extends string ?
    Actions[Key] extends Action<infer Type, infer Input, infer Output> ?
      Type extends 'query' ?
        { useQuery: ClientQueryAction<Input, Output> }
      : { useMutation: ClientMutationAction<Input, Output> }
    : Actions[Key] extends Record<string, unknown> ? ClientSideProxy<Actions[Key], [...Path, Key]>
    : never
  : never
}
export const createClientSideProxy = <Actions extends Record<string, unknown>>(
  actions: Actions,
  path: ReadonlyArray<string> = [],
): ClientSideProxy<Actions, typeof path> =>
  new Proxy(actions, {
    get: <Key extends string & keyof Actions, Input, Output>(actions: Actions, key: Key) => {
      if (typeof actions[key] === 'function') {
        const action = actions[key] as Action<ActionType, Input, Output>
        return {
          useQuery: (input, options, queryClient) =>
            useQuery(
              {
                ...options,
                queryFn: () => action(input),
                queryKey: [...path, key, input],
              },
              queryClient,
            ),
          useMutation: (options, queryClient) =>
            useMutation(
              {
                ...options,
                mutationFn: (input) => action(input),
              },
              queryClient,
            ),
        } satisfies {
          useQuery: ClientQueryAction<Input, Output>
          useMutation: ClientMutationAction<Input, Output>
        }
      }
      if (typeof actions[key] === 'object') {
        return createClientSideProxy(actions[key] as Record<string, unknown>, [...path, key])
      }
    },
  }) as ClientSideProxy<Actions, typeof path>
