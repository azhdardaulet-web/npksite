import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const RoleSchema = z.enum(['ADMIN', 'NEWS_EDITOR', 'PROCUREMENT_MANAGER', 'CONTENT_MANAGER']);
export type Role = z.infer<typeof RoleSchema>;

export const UserStatusSchema = z.enum(['ACTIVE', 'BLOCKED']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const NewsTypeSchema = z.enum(['press', 'article', 'media_mention']);
export type NewsType = z.infer<typeof NewsTypeSchema>;

export const NewsCategorySchema = z.enum([
  'corporate',
  'industry',
  'safety',
  'hr',
  'esg',
  'financial',
]);
export type NewsCategory = z.infer<typeof NewsCategorySchema>;

export const NewsStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']);
export type NewsStatus = z.infer<typeof NewsStatusSchema>;

export const MediaTypeSchema = z.enum(['image', 'video', 'pdf', 'document']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

export const SupplierFormStatusSchema = z.enum(['NEW', 'IN_PROGRESS', 'DONE']);
export type SupplierFormStatus = z.infer<typeof SupplierFormStatusSchema>;

export const ProcurementMethodSchema = z.enum([
  'single_source',
  'request_for_quote',
  'open_tender',
  'by_agreement',
]);
export type ProcurementMethod = z.infer<typeof ProcurementMethodSchema>;

export const PageBlockTypeSchema = z.enum([
  'hero',
  'text_image',
  'kpi',
  'quote',
  'pdf_list',
  'contacts_block',
]);
export type PageBlockType = z.infer<typeof PageBlockTypeSchema>;

export const LangSchema = z.enum(['ru', 'kz', 'en', 'zh']);
export type Lang = z.infer<typeof LangSchema>;

// ─── User ────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: RoleSchema,
  status: UserStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(100),
  role: RoleSchema,
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email({ message: 'Введите корректный email' }),
  password: z.string().min(1, { message: 'Введите пароль' }),
});
export type LoginInput = z.infer<typeof LoginSchema>;

// ─── News / Translation ───────────────────────────────────────────────────────

export const NewsTranslationSchema = z.object({
  id: z.string().uuid(),
  newsId: z.string().uuid(),
  lang: LangSchema,
  title: z.string().min(1).max(500),
  excerpt: z.string().max(1000).optional(),
  content: z.string(),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  ogImageUrl: z.string().url().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type NewsTranslation = z.infer<typeof NewsTranslationSchema>;

export const NewsSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  type: NewsTypeSchema,
  category: NewsCategorySchema,
  status: NewsStatusSchema,
  imageUrl: z.string().url().optional(),
  readingTime: z.number().int().min(1).optional(),
  publishedAt: z.coerce.date().optional(),
  scheduledAt: z.coerce.date().optional(),
  authorId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  translations: z.array(NewsTranslationSchema).optional(),
});
export type News = z.infer<typeof NewsSchema>;

export const CreateNewsSchema = z.object({
  type: NewsTypeSchema,
  category: NewsCategorySchema,
  imageUrl: z.string().url().optional(),
  translations: z.array(
    z.object({
      lang: LangSchema,
      title: z.string().min(1).max(500),
      excerpt: z.string().max(1000).optional(),
      content: z.string().min(1),
      seoTitle: z.string().max(200).optional(),
      seoDescription: z.string().max(500).optional(),
      ogImageUrl: z.string().url().optional(),
    })
  ).min(1),
});
export type CreateNewsInput = z.infer<typeof CreateNewsSchema>;

// ─── Media ───────────────────────────────────────────────────────────────────

export const GalleryFolderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  parentId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
});
export type GalleryFolder = z.infer<typeof GalleryFolderSchema>;

export const MediaSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  originalName: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  type: MediaTypeSchema,
  mimeType: z.string(),
  size: z.number().int(),
  folderId: z.string().uuid().nullable(),
  uploadedById: z.string().uuid(),
  createdAt: z.coerce.date(),
});
export type Media = z.infer<typeof MediaSchema>;

// ─── Gallery (public-facing) ──────────────────────────────────────────────────

export const GallerySchema = z.object({
  id: z.string().uuid(),
  mediaId: z.string().uuid(),
  type: z.enum(['photo', 'video']),
  title: z.string().max(300),
  duration: z.string().optional(), // e.g. "3:45"
  sortOrder: z.number().int(),
  folderId: z.string().uuid().nullable(),
  createdAt: z.coerce.date(),
});
export type Gallery = z.infer<typeof GallerySchema>;

// ─── Services ─────────────────────────────────────────────────────────────────

