# Actions

Server Action wrapper inspired by trpc.

## Installation

```sh
bun add @yangcurve/actions
```

## Usage

### Create server actions
```ts
// say-hello.ts
import { procedure } from '@yangcurve/actions'
import { z } from 'zod'

export const sayHello = procedure.input(z.object({ name: z.string() })).query(({ name }) => `Hello, ${name}!`)
```

### Add server actions in a single entrypoint
```ts
// actions.ts
import { sayHello } from './say-hello'

export const actions = {
  sayHello,
}
```

### Create client side proxy
```ts
// api.ts
import { actions } from './actions'
import { createClientSideProxy } from '@yangcurve/actions'

export const api = createClientSideProxy(actions)
```

### In server component
```ts
import { actions } from './actions'

export const ServerComponent = async () => {
  const hello = await actions.sayHello({ name: 'yangcurve' })
  ...
}

// or import server actions directly
import { sayHello } from './say-hello'

export const ServerComponent = async () => {
  const hello = await sayHello({ name: 'yangcurve' })
  ...
}
```

### In client component
```ts
'use client'

import { api } from './api'

export const ClientComponent = () => {
  const { data: hello, isLoading } = api.sayHello.useQuery({ name: 'yangcurve' })
  ...
}
```
