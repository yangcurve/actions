import { type Action } from './action'
import {
  useMutation,
  useQuery,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'

type ClientQueryAction<Input, Output> = (input: Input) => UseQueryResult<Output>

type ClientMutationAction<Input, Output> = (
  options?: Omit<UseMutationOptions<Output, unknown, Input>, 'mutationFn'>,
) => UseMutationResult<Output, unknown, Input>

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
        const action = actions[key] as Action<never, Input, Output>
        return {
          useQuery: (input) => useQuery({ queryKey: [...path, key, input], queryFn: () => action(input) }),
          useMutation: (options) => useMutation({ ...options, mutationFn: (input) => action(input) }),
        } satisfies {
          useQuery: ClientQueryAction<Input, Output>
          useMutation: ClientMutationAction<Input, Output>
        }
      }
      if (typeof actions[key] === 'object') {
        const res = actions[key]
        const newPath = [...path, key]
        return createClientSideProxy(res as Record<string, unknown>, newPath)
      }
    },
  }) as ClientSideProxy<Actions, typeof path>
