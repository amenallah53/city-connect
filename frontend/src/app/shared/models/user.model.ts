export interface User {
  id: string;
  cin: number;
  firstName: string;
  lastName: string;
  email: string;
  addresse?: string;
  telephone?: string;
  status: 'pending' | 'accepted' | 'rejected';
  role: 'citoyen' | 'prestataire' | 'admin';
  extraDocumentUrl?: string;   // Backblaze B2 URL
  documentType?: string;
  createdAt: Date;
}