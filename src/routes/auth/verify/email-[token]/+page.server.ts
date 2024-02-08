import { fail } from '@sveltejs/kit';
import { sendWelcomeEmail } from '$lib/config/email-messages';
import { db } from '$lib/db/db.js';
import { eq } from 'drizzle-orm';
import { Users } from '$lib/db/schema.js';
import type { PageServerLoad } from './$types';
import { setVerified } from '$lib/server/users';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const token = params.token;
		const result = await db
			.select()
			.from(Users)
			.where(eq(Users.token, token))
			.then(async (user) => {
				let heading = 'Problém s ověřením emailu';
				let message = 'Váš email se nepodařilo ověřit.';
				if (user) {
					sendWelcomeEmail(user[0].email);
					heading = 'Email Ověřen';
					message = 'Váš email byl ověřen. Nyní se můžete <a href="/auth/sign-in" class="underline">přihlásit</a>';
					await setVerified(token);
				}
				return {
					heading,
					message,
				};
			});

		return result;
	} catch (e) {
		return fail(500, { error: e });
	}
};
