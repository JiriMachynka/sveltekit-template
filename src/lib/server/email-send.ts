import { RESEND_API_KEY, FROM_EMAIL } from '$env/static/private';
import { Resend } from 'resend';

export default async function sendEmail(email: string, subject: string, bodyHtml?: string, bodyText?: string) {
	const resend = new Resend(RESEND_API_KEY);

	try {
		if (!bodyText) {
			try {
				await resend.emails.send({
					from: FROM_EMAIL,
					to: [email],
					subject: subject,
					html: bodyHtml,
					text: '',
				});
			} catch (err) {
				throw new Error(`Error sending email: ${JSON.stringify(err)}`);
			}
		} else if (!bodyHtml) {
			try {
				await resend.emails.send({
					from: FROM_EMAIL,
					to: [email],
					subject: subject,
					text: bodyText,
				});
			} catch (err) {
				throw new Error(`Error sending email: ${JSON.stringify(err)}`);
			}
		} else {
			try {
				await resend.emails.send({
					from: FROM_EMAIL,
					to: [email],
					subject: subject,
					html: bodyHtml,
					text: bodyText,
				});
				console.log('E-mail sent successfully!');
			} catch (err) {
				throw new Error(`Error sending email: ${JSON.stringify(err)}`);
			}
		}
		console.log('E-mail sent successfully!');

		return {
			statusCode: 200,
			message: 'E-mail sent successfully.',
		};
	} catch (err) {
		throw new Error(`Error sending email: ${JSON.stringify(err)}`);
	}
}
