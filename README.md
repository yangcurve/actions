# ACTIONS

Server Action wrapper inspired by trpc.


## USAGE

```sh
pnpm add @yangcurve/actions
```

Initialize Procedures
```ts
// procedures.ts
import { prisma } from '@/server/prisma'
import { createProcedure } from '@yangcurve/actions'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'

const createContext = async () => ({
  db: prisma,
  session: await getServerSession(authOptions),
})

const procedure = createProcedure(createContext)

export const publicProcedure = procedure
export const protectedProcedure = procedure.use((ctx) => {
  if (!ctx.session || !ctx.session.user) {
    throw new Error('UNAUTHENTICATED')
  }

  return {
    ...ctx,
    session: {
      ...ctx.session,
    },
  }
})
```

Define Server Actions
```ts
// post.ts
'use server'

import { protectedProcedure, publicProcedure } from './procedures'
import { z } from 'zod'

export const hello = publicProcedure
  .input(z.object({ text: z.string() }))
  .query(async ({ input }) => {
    return {
      greeting: `Hello ${input.text}`,
    }
  })

export const getSecretMessage = protectedProcedure.query(async () => {
  return 'you can now see this secret message!'
})

export const create = protectedProcedure
  .input(z.object({ title: z.string().min(1) }))
  .mutation(async ({ ctx, input }) => {
    const newPost = ctx.db.post.create({
      data: {
        title: input.title
      }
    })
    return newPost
  })
```

Register Server Actions to one object
```ts
// actions.ts
import * as post from './post'
import { type FlattenObjectKeys, type InferActionIOFromKey } from '@yangcurve/actions'

export const actions = {
  post,
} as const
export type Actions = typeof actions

type ActionKey = FlattenObjectKeys<Actions>
export type ActionInput<Key extends ActionKey> = InferActionIOFromKey<'input', Key, Actions>
export type ActionOutput<Key extends ActionKey> = InferActionIOFromKey<'output', Key, Actions>
```

Create Client Side API
```ts
// client.ts
import { createClientApi } from "@yangcurve/actions";
import { actions } from "./actions";

export const api = createClientApi(actions)
```

In Server Component:
```ts
type NewPost = ActionOutput<'post.create'>
const ServerComponent: React.FC = async () => {
  const message = await actions.post.hello({ text: 'from server' })
  const newPost: NewPost = await actions.post.create({ title: 'new post from server' })

  return (
    <>
      <div>{message.greeting}</div>
      <div>title of new post: {newPost.title}</div>
    </>
  )
}
```

In client Component:
```ts
type NewPost = ActionOutput<'post.create'>
const ClientComponent: React.FC = () => {
  const [newPost, setNewPost] = useState<NewPost | undefined>()
  const { data: message, isLoading } = api.query('post.hello')({ text: 'from client' })
  const { mutate } = api.mutation('post.create')({
    onSuccess: (data) => {
      setNewPost(data)
    },
  })

  if (isLoading) return <></>
  return (
    <>
      <div>{message?.greeting}</div>
      {newPost ? (
        <div>title of new post: {newPost.title}</div>
      ) : (
        <button onClick={() => mutate({ title: 'new post from client' })}>
          create new post
        </button>
      )}
    </>
  )
}
```
