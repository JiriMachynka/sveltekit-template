import { fail } from '@sveltejs/kit';
import { setError, superValidate, message } from 'sveltekit-superforms/server';
import { auth } from '$lib/server/lucia';
import { userSchema } from '$lib/config/zod-schemas';
import { updateEmailAddressSuccessEmail } from '$lib/config/email-messages';
import { db } from '$lib/db/db.js';
import { key } from '$lib/db/schema.js';
import { eq } from 'drizzle-orm';

const profileSchema = userSchema.pick({
	username: true,
	email: true,
});

export const load = async (event) => {
	const form = await superValidate(event, profileSchema);
	const session = await event.locals.auth.validate();
	const user = session?.user;
	form.data = {
		username: user?.username,
		email: user?.email,
	};
	return {
		form,
	};
};

export const actions = {
	default: async (event) => {
		const form = await superValidate(event, profileSchema);

		if (!form.valid) {
			return fail(400, {
				form,
			});
		}

		try {
			const session = await event.locals.auth.validate();
			const user = session?.user;

			auth.updateUserAttributes(user?.userId, {
				username: user?.username,
				email: form.data.email,
			});

			if (user?.email !== form.data.email) {
				console.log(`user: ${JSON.stringify(user)}`);
				await db
					.update(key)
					.set({ id: `email: ${form.data.email}` })
					.where(eq(key.id, `email: ${user?.email}`));

				auth.updateUserAttributes(user?.userId, {
					verified: false,
				});
				await updateEmailAddressSuccessEmail(form.data.email, user?.email, user?.token);
			}
		} catch (e) {
			console.error(e);
			return setError(form, 'There was a problem updating your profile.');
		}
		return message(form, 'Profile updated successfully.');
	},
};
