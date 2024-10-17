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

### Add your server actions in a single entrypoint

```ts
// actions.ts
import { sayHello } from './say-hello'

export const actions = {
  sayHello,
}
```

You can use it directly in server components.

### Create Client Side Proxy

```ts
'use client'

import { actions } from './actions'
import { createClientSideProxy } from '@yangcurve/actions'

export const api = createClientSideProxy(actions)
```

In client component, you can use it like this.

```ts
'use client'

import { api } from './api'

export const ClientComponent = () => {
  const { data, isLoading } = api.sayHello.useQuery({ name: 'yangcurve' })
  ...
}
```
