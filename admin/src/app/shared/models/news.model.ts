/*export interface News {
  id: string;
  slug: string;
  author?: string;
  date: Date;
  badges: string[];
  heroImg: string;
  heroTitle: string;
  heroSubtitle: string;
  subArticles: Article[];
}

interface Article {
  title: String;
  content: String;
  media?: String;
  mediaType?: String;
}*/

// News = news row + its sub-articles composed inline (no separate fetch)
export interface News {
  id: string;
  slug: string;
  author?: string;
  date: Date;
  badges: string[];
  heroImg: string;       // Backblaze B2 URL
  heroTitle: string;
  heroSubtitle: string;
  municipaliteId?: number;
  subArticles: NewsArticle[];
}

export interface NewsArticle {
  id: string;
  position: number;
  title: string;
  content: string;
  mediaUrl?: string;    // Backblaze B2 URL
  mediaType?: string;   // e.g. 'image/jpeg', 'video/mp4'
}