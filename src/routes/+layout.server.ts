import { loadFlash } from 'sveltekit-flash-message/server';

export const load = loadFlash(({ locals }) => {
	if (locals.user) {
		return {
			user: locals.user,
		};
	}
});
