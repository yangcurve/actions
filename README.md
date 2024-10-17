# Actions

Server Action wrapper inspired by trpc.

## Installation

```sh
bun add @yangcurve/actions
```

## Usage

### Create Server Actions

```ts
// say-hello.ts
import { procedure } from '@yangcurve/actions'
import { z } from 'zod'

export const sayHello = procedure.input(z.object({ name: z.string() })).query(({ name }) => `Hello, ${name}!`)
```

### Add server actions in a single entrypoint and create client side proxy

```ts
// actions.ts
import { sayHello } from './say-hello'

export const actions = {
  sayHello,
}

export const api = createClientSideProxy(actions)
```

You can use `actions` directly in server components.

In client component, you can use `api` like this.

```ts
'use client'

import { api } from './api'

export const ClientComponent = () => {
  const { data, isLoading } = api.sayHello.useQuery({ name: 'yangcurve' })
  ...
}
```
