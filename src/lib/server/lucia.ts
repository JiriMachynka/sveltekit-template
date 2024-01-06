import { lucia } from 'lucia';
import { sveltekit } from 'lucia/middleware';
import { pg } from '@lucia-auth/adapter-postgresql';
import { dev } from '$app/environment';
import { pool } from '$lib/db/db';

export const auth = lucia({
	adapter: pg(pool, {
		user: 'auth_user',
		key: 'user_key',
		session: 'user_session',
	}),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	getUserAttributes: (data) => {
		return {
			userId: data.id,
			email: data.email,
			username: data.username,
			role: data.role,
			verified: data.verified,
			receive_email: data.receive_email,
			token: data.token,
		};
	},
});

export type Auth = typeof auth;
