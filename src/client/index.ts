import { createClientProxy, type ClientProxy } from './proxy'
import { createClientUtils, type ClientUtils } from './utils'
import { useQueryClient } from '@tanstack/react-query'

type ClientApi<Actions extends Record<string, unknown>> = ClientProxy<Actions> & {
  useUtils: () => ClientUtils<Actions>
}

export const createClientApi = <Actions extends Record<string, unknown>>(actions: Actions): ClientApi<Actions> =>
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
  ) as ClientApi<Actions>
