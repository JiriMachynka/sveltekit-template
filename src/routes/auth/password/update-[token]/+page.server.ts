import { fail, redirect, type Actions } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { userUpdatePasswordSchema } from '$lib/config/zod-schemas';
import { auth } from '$lib/server/lucia';
import { db } from '$lib/db/db.js';
import { Users } from '$lib/db/schema.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const form = await superValidate(event, userUpdatePasswordSchema);
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, userUpdatePasswordSchema);

		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		try {
			const token = event.params.token as string;
			console.log('update user password');
			const newToken = crypto.randomUUID();
			//get email from token
			const user = await db
				.select({
					email: Users.email,
				})
				.from(Users)
				.where(eq(Users.token, token))
				.limit(1);

			if (user[0]?.email) {
				await auth.updateKeyPassword('email', user[0].email, form.data.password);
				// need to update with new token because token is also used for verification
				// and needs a new verification token in case user has not verified their account
				// and already forgot their password before verifying. Now they can get a new one resent.
				await db.update(Users).set({ token: newToken }).where(eq(Users.token, token));
			} else {
				return setError(
					form,
					'Email address not found for this token. Please contact support if you need further help.',
				);
			}
		} catch (e) {
			console.error(e);
			return setError(
				form,
				'The was a problem resetting your password. Please contact support if you need further help.',
			);
		}
		const token = event.params.token;
		redirect(302, `/auth/password/update-${token}/success`);
	},
};
