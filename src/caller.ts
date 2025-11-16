import { type Transformer } from './types'

export type Caller<Actions extends Record<string, unknown>> = Actions & {
  __brand: 'Caller'
}

export const createCallerFactory = ({ transformer }: { transformer?: Transformer }) => {
  const createCaller = <Actions extends Record<string, unknown>>(
    actions: Actions,
    path: readonly string[] = [],
  ): Caller<Actions> =>
    new Proxy(
      {},
      {
        get: <Input>(_: unknown, key: string) => {
          // @ts-expect-error ...
          const action = [...path, key].reduce((acc, key) => acc[key], actions) as unknown
          if (typeof action === 'function')
            return async (input: Input) => {
              const output = await action(input)
              return transformer?.parse?.(output) ?? output
            }
          return createCaller(actions, [...path, key])
        },
      },
    ) as Caller<Actions>
  return createCaller
}
