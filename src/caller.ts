import SuperJSON from 'superjson'

export type Caller<Actions extends Record<string, unknown>> = Actions & { __brand: 'caller' }

export const createCaller = <Actions extends Record<string, unknown>>(
  actions: Actions,
  path: readonly string[] = [],
): Caller<Actions> =>
  new Proxy(
    {},
    {
      get: <Input, Output>(_: unknown, key: string) => {
        // @ts-expect-error ...
        const action = path.reduce((acc, key) => acc[key], actions) as unknown
        if (typeof action === 'function') return async (input: Input) => SuperJSON.parse(await action(input)) as Output

        return createCaller(actions, [...path, key])
      },
    },
  ) as Caller<Actions>
