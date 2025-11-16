# Actions

Server Action wrapper inspired by trpc.

## Installation

```sh
bun add @yangcurve/actions @tanstack/react-query zod
```

## Usage

### Initialize Actions

```typescript
// init.ts
import { auth } from '@/server/auth'
import { db } from '@/server/db'
import { initActions } from '@yangcurve/actions'
import SuperJSON from 'superjson'

export const { createProcedure, createCaller, createClientCaller } = initActions({
  transformer: SuperJSON, // optional
})
```

### Create procedures

```typescript
// procedures.ts
import { createProcedure } from './init'
import { auth } from '@/server/auth'
import { db } from '@/server/db'

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

```typescript
// count.ts
'use server'

import { procedure } from './procedures'
import { z } from 'zod'

let count = 0

export const get = procedure.query(() => count)
export const set = procedure.input(z.number()).mutation(({ input }) => (state = input))
```

### Create callers

```typescript
// caller.ts
import * as count from './count'
import { createCaller, createClientCaller } from './init'
import type { InferActionInput, InferActionOutput } from '@yangcurve/actions'

export const actions = createCaller({ count }) // server side caller
export const api = createClientCaller(actions) // client side caller

export type ActionInput = InferActionInput<typeof actions>
export type ActionOutput = InferActionOutput<typeof actions>
```

### In server component

```typescript
import { actions } from './caller'

export const ServerComponent = async () => {
  const count = await actions.count.get()
  ...
}
```

### In client component

```typescript
'use client'

import { api } from './caller'

export const ClientComponent = () => {
  const utils = api.useUtils()
  const { data: count } = api.count.get.useQuery()
  const { mutate: set } = api.count.set.useMutation({ onSuccess: () => utils.count.invalidate() })
  ...
}
```
