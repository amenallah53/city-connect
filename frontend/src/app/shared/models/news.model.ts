export interface News {
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
}