import { pgSchema, serial, varchar, text, boolean, jsonb, timestamp, integer } from 'drizzle-orm/pg-core'

// Define the hub schema
export const hubSchema = pgSchema('hub')

// Define the applications table inside the hub schema
export const applications = hubSchema.table('applications', {
  id: serial('id').primaryKey(),
  accountId: integer('account_id'),
  shortName: varchar('short_name', { length: 255 }).notNull().unique(),
  longName: varchar('long_name', { length: 255 }).notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  monetized: boolean('monetized').default(false),
  primarySku: varchar('primary_sku', { length: 50 }).default('APP-SRV-STD'),
  skuGrid: jsonb('sku_grid').default([]),
  paymentMethods: jsonb('payment_methods').default([]),
  callbackUrl: text('callback_url'),
  journalVoucher: jsonb('journal_voucher').default({}),
  accessControlType: varchar('access_control_type', { length: 50 }).default('STANDARD'),
  openfgaSchema: text('openfga_schema'),
  servicePath: varchar('service_path', { length: 255 }),
  githubCodeowners: text('github_codeowners'),
  githubRepoUrl: text('github_repo_url'),
  deploymentTargets: jsonb('deployment_targets').default([]),
  gcpProjectId: varchar('gcp_project_id', { length: 255 }),
  platformServices: jsonb('platform_services').default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
})
