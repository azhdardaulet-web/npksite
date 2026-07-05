import { z } from 'zod';

// ─── Enums ───────────────────────────────────────────────────────────────────

export const RoleSchema = z.enum([
  'ADMIN',
  'CHIEF_EDITOR',
  'SECTION_EDITOR',
  'FACTION',
  'BRANCH_EDITOR',
  'RECEPTION_MANAGER',
]);
export type Role = z.infer<typeof RoleSchema>;

export const UserStatusSchema = z.enum(['ACTIVE', 'BLOCKED']);
export type UserStatus = z.infer<typeof UserStatusSchema>;

export const NewsStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED', 'SCHEDULED']);
export type NewsStatus = z.infer<typeof NewsStatusSchema>;

export const NewsFormatSchema = z.enum(['news', 'party_release', 'article', 'analytics', 'interview']);
export type NewsFormat = z.infer<typeof NewsFormatSchema>;

export const MediaTypeSchema = z.enum(['image', 'video', 'pdf', 'document']);
export type MediaType = z.infer<typeof MediaTypeSchema>;

export const PageBlockTypeSchema = z.enum([
  'hero',
  'text_image',
  'kpi',
  'quote',
  'pdf_list',
  'contacts_block',
]);
export type PageBlockType = z.infer<typeof PageBlockTypeSchema>;

export const LangSchema = z.enum(['ru', 'kz']);
export type Lang = z.infer<typeof LangSchema>;

export const TeamMemberGroupSchema = z.enum(['LEADERSHIP', 'MEDIA_TEAM']);
export type TeamMemberGroup = z.infer<typeof TeamMemberGroupSchema>;

export const DocumentTypeSchema = z.enum(['ustav', 'deputy_request', 'press_kit', 'other']);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

export const JoinRequestRoleSchema = z.enum(['member', 'volunteer', 'observer']);
export type JoinRequestRole = z.infer<typeof JoinRequestRoleSchema>;

export const GenderSchema = z.enum(['male', 'female']);
export type Gender = z.infer<typeof GenderSchema>;

export const JoinRequestStatusSchema = z.enum(['NEW', 'PROCESSING', 'ACCEPTED', 'REJECTED']);
export type JoinRequestStatus = z.infer<typeof JoinRequestStatusSchema>;

export const AppealStatusSchema = z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED']);
export type AppealStatus = z.infer<typeof AppealStatusSchema>;

// ─── Phone (Казахстан: +7 7XX XXX XX XX) ──────────────────────────────────────

export const kzPhoneSchema = z
  .string()
  .trim()
  .regex(/^\+7\s?7\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$/, 'Формат телефона: +7 7XX XXX XX XX');

// ─── User ────────────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: RoleSchema,
  status: UserStatusSchema,
  branchId: z.string().uuid().nullable().optional(),
  section: z.string().max(200).nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8).max(100),
  role: RoleSchema,
  branchId: z.string().uuid().optional(),
  section: z.string().max(200).optional(),
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
  format: NewsFormatSchema,
  status: NewsStatusSchema,
  imageUrl: z.string().url().optional(),
  readingTime: z.number().int().min(1).optional(),
  tags: z.array(z.string()).default([]),
  tgPosted: z.boolean(),
  tgSkip: z.boolean(),
  publishedAt: z.coerce.date().optional(),
  scheduledAt: z.coerce.date().optional(),
  authorId: z.string().uuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  translations: z.array(NewsTranslationSchema).optional(),
});
export type News = z.infer<typeof NewsSchema>;

export const CreateNewsSchema = z.object({
  format: NewsFormatSchema,
  imageUrl: z.string().url().optional(),
  tags: z.array(z.string()).optional(),
  tgSkip: z.boolean().optional(),
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
  group: TeamMemberGroupSchema,
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  translations: z.array(TeamMemberTranslationSchema).optional(),
});
export type TeamMember = z.infer<typeof TeamMemberSchema>;

// ─── Documents ───────────────────────────────────────────────────────────────

export const DocumentSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  type: DocumentTypeSchema,
  fileUrl: z.string().url(),
  fileName: z.string(),
  fileSize: z.number().int(),
  year: z.number().int().min(2020).max(2100).optional(),
  publishedAt: z.coerce.date().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Document = z.infer<typeof DocumentSchema>;

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

// ─── Branches / Филиалы ────────────────────────────────────────────────────────

