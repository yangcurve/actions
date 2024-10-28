import { createCallerFactory } from './caller'
import { createProcedureFactory } from './procedure'
import type { Transformer } from './types'

export const initActions = ({ transformer }: { transformer?: Transformer } = {}) => ({
  createProcedure: createProcedureFactory({ transformer }),
  createCaller: createCallerFactory({ transformer }),
})
