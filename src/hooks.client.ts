import type { HandleClientError } from '@sveltejs/kit';

export const handleError: HandleClientError = ({ error }) => {
	const errorId = crypto.randomUUID();
	console.error(error);

	return {
		message: 'An unexpected error occurred.',
		errorId,
	};
};
