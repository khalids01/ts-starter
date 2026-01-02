import { treaty } from '@elysiajs/eden'
import type { App } from '../../../server'
import { env } from '@ts-starter/env/web'

export const client = treaty<App>(env.VITE_SERVER_URL, {
  fetch: {
    credentials: 'include'
  }
})
