import { fail } from '@sveltejs/kit';
import { sendVerificationEmail } from '$lib/config/email-messages';
import { db } from '$lib/db/db.js';
import { Users } from '$lib/db/schema.js';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { setNotVerified } from '$lib/server/users';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const email = decodeURIComponent(params.email);

		const result = await db
			.select()
			.from(Users)
			.where(eq(Users.email, email))
			.limit(1)
			.then(async (user) => {
				let heading = 'Problém s ověřením emailu';
				let message = 'Nový e-mail se nepodařilo odeslat.';
				if (user) {
					heading = 'Odeslaný ověřovací e-mail';
					message =
						'Byl odeslán nový ověřovací e-mail.  Zkontrolujte si prosím, zda ve své e-mailové schránce nenajdete tuto zprávu. (Pokud ji nemáte ve složce doručené pošty, zkontrolujte složku spam).';
					await setNotVerified(user[0].email);

					if (user[0].token) {
						console.log(`Email poslán: ${user[0].email}`);
						sendVerificationEmail(user[0].email, user[0].token);
					}
				}
				return {
					heading,
					message,
				};
			});

		return { result };
	} catch (e) {
		return fail(500, { error: e });
	}
};
