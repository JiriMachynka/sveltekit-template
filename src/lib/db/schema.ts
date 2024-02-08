import { pgTable, varchar, timestamp, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const Users = pgTable('auth_user', {
	id: varchar('id', { length: 15 }).primaryKey(),
	email: varchar('email', { length: 256 }).notNull().unique(),
	username: varchar('username', { length: 256 }).notNull().unique(),
	password: varchar('password', { length: 256 }).notNull(),
	verified: boolean('verified').notNull().default(false),
	receiveEmail: boolean('receive_email').notNull().default(true),
	token: varchar('token', { length: 256 }).unique(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type UserInsertSchema = typeof Users.$inferInsert;

export const session = pgTable('user_session', {
	id: varchar('id', { length: 128 }).primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	userId: varchar('user_id', { length: 15 })
		.notNull()
		.references(() => Users.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
});

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(Users, {
		fields: [session.userId],
		references: [Users.id],
	}),
}));
