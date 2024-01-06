import { fail } from '@sveltejs/kit';
import { sendVerificationEmail } from '$lib/config/email-messages';
import { db } from '$lib/db/db.js';
import { Users } from '$lib/db/schema.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const email = decodeURIComponent(params.email);

		const result = await db
			.select()
			.from(Users)
			.where(eq(Users.email, email))
			.limit(1)
			.then(async (user) => {
				let heading = 'Email Verification Problem';
				let message = 'A new email could not be sent. Please contact support if you feel this was an error.';
				if (user) {
					heading = 'Email Verification Sent';
					message =
						'A new verification email was sent.  Please check your email for the message. (Check the spam folder if it is not in your inbox)';
					await db
						.update(Users)
						.set({ verified: false })
						.where(eq(Users.email, user[0].email));

					if (user[0].token) {
						console.log(`Email sent to: ${user[0].email}`);
						sendVerificationEmail(user[0].email, user[0].token);
					}
				}
				return {
					heading,
					message,
				};
			});

		return { result };
	} catch (e) {
		return fail(500, {
			error: e,
		});
	}
};
