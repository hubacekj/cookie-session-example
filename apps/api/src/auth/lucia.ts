import { Lucia, TimeSpan } from "lucia";
import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "../../../api/db";
import { users, sessions } from "../../../api/db/schema";
import type { UserPublic } from "../../types/user";

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  sessionExpiresIn: new TimeSpan(7, "d"),
  getUserAttributes: (attributes) => {
    return {
      name: attributes.name,
      email: attributes.email,
      id: attributes.id,
    }
  },
});

// IMPORTANT!
declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}

interface DatabaseUserAttributes extends UserPublic { }