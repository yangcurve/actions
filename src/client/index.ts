import { createClientApi, type ClientApi } from './api'
import { createClientUtils, type ClientUtils } from './utils'
import { useQueryClient } from '@tanstack/react-query'

type ClientProxy<Actions extends Record<string, unknown>> = {
  api: ClientApi<Actions>
  useUtils: () => ClientUtils<Actions>
}

export const createClientProxy = <Actions extends Record<string, unknown>>(actions: Actions): ClientProxy<Actions> =>
  new Proxy(
    {},
    {
      get: (_: unknown, key: string) =>
        key === 'useUtils' ?
          () => {
            const queryClient = useQueryClient()
            return createClientUtils(actions, queryClient)
          }
        : createClientApi(actions),
    },
  ) as ClientProxy<Actions>
