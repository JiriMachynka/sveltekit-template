import { fail, redirect, type Actions } from '@sveltejs/kit';
import { setFlash } from 'sveltekit-flash-message/server';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/server/lucia';
import { signUpSchema } from '$lib/config/zod-schemas';
import { sendVerificationEmail } from '$lib/config/email-messages';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth.validate();
	if (session) redirect(302, '/dashboard');
	const form = await superValidate(event, signUpSchema);
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, signUpSchema);

		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		if (form.data.password !== form.data.confirmPassword) {
			return setError(form, 'confirmPassword', 'Hesla se neshodují.');
		}

		try {
			console.log('creating user');
			const token = crypto.randomUUID();

			const user = await auth.createUser({
				key: {
					providerId: 'email',
					providerUserId: form.data.email.toLowerCase(),
					password: form.data.password,
				},
				attributes: {
					email: form.data.email.toLowerCase(),
					username: form.data.username,
					verified: false,
					receive_email: true,
					token: token,
				},
			});

			await sendVerificationEmail(form.data.email, token);
			const session = await auth.createSession({ userId: user.userId, attributes: {} });
			event.locals.auth.setSession(session);
			setFlash(
				{ type: 'success', message: 'Účet vytvořen. Prosím zkontrolujte si email pro ověření vašeho účtu.' },
				event,
			);
		} catch (e) {
			console.error(e);
			return setError(form, 'email', 'Uživatel s tímto emailem již existuje.');
		}

		return { form };
	},
};
