# Actions

Server Action wrapper inspired by trpc.

## Installation

```sh
bun add @yangcurve/actions
```

## Usage

### Create server actions

```ts
// count.ts
'use server'

import { a } from '@yangcurve/actions'
import { z } from 'zod'

let count = 0

export const get = a.query(() => count)
export const set = a.input(z.number()).mutation((value) => {
  count = value
})
```

### Add server actions in a single entrypoint

```ts
// server.ts
import * as count from './count'
import { type InferActionInput, type InferActionOutput } from '@yangcurve/actions'

export const actions = {
  count,
}

export type ActionInput = InferActionInput<typeof actions>
export type ActionOutput = InferActionOutput<typeof actions>
```

### Create client side api

```ts
// client.ts
import { actions } from './server'
import { createClientApi } from '@yangcurve/actions'

export const api = createClientApi(actions)
```

### In server component

```ts
import { actions } from './server'

export const ServerComponent = async () => {
  const count = await actions.count.get()
  ...
}

// or import server actions directly
import { get } from './count'

export const ServerComponent = async () => {
  const count = await get()
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
