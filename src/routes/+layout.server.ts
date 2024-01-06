import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash((event: { locals: { user: Lucia.UserAttributes } }) => {
	if (event.locals.user) {
		return {
			user: event.locals.user,
		};
	}
});
