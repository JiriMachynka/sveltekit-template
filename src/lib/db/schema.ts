import { pgTable, varchar, timestamp, boolean, bigint } from 'drizzle-orm/pg-core';

export const Users = pgTable('auth_user', {
	id: varchar('id', { length: 15 }).primaryKey(),
	email: varchar('email', { length: 256 }).notNull().unique(),
	username: varchar('username', { length: 256 }).notNull().unique(),
	verified: boolean('verified').notNull().default(false),
	receiveEmail: boolean('receive_email').notNull().default(true),
	token: varchar('token', { length: 256 }).unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const session = pgTable('user_session', {
	id: varchar('id', { length: 128 }).primaryKey(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => Users.id),
	activeExpires: bigint('active_expires', { mode: 'number' }).notNull(),
	idleExpires: bigint('idle_expires', { mode: 'number' }).notNull(),
});

export const key = pgTable('user_key', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => Users.id),
	hashedPassword: varchar('hashed_password', { length: 255 }),
});
