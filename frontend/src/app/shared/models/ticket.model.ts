export interface Ticket {
  id?: string;
  description: string;
  title?: string;
  location: string;
  category: string;
  urgency?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'in-process';
  image?: string;
  createdAt?: string;
  date_creation?: string;
  user_id?: string;
}

// you gonna be depricated bItCh