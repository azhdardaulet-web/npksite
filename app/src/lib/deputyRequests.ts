export interface DeputyRequest {
  slug: string;
  date: string;
  title: string;
  excerpt: string;
  sourceUrl: string;
  content: string[];
  documentUrl?: string;
}

let archivePromise: Promise<DeputyRequest[]> | null = null;

// Большой архив загружается только на страницах запросов, не утяжеляя главную.
export function loadDeputyRequests(): Promise<DeputyRequest[]> {
  archivePromise ??= import('@/data/deputyRequests.json').then((module) => module.default as DeputyRequest[]);
  return archivePromise;
}

export async function getDeputyRequest(slug: string): Promise<DeputyRequest | undefined> {
  const requests = await loadDeputyRequests();
  return requests.find((item) => item.slug === slug);
}
