import { z } from 'zod';

export const userSchema = z.object({
	username: z.string({ required_error: 'Usename is required' }).min(1, { message: 'Username is required' }).trim(),
	email: z.string({ required_error: 'Email is required' }).email({ message: 'Please enter a valid email address' }),
	password: z
		.string({ required_error: 'Password is required' })
		.min(6, { message: 'Password must be at least 6 characters' })
		.trim(),
	confirmPassword: z
		.string({ required_error: 'Password is required' })
		.min(6, { message: 'Password must be at least 6 characters' })
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
				message: 'Password and Confirm Password must match',
				path: ['password'],
			});
			ctx.addIssue({
				code: 'custom',
				message: 'Password and Confirm Password must match',
				path: ['confirmPassword'],
			});
		}
	});

export type UserUpdatePasswordSchema = typeof userUpdatePasswordSchema;
