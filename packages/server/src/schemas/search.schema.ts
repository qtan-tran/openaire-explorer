import { z } from "zod";

const page = z.coerce.number().int().min(1).max(100).optional();
const pageSize = z.coerce.number().int().min(1).max(100).optional();
const year = z
  .string()
  .regex(/^\d{4}$/, "Must be a 4-digit year (YYYY)")
  .optional();

export const searchResearchProductsSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["publication", "dataset", "software", "other"]).optional(),
  fromYear: year,
  toYear: year,
  oaStatus: z
    .enum(["OPEN", "CLOSED", "EMBARGOEDACCESS", "RESTRICTED"])
    .optional(),
  openAccessColor: z.enum(["gold", "green", "bronze", "hybrid"]).optional(),
  organizationId: z.string().optional(),
  projectId: z.string().optional(),
  funderShortName: z.string().optional(),
  page,
  pageSize,
  sortBy: z.string().optional(),
});

export type SearchResearchProductsQuery = z.infer<
  typeof searchResearchProductsSchema
>;

export const searchOrganizationsSchema = z.object({
  search: z.string().optional(),
  countryCode: z.string().optional(),
  page,
  pageSize,
});

export type SearchOrganizationsQuery = z.infer<
  typeof searchOrganizationsSchema
>;

export const searchProjectsSchema = z.object({
  search: z.string().optional(),
  funderShortName: z.string().optional(),
  fromStartDate: z.string().optional(),
  toStartDate: z.string().optional(),
  page,
  pageSize,
  sortBy: z.string().optional(),
});

export type SearchProjectsQuery = z.infer<typeof searchProjectsSchema>;
