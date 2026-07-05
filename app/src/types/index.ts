export interface Candidate {
  id: number;
  name: string;
  region: string;
  district: string;
  promise: string;
  photo: string;
}

export interface Region {
  id: string;
  name: string;
  chairman: string;
  address: string;
  phone: string;
}

export interface NewsItem {
  id: number;
  date: string;
  title: string;
  image: string;
  category?: string;
  readTime?: string;
}

export interface ProgramDirection {
  id: number;
  icon: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: number;
  quote: string;
  author: string;
}

export type Language = 'ru' | 'kz';
