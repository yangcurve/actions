import { type Caller } from '../caller'
import { createClientProxy, type ClientProxy } from './proxy'
import { createClientUtils, type ClientUtils } from './utils'
import { useQueryClient } from '@tanstack/react-query'

type ClientCaller<Actions extends Record<string, unknown>> = ClientProxy<Actions> & {
  useUtils: () => ClientUtils<Actions>
}

export const createClientCaller = <Actions extends Record<string, unknown>>(
  actions: Caller<Actions>,
): ClientCaller<Actions> =>
  new Proxy(
    {},
    {
      get: (_: unknown, key: string) =>
        key === 'useUtils' ?
          () => {
            const queryClient = useQueryClient()
            return createClientUtils(actions, queryClient)
          }
        : createClientProxy(actions, key),
    },
  ) as ClientCaller<Actions>
