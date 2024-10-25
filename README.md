# Actions

Server Action wrapper inspired by trpc.

## Installation

```sh
bun add @yangcurve/actions @tanstack/react-query zod
```

## Usage

### Create Context

```ts
// context.ts
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { initActions } from '@yangcurve/actions'

export const { procedure, createCaller } = initActions({
  createContext: async () => ({
    db,
    session: await auth(),
  }),
})

export const authorizedProcedure = procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) throw new Error('UNAUTHORIZED')
  return next({
    ...ctx,
    session: ctx.session,
  })
})
```

### Create server actions

```ts
// count.ts
'use server'

import { procedure } from './context'
import { z } from 'zod'

let count = 0

export const get = procedure.query(() => count)
export const set = procedure.input(z.number()).mutation(({ input }) => (state = input))
```

### Create server side caller

```ts
// server.ts
import { createCaller } from './context'
import * as count from './count'
import { type InferActionInput, type InferActionOutput } from '@yangcurve/actions'

export const actions = createCaller({
  count,
})

export type ActionInput = InferActionInput<typeof actions>
export type ActionOutput = InferActionOutput<typeof actions>
```

### Create client side caller

```ts
// client.ts
import { actions } from './server'
import { createClientCaller } from '@yangcurve/actions'

export const api = createClientCaller(actions)
```

### In server component

```ts
import { actions } from './server'

export const ServerComponent = async () => {
  const count = await actions.count.get()
  ...
}
```

### In client component

```ts
'use client'

import { api } from './client'

export const ClientComponent = () => {
  const utils = api.useUtils()
  const { data: count } = api.count.get.useQuery()
  const { mutate: set } = api.count.set.useMutation({ onSuccess: () => utils.count.invalidate() })
  ...
}
```
