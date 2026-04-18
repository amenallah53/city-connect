export interface User {
  id: string;
  cin: string;
  firstName: string;
  lastName: string;
  email: string;
  addresse?: string;
  telephone?: string;
  date_naissance?: string;
  status: 'pending' | 'accepted' | 'rejected';
  role: 'citoyen' | 'prestataire' | 'admin';
  document?: string;   // Backblaze B2 URL
  documentType?: string;
  createdAt: Date;
}