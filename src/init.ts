import { createCallerFactory } from './caller'
import { createClientCaller } from './client'
import { createProcedureFactory } from './procedure'
import { type Transformer } from './types'

export const initActions = ({ transformer }: { transformer?: Transformer } = {}) => ({
  createProcedure: createProcedureFactory({ transformer }),
  createCaller: createCallerFactory({ transformer }),
  createClientCaller,
})
