import {
  type Action,
  type ActionBuilder,
  type ActionType,
  type ClientMutationAction,
  type ClientQueryAction,
  type ClientSideProxy,
  type Procedure,
} from './types'
import { useMutation, useQuery } from '@tanstack/react-query'
import { z } from 'zod'

const getActionBuilder =
  <T extends ActionType, Schema extends z.ZodTypeAny>(Schema: Schema): ActionBuilder<T, Schema> =>
  (resolver) =>
  async (input) =>
    resolver(Schema.parse(input) as z.infer<typeof Schema>)

export const procedure = {
  query: getActionBuilder(z.void()),
  mutation: getActionBuilder(z.void()),
  input: (Schema) => ({
    query: getActionBuilder(Schema),
    mutation: getActionBuilder(Schema),
  }),
} satisfies Procedure

export const createClientSideProxy = <Actions extends Record<string, unknown>, Input, Output>(
  actions: Actions,
  path: ReadonlyArray<string> = [],
): ClientSideProxy<Actions, typeof path> =>
  new Proxy(actions, {
    get: <Key extends string & keyof Actions>(actions: Actions, key: Key) => {
      if (typeof actions[key] === 'function') {
        const action = actions[key] as Action<never, Input, Output>
        return {
          useQuery: (input) =>
            useQuery({
              queryKey: [...path, key, input],
              queryFn: () => action(input),
            }),
          useMutation: (options) => useMutation({ ...options, mutationFn: (input) => action(input) }),
        } satisfies {
          useQuery: ClientQueryAction<Input, Output>
          useMutation: ClientMutationAction<Input, Output>
        }
      }

      const res = actions[key]
      const newPath = [...path, key]
      return createClientSideProxy(res as Record<string, unknown>, newPath)
    },
  }) as ClientSideProxy<Actions, typeof path>
