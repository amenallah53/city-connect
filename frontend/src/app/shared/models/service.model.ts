export interface Service {
  id: string;
  name: string;
  type: string;
  description?: string;
  badges: string[];
  requirements?: string;
  municipalite_id?: number;
  municipalite_name?: string;
  featured?: boolean;
  title?: string;
  category?: string;
}

// Pour compatibilité avec l'ancien frontend (title -> name)
export interface LegacyService extends Service {
  title?: string;
  category?: string;
  estimatedDays?: number;
  imageUrl?: string;
  isActive?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  featured?: boolean;
}