import { Hono } from 'hono'
import { logger } from 'hono/logger'
import auth from './auth'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import type { User, Session } from "lucia";
import { getCookie } from "hono/cookie";
import { csrf } from "hono/csrf";
import { lucia } from './auth/lucia'
import { cors } from 'hono/cors'

const app = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}>()

app.use(logger())
app.use(cors())
app.use(csrf())

app.use("*", async (c, next) => {
  const sessionId = getCookie(c, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    c.set("user", null);
    c.set("session", null);
    return next();
  }

  const { session, user } = await lucia.validateSession(sessionId);

  if (session && session.fresh) {
    c.header("Set-Cookie", lucia.createSessionCookie(session.id).serialize(), {
      append: true
    });
  }

  if (!session) {
    c.header("Set-Cookie", lucia.createBlankSessionCookie().serialize(), {
      append: true
    });
  }

  c.set("user", user);
  c.set("session", session);
  return next();
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route("auth", auth)

app.notFound((c) => {
  return c.text('Custom 404 Message', 404)
})

app.onError((err, c) => {
  console.error(err)

  if (err instanceof HTTPException) {
    return err.getResponse()
  }

  if (err instanceof ZodError) {
    return c.json(
      {
        error: {
          message: err.issues.map((issue) => issue.message).join(' '),
        },
      },
      400,
    )
  }

  return c.json({ error: "Internal Server Error" }, 500)
})

const port = process.env["PORT"] || 5001

export default {
  port,
  fetch: app.fetch,
}