export const BranchSchema = z.object({
  id: z.string().uuid(),
  cityRu: z.string().min(1).max(200),
  cityKz: z.string().min(1).max(200),
  addressRu: z.string().min(1).max(500),
  addressKz: z.string().min(1).max(500),
  phone: z.string().max(50),
  email: z.string().email(),
  department: z.string().max(200).optional(),
  chairman: z.string().max(300).optional(),
  lng: z.number().optional(),
  lat: z.number().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Branch = z.infer<typeof BranchSchema>;

export const CreateBranchSchema = BranchSchema.omit({
  id: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateBranchInput = z.infer<typeof CreateBranchSchema>;

// ─── CRM: Заявки на вступление ─────────────────────────────────────────────────

export const JoinRequestSchema = z.object({
  id: z.string().uuid(),
  role: JoinRequestRoleSchema,
  fullName: z.string().min(1).max(300),
  birthDate: z.coerce.date().optional(),
  gender: GenderSchema.optional(),
  phone: kzPhoneSchema,
  email: z.string().email().optional(),
  city: z.string().min(1).max(200).optional(),
  branchId: z.string().uuid().nullable().optional(),
  status: JoinRequestStatusSchema,
  phoneVerified: z.boolean(),
  merchAddress: z.string().max(500).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type JoinRequest = z.infer<typeof JoinRequestSchema>;

export const JoinRequestInputSchema = JoinRequestSchema.omit({
  id: true,
  status: true,
  phoneVerified: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  hCaptchaToken: z.string().min(1, 'Пройдите проверку hCaptcha'),
});
export type JoinRequestInput = z.infer<typeof JoinRequestInputSchema>;

// ─── CRM: Обращения граждан ────────────────────────────────────────────────────

export const AppealTopicSchema = z.object({
  id: z.string().uuid(),
  nameRu: z.string().min(1).max(300),
  nameKz: z.string().min(1).max(300),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
});
export type AppealTopic = z.infer<typeof AppealTopicSchema>;

export const AppealSchema = z.object({
  id: z.string().uuid(),
  appealNumber: z.string(),
  fullName: z.string().min(1).max(300),
  phone: kzPhoneSchema,
  email: z.string().email().optional(),
  topicId: z.string().uuid(),
  message: z.string().min(10),
  fileUrl: z.string().url().optional(),
  status: AppealStatusSchema,
  internalNotes: z.string().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Appeal = z.infer<typeof AppealSchema>;

export const AppealInputSchema = AppealSchema.omit({
  id: true,
  appealNumber: true,
  status: true,
  internalNotes: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  hCaptchaToken: z.string().min(1, 'Пройдите проверку hCaptcha'),
});
export type AppealInput = z.infer<typeof AppealInputSchema>;

// ─── Магазин: подписка на открытие ─────────────────────────────────────────────

export const ShopSubscriberInputSchema = z.object({
  email: z.string().email(),
  hCaptchaToken: z.string().min(1, 'Пройдите проверку hCaptcha'),
});
export type ShopSubscriberInput = z.infer<typeof ShopSubscriberInputSchema>;

// ─── Кандидаты ──────────────────────────────────────────────────────────────────

export const CandidateTranslationSchema = z.object({
  id: z.string().uuid(),
  candidateId: z.string().uuid(),
  lang: LangSchema,
  promise: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const CandidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(300),
  region: z.string().min(1).max(200),
  district: z.string().max(200).optional(),
  photoUrl: z.string().url().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  translations: z.array(CandidateTranslationSchema).optional(),
});
export type Candidate = z.infer<typeof CandidateSchema>;

// ─── История партии ────────────────────────────────────────────────────────────

export const HistoryEventTranslationSchema = z.object({
  id: z.string().uuid(),
  historyEventId: z.string().uuid(),
  lang: LangSchema,
  title: z.string().min(1).max(500),
  text: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const HistoryEventSchema = z.object({
  id: z.string().uuid(),
  year: z.number().int(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  translations: z.array(HistoryEventTranslationSchema).optional(),
});
export type HistoryEvent = z.infer<typeof HistoryEventSchema>;

// ─── Программа партии ──────────────────────────────────────────────────────────

export const ProgramBlockTranslationSchema = z.object({
  id: z.string().uuid(),
  programBlockId: z.string().uuid(),
  lang: LangSchema,
  title: z.string().min(1).max(500),
  lead1: z.string().optional(),
  lead2: z.string().optional(),
  points: z.array(z.string()),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const ProgramBlockSchema = z.object({
  id: z.string().uuid(),
  n: z.number().int(),
  keyword: z.string().min(1).max(200),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  translations: z.array(ProgramBlockTranslationSchema).optional(),
});
export type ProgramBlock = z.infer<typeof ProgramBlockSchema>;

// ─── Медиапроекты ───────────────────────────────────────────────────────────────

export const MediaProjectTranslationSchema = z.object({
  id: z.string().uuid(),
  mediaProjectId: z.string().uuid(),
  lang: LangSchema,
  title: z.string().min(1).max(300),
  description: z.string().min(1),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const MediaProjectSchema = z.object({
  id: z.string().uuid(),
  tag: z.string().min(1).max(100),
  url: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  translations: z.array(MediaProjectTranslationSchema).optional(),
});
export type MediaProject = z.infer<typeof MediaProjectSchema>;

// ─── СМИ о нас ──────────────────────────────────────────────────────────────────

export const MediaPublicationSchema = z.object({
  id: z.string().uuid(),
  date: z.coerce.date(),
  sourceType: z.string().min(1).max(100),
  mediaName: z.string().min(1).max(300),
  title: z.string().min(1).max(500),
  excerpt: z.string().optional(),
  imageUrl: z.string().url().optional(),
  url: z.string().url().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type MediaPublication = z.infer<typeof MediaPublicationSchema>;

// ─── Отзывы ─────────────────────────────────────────────────────────────────────

export const TestimonialSchema = z.object({
  id: z.string().uuid(),
  quote: z.string().min(1),
  author: z.string().min(1).max(300),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Testimonial = z.infer<typeof TestimonialSchema>;

// ─── Меню сайта ─────────────────────────────────────────────────────────────────

export const MenuItemSchema = z.object({
  id: z.string().uuid(),
  labelRu: z.string().min(1).max(200),
  labelKz: z.string().min(1).max(200),
  href: z.string().min(1).max(500),
  parentId: z.string().uuid().nullable().optional(),
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type MenuItem = z.infer<typeof MenuItemSchema>;

// ─── FAQ (база знаний чат-бота) ─────────────────────────────────────────────────

export const FaqSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1).max(1000),
  answer: z.string().min(1),
  lang: LangSchema,
  sortOrder: z.number().int(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
export type Faq = z.infer<typeof FaqSchema>;

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
