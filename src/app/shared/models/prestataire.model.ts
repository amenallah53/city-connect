import { User } from "./user.model";

export interface Prestataire extends User {
  profession: string;
  description: string;
  rating: number; // Average rating from clients
  completedJobs: number; // Total number of completed jobs
  reach?: 'recommended' | 'new' | 'on-demand';
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}