export interface News {
  id: string;
  title: string;
  author?: string;
  description: string;
  date: Date;
  imageUrl: string;
  featured?: boolean;
}