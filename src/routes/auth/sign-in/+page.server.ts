import { message, setError, superValidate } from 'sveltekit-superforms/server';
import { lucia } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import { signInSchema } from '$lib/config/zod-schemas';
import { Argon2id } from 'oslo/password';
import { findUser } from '$lib/server/users';

export const load: PageServerLoad = async (event) => {
	const form = await superValidate(event, signInSchema);

	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, signInSchema);

		if (!form.valid) {
			return message(form, {
				alertType: 'error',
				alertText: 'Něco se pokazilo.',
			});
		}

		const { email, password } = form.data;
		const existingUser = await findUser(email);

		if (!existingUser) {
			return setError(form, 'Uživatel neexistuje.');
		}
		const validPassword = await new Argon2id().verify(existingUser.password, password);

		if (!validPassword) {
			return setError(form, 'password', 'Špatné heslo.');
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes,
		});
	},
};
