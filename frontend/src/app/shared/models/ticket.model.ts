export interface Ticket {
  id?: string;
  description: string;
  title?: string;
  city: string;
  category: string;
  urgency?: string;
  status?: 'pending' | 'approved' | 'rejected';
  image?: string;
  createdAt?: string;
  date_creation?: string;
  user_id?: string;
}
