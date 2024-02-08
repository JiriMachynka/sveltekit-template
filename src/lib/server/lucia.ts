import { Lucia, TimeSpan } from 'lucia';
import { DrizzlePostgreSQLAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '$lib/db/db';
import { dev } from '$app/environment';
import { Users, session } from '$lib/db/schema';

const adapter = new DrizzlePostgreSQLAdapter(db, session, Users);

export const lucia = new Lucia(adapter, {
	getUserAttributes: (data) => {
		return { ...data };
	},
	sessionExpiresIn: new TimeSpan(30, 'd'),
	sessionCookie: {
		name: 'session',
		expires: false,
		attributes: {
			secure: !dev,
		},
	},
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

type DatabaseUserAttributes = {
	id: string;
	name: string;
	email: string;
	username: string;
	verified: boolean;
	receive_email: boolean;
	token: string;
};
