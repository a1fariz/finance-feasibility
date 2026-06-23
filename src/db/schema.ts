import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, doublePrecision } from 'drizzle-orm/pg-core';

// Define the 'users' table.
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  role: text('role').default('user').notNull(), // 'user' or 'admin'
  createdAt: timestamp('created_at').defaultNow(),
});

// Define the 'projects' table
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: text('name').notNull(),
  description: text('description'),
  
  // Financial Inputs
  investmentCost: doublePrecision('investment_cost').default(100000).notNull(),
  monthlyRevenue: doublePrecision('monthly_revenue').default(15000).notNull(),
  growthRate: doublePrecision('growth_rate').default(5.0).notNull(), // annual % growth for revenue
  inflationRate: doublePrecision('inflation_rate').default(2.5).notNull(), // annual % inflation for expenses
  maintenanceCost: doublePrecision('maintenance_cost').default(2000).notNull(), // annual maintenance cost
  operatingCost: doublePrecision('operating_cost').default(4000).notNull(), // monthly operating cost (salaries, utilities, etc.)
  taxRate: doublePrecision('tax_rate').default(20.0).notNull(), // tax % (e.g. 20%)
  residualValue: doublePrecision('residual_value').default(15000).notNull(), // residual value at the end of analysis
  depreciationYears: integer('depreciation_years').default(5).notNull(), // useful life of the asset for straight-line depreciation
  discountRate: doublePrecision('discount_rate').default(10.0).notNull(), // discount rate (discount factor WACC %)
  analysisYears: integer('analysis_years').default(5).notNull(), // years of project life (usually matching useful life or standard 5yr)
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Define relationships
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));
