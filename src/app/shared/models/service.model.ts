export interface Service {
  id: string;
  title: string;
  type: string;
  badges: string[];
  description?: string;
  featured?: boolean;
}