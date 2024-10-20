import { createCallerFactory } from './caller'
import { createProcedure } from './procedure'
import type { Transformer } from './types'

export type InitOptions<Context> = {
  createContext?: () => Context | Promise<Context>
  transformer?: Transformer
}
export const initActions = <Context>({ createContext, transformer }: InitOptions<Context> = {}) => ({
  procedure: createProcedure({
    createContext,
    transformer,
  }),
  createCaller: createCallerFactory({ transformer }),
})