export const ServiceTranslationSchema = z.object({
  id: z.string().uuid(),
  serviceId: z.string().uuid(),
  lang: LangSchema,
  title: z.string().min(1).max(300),
  description: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ServiceSchema = z.object({
  id: z.string().uuid(),
  iconName: z.string().max(100),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  translations: z.array(ServiceTranslationSchema).optional(),
});
export type Service = z.infer<typeof ServiceSchema>;

// ─── Partners ────────────────────────────────────────────────────────────────

export const PartnerSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(300),
  logoUrl: z.string().url(),
  websiteUrl: z.string().url().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Partner = z.infer<typeof PartnerSchema>;

export const CreatePartnerSchema = z.object({
  name: z.string().min(1).max(300),
  logoUrl: z.string().url(),
  websiteUrl: z.string().url().optional(),
});
export type CreatePartnerInput = z.infer<typeof CreatePartnerSchema>;

// ─── Team ────────────────────────────────────────────────────────────────────

export const TeamMemberTranslationSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
  lang: LangSchema,
  name: z.string().min(1).max(200),
  position: z.string().min(1).max(300),
  bio: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const TeamMemberSchema = z.object({
  id: z.string().uuid(),
  photoUrl: z.string().url().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  translations: z.array(TeamMemberTranslationSchema).optional(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

// ─── Documents ───────────────────────────────────────────────────────────────

export const DocumentTypeSchema = z.enum([
  'service_contract',
  'supply_contract',
  'purchases_plan',
  'other',
]);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  type: DocumentTypeSchema,
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileSize: z.number().int(),
  year: z.number().int().min(2020).max(2100).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Document = z.infer<typeof DocumentSchema>;

// ─── Purchase Plan ───────────────────────────────────────────────────────────

export const PurchaseItemSchema = z.object({
  id: z.string().uuid(),
  number: z.number().int().positive(),
  name: z.string().min(1).max(500),
  description: z.string().optional(),
  procurementType: z.string().min(1).max(200),
  deliveryPlace: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.string().optional(),
  estimatedAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  year: z.number().int().min(2020).max(2100),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type PurchaseItem = z.infer<typeof PurchaseItemSchema>;

export const PurchaseItemInputSchema = z.object({
  number: z.number().int().positive(),
  name: z.string().min(1).max(500),
  description: z.string().optional(),
  procurementType: z.string().min(1).max(200),
  deliveryPlace: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.string().optional(),
  estimatedAmount: z.number().optional(),
  totalAmount: z.number().optional(),
  year: z.number().int().min(2020).max(2100),
});
export type PurchaseItemInput = z.infer<typeof PurchaseItemInputSchema>;

export const PurchasePlanSchema = z.object({
  id: z.string().uuid(),
  year: z.number().int(),
  title: z.string(),
  fileUrl: z.string().url().optional(),
  createdAt: z.coerce.date(),
});
export type PurchasePlan = z.infer<typeof PurchasePlanSchema>;

// ─── Supplier Form ────────────────────────────────────────────────────────────

export const SupplierFormSchema = z.object({
  id: z.string().uuid(),
  bin: z.string().length(12).regex(/^\d+$/, 'БИН должен состоять из 12 цифр'),
  companyName: z.string().min(1).max(300),
  contactPerson: z.string().min(1).max(200),
  position: z.string().max(200).optional(),
  phone: z.string().min(10).max(20),
  email: z.string().email(),
  supplyCategory: z.string().min(1).max(300),
  description: z.string().min(10),
  status: SupplierFormStatusSchema,
  hCaptchaToken: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type SupplierForm = z.infer<typeof SupplierFormSchema>;

export const SupplierFormInputSchema = SupplierFormSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  hCaptchaToken: z.string().min(1, 'Пройдите проверку hCaptcha'),
});
export type SupplierFormInput = z.infer<typeof SupplierFormInputSchema>;

// ─── Contact Form ─────────────────────────────────────────────────────────────

export const ContactFormSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().max(20).optional(),
  subject: z.string().min(1).max(300),
  message: z.string().min(10),
  hCaptchaToken: z.string().optional(),
  createdAt: z.coerce.date(),
});
export type ContactForm = z.infer<typeof ContactFormSchema>;

export const ContactFormInputSchema = ContactFormSchema.omit({
  id: true,
  createdAt: true,
}).extend({
  hCaptchaToken: z.string().min(1, 'Пройдите проверку hCaptcha'),
});
export type ContactFormInput = z.infer<typeof ContactFormInputSchema>;

// ─── Pages ────────────────────────────────────────────────────────────────────

export const PageBlockSchema = z.object({
  id: z.string().uuid(),
  pageId: z.string().uuid(),
  type: PageBlockTypeSchema,
  sortOrder: z.number().int(),
  content: z.record(z.unknown()), // JSON — per-block shape varies
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type PageBlock = z.infer<typeof PageBlockSchema>;

export const PageTranslationSchema = z.object({
  id: z.string().uuid(),
  pageId: z.string().uuid(),
  lang: LangSchema,
  title: z.string().max(300),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(500).optional(),
  ogImageUrl: z.string().url().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type PageTranslation = z.infer<typeof PageTranslationSchema>;

export const PageSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  isPublished: z.boolean(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  blocks: z.array(PageBlockSchema).optional(),
  translations: z.array(PageTranslationSchema).optional(),
});
export type Page = z.infer<typeof PageSchema>;

// ─── Offices / Contacts ───────────────────────────────────────────────────────

export const OfficeSchema = z.object({
  id: z.string().uuid(),
  cityRu: z.string().min(1).max(200),
  cityKz: z.string().min(1).max(200),
  addressRu: z.string().min(1).max(500),
  addressKz: z.string().min(1).max(500),
  phone: z.string().max(50),
  email: z.string().email(),
  department: z.string().max(200).optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Office = z.infer<typeof OfficeSchema>;

export const CreateOfficeSchema = OfficeSchema.omit({
  id: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateOfficeInput = z.infer<typeof CreateOfficeSchema>;

// ─── Pagination helper ────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export type Pagination = z.infer<typeof PaginationSchema>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ─── API error shape ──────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  details?: unknown;
}
