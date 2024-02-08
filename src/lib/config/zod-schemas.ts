import { z } from 'zod';

export const userSchema = z.object({
	username: z.string({ required_error: 'Uživatelské jméno je vyžadováno' }).trim(),
	email: z
		.string({ required_error: 'Email je vyžadován' })
		.email({ message: 'Zadejte prosím validní emailovou adresu' }),
	password: z
		.string({ required_error: 'Heslo je vyžadováno' })
		.min(6, { message: 'Heslo musí mít minimálně 6 znaků' })
		.trim(),
	confirmPassword: z
		.string({ required_error: 'Potvrzovací heslo je vyžadováno' })
		.min(6, { message: 'Heslo musí mít minimálně 6 znaků' })
		.trim(),
	verified: z.boolean().default(false),
	token: z.string().optional(),
	receiveEmail: z.boolean().default(true),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
});

export type UserSchema = typeof userSchema;

export const signInSchema = userSchema.pick({
	email: true,
	password: true,
});

export const signUpSchema = userSchema.pick({
	username: true,
	email: true,
	password: true,
	confirmPassword: true,
});

export const resetPasswordSchema = userSchema.pick({ email: true });

export const userUpdatePasswordSchema = userSchema
	.pick({ password: true, confirmPassword: true })
	.superRefine(({ confirmPassword, password }, ctx) => {
		if (confirmPassword !== password) {
			ctx.addIssue({
				code: 'custom',
				message: 'Hesla se musí shodovat',
				path: ['password'],
			});
			ctx.addIssue({
				code: 'custom',
				message: 'Hesla se musí shodovat',
				path: ['confirmPassword'],
			});
		}
	});

export type UserUpdatePasswordSchema = typeof userUpdatePasswordSchema;
