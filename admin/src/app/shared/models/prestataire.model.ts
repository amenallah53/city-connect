import { User } from "./user.model";

/*export interface Prestataire extends User {
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
}*/

// Prestataire extends User — specialty replaces generic role data
export interface Prestataire extends User {
  specialty?: string;
  rating?: number;
  description?: string;
  reach: 'new' | 'recommended' | 'on-demand';
  socialLinks?: string[];        // TEXT[] in DB — e.g. ['https://facebook.com/x', ...]
  submissionDate: Date;
}