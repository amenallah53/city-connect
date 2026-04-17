/*export interface Service {
  id: string;
  title: string;
  type: string;
  badges: string[];
  description?: string;
  featured?: boolean;
}*/

export interface Service {
  id: string;
  type?: string;
  name?: string;
  badges: string[];
  description?: string;
  requirements?: string[];
  municipaliteId?: number;
}

export interface ServiceType {
  id: number;
  type: string;
}