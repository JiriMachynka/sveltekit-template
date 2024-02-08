import { redirect, type Actions } from '@sveltejs/kit';
import { message, setError, superValidate } from 'sveltekit-superforms/server';
import { lucia } from '$lib/server/lucia';
import { signUpSchema } from '$lib/config/zod-schemas';
import { sendVerificationEmail } from '$lib/config/email-messages';
import type { PageServerLoad } from './$types';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import { checkIfEmailExists, createNewUser } from '$lib/server/users';

export const load: PageServerLoad = async (event) => {
	if (event.locals.session) redirect(302, '/tournaments');

	const form = await superValidate(event, signUpSchema);

	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, signUpSchema);

		if (!form.valid) {
			return message(form, {
				alertType: 'error',
				alertText: 'Něco se pokazilo.',
			});
		}

		const { username, email, password, confirmPassword } = form.data;

		try {
			const isEmailAlreadyRegistered = await checkIfEmailExists(email);

			if (isEmailAlreadyRegistered) {
				return setError(form, 'email', 'Email je již zaregistrován.');
			}

			if (password !== confirmPassword) {
				return setError(form, 'confirmPassword', 'Hesla se neshodují.');
			}

			const userId = generateId(15);
			const hashedPassword = await new Argon2id().hash(password);

			const token = crypto.randomUUID();
			await createNewUser({
				id: userId,
				username: username,
				email: email,
				password: hashedPassword,
				token,
			});

			sendVerificationEmail(email, token);

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes,
			});

			return;
		} catch (_e) {
			return message(form, {
				alertType: 'error',
				alertText: 'Něco se pokazilo.',
			});
		}
	},
};
