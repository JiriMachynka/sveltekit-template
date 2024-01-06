import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await event.locals.auth.validate();
	const user = session?.user;
	if (!user) redirect(302, '/auth/sign-in');
	return { user };
};
