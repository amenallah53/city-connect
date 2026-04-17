import { Prestataire } from "./prestataire.model";
import { User } from "./user.model";

export interface JobOffer {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'done' | 'cancelled';
  dateJobSuggestion: Date;
  dateCreation: Date;
  prestataire?: Prestataire;   // optionally populated
  prestataireId: string; // the prestataire
  offeror?: User; // optionally populated
  offerorId: string; // the one who made the job offer
}