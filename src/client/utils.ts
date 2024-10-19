import { type Action } from '..'
import { type QueryClient } from '@tanstack/react-query'

export type ClientUtils<Actions extends Record<string, unknown>> = {
  [Key in keyof Actions]: Key extends string ?
    Actions[Key] extends Action<infer Type, infer Input, unknown> ?
      Type extends 'query' ?
        {
          invalidate: (input?: Input) => Promise<void>
        }
      : {
          isMutating: () => number
        }
    : Actions[Key] extends Record<string, unknown> ? ClientUtils<Actions[Key]>
    : never
  : never
} & {
  invalidate: () => Promise<void>
}

export const createClientUtils = <Actions extends Record<string, unknown>>(
  actions: Actions,
  queryClient: QueryClient,
  path: readonly string[] = [],
): ClientUtils<Actions> =>
  new Proxy(
    {},
    {
      get: <Input>(_: unknown, key: string) =>
        key === 'invalidate' ?
          (input?: Input) => queryClient.invalidateQueries({ queryKey: [...path, input].filter(Boolean) })
        : key === 'isMutating' ? () => queryClient.isMutating({ mutationKey: path })
        : createClientUtils(actions, queryClient, [...path, key]),
    },
  ) as ClientUtils<Actions>
