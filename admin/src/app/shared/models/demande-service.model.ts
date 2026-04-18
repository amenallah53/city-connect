import { Service } from "./service.model";

export interface DemandeService {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  submissionDate: Date;
  description?: string;
  // Citizen snapshot at submission time
  cin?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  addresse?: string;
  telephone?: string;
  date_naissance?: string;
  adminNotes?: string;
  userId?: string;
  serviceId?: string;
  service?: Service;            // optionally populated
  certificat?: CertificatService;        // 0 or 1
  documents: DemandeServiceDocument[];   // 0..n attached files
}

export interface CertificatService {
  id: number;
  type?: string;
  dateGeneration: Date;
  fileUrl?: string;     // Backblaze B2 URL
}

export interface DemandeServiceDocument {
  id: string;
  fileUrl: string;      // Backblaze B2 URL
  fileType?: string;    // e.g. 'application/pdf', 'image/png'
}