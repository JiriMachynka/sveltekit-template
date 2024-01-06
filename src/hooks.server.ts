import { auth } from '$lib/server/lucia';
import { redirect, type Handle } from '@sveltejs/kit';
import type { HandleServerError } from '@sveltejs/kit';

export const handleError: HandleServerError = ({ error, event }) => {
	const errorId = crypto.randomUUID();

	event.locals.error = error.toString() || undefined;
	event.locals.errorStackTrace = error?.stack || undefined;
	event.locals.errorId = errorId;

	return {
		message: 'An unexpected error occurred.',
		errorId,
	};
};

export const handle: Handle = async ({ event, resolve }) => {
	const startTimer = Date.now();
	event.locals.startTimer = startTimer;

	event.locals.auth = auth.handleRequest(event);
	if (event.locals?.auth) {
		const session = await event.locals.auth.validate();
		const user = session?.user;
		if (user) {
			event.locals.user = user;
		}
		if (event.route.id?.startsWith('/(protected)')) {
			if (!user) redirect(302, '/auth/sign-in');
			if (!user.verified) redirect(302, '/auth/verify/email');
		}
		if (event.route.id?.startsWith('/(admin)')) {
			if (user?.role !== 'ADMIN') redirect(302, '/auth/sign-in');
		}
	}

	const response = await resolve(event);
	return response;
};
