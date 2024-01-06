import { fail } from '@sveltejs/kit';
import { sendWelcomeEmail } from '$lib/config/email-messages';
import { db } from '$lib/db/db.js';
import { eq } from 'drizzle-orm';
import { Users } from '$lib/db/schema.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const token = params.token;
		const result = await db
			.select()
			.from(Users)
			.where(eq(Users.token, token))
			.then(async (user) => {
				let heading = 'Email Verification Problem';
				let message = 'Your email could not be verified. Please contact support if you feel this is an error.';
				if (user) {
					sendWelcomeEmail(user[0].email);
					heading = 'Email Verified';
					message = 'Your email has been verified. You can now <a href="/auth/sign-in" class="underline">sign in</a>';
					await db.update(Users).set({ verified: true }).where(eq(Users.token, token));
				}
				return { heading: heading, message: message };
			});

		return { result };
	} catch (e) {
		return fail(500, {
			error: e,
		});
	}
};
