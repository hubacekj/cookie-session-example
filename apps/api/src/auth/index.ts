import { zValidator } from "@hono/zod-validator"
import { Hono } from "hono"
import { UserLoginSchema, UserSignUpSchema } from "../../types/user"
import { ZodError, z } from "zod"
import { lucia } from "./lucia"
import type { Session, User } from "lucia"
import { generateIdFromEntropySize } from "lucia"
import { db } from "../../db"
import { users } from "../../db/schema"
import { HTTPException } from "hono/http-exception"

const auth = new Hono<{
  Variables: {
    user: User | null;
    session: Session | null;
  };
}
>()

auth.post(
  '/login',
  zValidator(
    "json",
    UserLoginSchema,
    (result) => {
      if (!result.success) throw new ZodError(result.error.issues)
    }
  ),
  async (c) => {
    const { email, password } = c.req.valid('json');

    const [user] = await db.query.users.findMany({
      where: (users, { eq }) => eq(users.email, email), limit: 1
    });

    if (!user) {
      const errorResponse = new Response('Invalid email or password', {
        status: 401,
        headers: {
          Authenticate: 'error="invalid_email_or_password"',
        },
      })
      throw new HTTPException(401, { res: errorResponse })
    }

    const validPassword = await Bun.password.verify(password, user.hashedPassword);

    if (!validPassword) {
      const errorResponse = new Response('Invalid email or password', {
        status: 401,
        headers: {
          Authenticate: 'error="invalid_email_or_password"',
        },
      })
      throw new HTTPException(401, { res: errorResponse })
    }

    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    c.header("Set-Cookie", sessionCookie.serialize(), {
      append: true
    });

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });
  }
)

auth.post(
  "/signup",
  zValidator(
    "json",
    UserSignUpSchema,
    (result) => {
      if (!result.success) throw new ZodError(result.error.issues)
    }
  ),
  async (c) => {
    const { email, password, name } = c.req.valid('json');

    const passwordHash = await Bun.password.hash(password);
    const userId = generateIdFromEntropySize(10);

    const [user] = await db.insert(users).values({
      id: userId,
      email,
      hashedPassword: passwordHash,
      name
    }).returning({ id: users.id });

    return c.json(user, 201);
  }
)

auth.post("/logout",
  zValidator(
    "json",
    z.null(),
    (result) => {
      if (!result.success) throw new ZodError(result.error.issues)
    }
  ),
  zValidator(
    "query",
    z.object({ all: z.enum(["true", "false"]).default("false") }),
    (result) => {
      if (!result.success) throw new ZodError(result.error.issues)
    }),
  async (c) => {
    const { all } = c.req.valid('query');
    const session = c.get("session");
    const user = c.get("user");

    if (!session || !user) {
      const errorResponse = new Response('Unauthorized', {
        status: 401,
        headers: {
          Authenticate: 'error="invalid_token"',
        },
      })
      throw new HTTPException(401, { res: errorResponse })
    }

    if (all === "false") {
      await lucia.invalidateSession(session.id);
      return c.json(null, 204)
    }

    await lucia.invalidateUserSessions(user.id);
    return c.json(null, 204)
  }
)

auth.get("/me", (c) => {
  const user = c.get("user");
  const session = c.get("session");

  if (!session || !user) {
    const errorResponse = new Response('Unauthorized', {
      status: 401,
      headers: {
        Authenticate: 'error="invalid_token"',
      },
    })
    throw new HTTPException(401, { res: errorResponse })
  }

  return c.json(user);
})

export default auth;