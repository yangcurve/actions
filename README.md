# Actions

Server Action wrapper inspired by trpc.

## Installation

```sh
bun add @yangcurve/actions @tanstack/react-query zod
```

## Usage

### Initialize Actions

```ts
// init.ts
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { initActions } from '@yangcurve/actions'
import SuperJSON from 'superjson'

export const { createProcedure, createCaller, createClientCaller } = initActions({
  transformer: SuperJSON // optional
})
```

### Create procedures

```ts
// procedure.ts
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { createProcedure } from './init'

const createContext = async () => ({
  db,
  session: await auth(),
})

export const procedure = createProcedure({ createContext })
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

import { procedure } from './procedure'
import { z } from 'zod'

let count = 0

export const get = procedure.query(() => count)
export const set = procedure.input(z.number()).mutation(({ input }) => (state = input))
```

### Create callers

```ts
// caller.ts
import { type InferActionInput, type InferActionOutput } from '@yangcurve/actions'
import * as count from './count'
import { createCaller, createClientCaller } from './init'

export const actions = createCaller({ count }) // server side caller
export const api = createClientCaller(actions) // client side caller

export type ActionInput = InferActionInput<typeof actions>
export type ActionOutput = InferActionOutput<typeof actions>
```

### In server component

```ts
import { actions } from './caller'

export const ServerComponent = async () => {
  const count = await actions.count.get()
  ...
}
```

### In client component

```ts
'use client'

import { api } from './caller'

export const ClientComponent = () => {
  const utils = api.useUtils()
  const { data: count } = api.count.get.useQuery()
  const { mutate: set } = api.count.set.useMutation({ onSuccess: () => utils.count.invalidate() })
  ...
}
```
