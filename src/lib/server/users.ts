import { Users, type UserInsertSchema } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '$lib/db/db';

export const createNewUser = async (user: UserInsertSchema) => {
	await db.insert(Users).values(user);
};

export const updatePassword = async (token: string, password: string) => {
	await db.update(Users).set({ password }).where(eq(Users.token, token));
};

export const updateToken = async (token: string, newToken: string) => {
	await db.update(Users).set({ token: newToken }).where(eq(Users.token, token));
};

export const setVerified = async (token: string) => {
	await db.update(Users).set({ verified: true }).where(eq(Users.token, token));
	await db.update(Users).set({ token: null }).where(eq(Users.token, token));
};

export const setNotVerified = async (email: string) => {
	await db.update(Users).set({ verified: false }).where(eq(Users.email, email));
};

export const findUser = async (email: string) => {
	const [existingUser] = await db
		.select({
			id: Users.id,
			password: Users.password,
		})
		.from(Users)
		.where(eq(Users.email, email))
		.limit(1);

	return existingUser;
};

export const findUserByToken = async (token: string) => {
	const [user] = await db
		.select({
			email: Users.email,
		})
		.from(Users)
		.where(eq(Users.token, token))
		.limit(1);

	return user;
};

export const checkIfEmailExists = async (email: string) => {
	const [existingUser] = await db
		.select({
			id: Users.id,
		})
		.from(Users)
		.where(eq(Users.email, email))
		.limit(1);

	return !!existingUser;
};
