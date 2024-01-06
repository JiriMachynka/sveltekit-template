import { fail, redirect, type Actions } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { sendPasswordResetEmail } from '$lib/config/email-messages';
import { db } from '$lib/db/db';
import { Users } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { resetPasswordSchema } from '$lib/config/zod-schemas';

export const load: PageServerLoad = async (event) => {
	const form = await superValidate(event, resetPasswordSchema);
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, resetPasswordSchema);

		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		try {
			console.log('reset user password');
			const token = crypto.randomUUID();
			await db.update(Users).set({ token }).where(eq(Users.email, form.data.email));

			await sendPasswordResetEmail(form.data.email, token);
		} catch (e) {
			console.error(e);
			return setError(
				form,
				'The was a problem resetting your password. Please contact support if you need further help.',
			);
		}
		redirect(302, '/auth/password/reset/success');
	},
};
