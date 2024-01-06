import { fail, redirect } from '@sveltejs/kit';
import { setError, superValidate } from 'sveltekit-superforms/server';
import { auth } from '$lib/server/lucia';
import type { PageServerLoad, Actions } from './$types';
import { signInSchema } from '$lib/config/zod-schemas';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth.validate();

	if (session) redirect(302, '/tournaments');
	const form = await superValidate(event, signInSchema);
	return { form };
};

export const actions: Actions = {
	default: async (event) => {
		const form = await superValidate(event, signInSchema);

		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		try {
			const key = await auth.useKey('email', form.data.email.toLowerCase(), form.data.password);
			const session = await auth.createSession({
				userId: key.userId,
				attributes: {},
			});
			event.locals.auth.setSession(session);
			redirect(302, '/tournaments');
		} catch (e) {
			//TODO: need to return error message to client
			console.error(e);
			// email already in use
			//const { fieldErrors: errors } = e.flatten();
			return setError(form, 'Email nebo heslo je nesprávné.');
		}

		return { form };
	},
};
