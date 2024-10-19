import { createClientApi, type ClientApi } from './api'
import { createClientUtils, type ClientUtils } from './utils'
import { useQueryClient } from '@tanstack/react-query'

type ClientProxy<Actions extends Record<string, unknown>> = {
  api: ClientApi<Actions>
  useUtils: () => ClientUtils<Actions>
}

export const createClientProxy = <Actions extends Record<string, unknown>>(actions: Actions) => ({
  api: createClientApi(actions),
  useUtils: () => createClientUtils(actions, useQueryClient()),
}) satisfies ClientProxy<Actions>
