export interface Plainte {
  id: string;
  title?: string;
  description?: string;
  status: 'pending' | 'in-process' | 'accepted' | 'rejected';
  dateCreation: Date;
  location?: string;
  userId?: string;
  categorieId?: number;
  media: PlainteMedia[];
  reponse?: PlainteReponse;   // 0 or 1 official response
}

export interface PlainteMedia {
  id: string;
  fileUrl: string;        // Backblaze B2 URL
  fileType?: string;      // e.g. 'image/jpeg', 'video/mp4', 'application/pdf'
}

export interface PlainteReponse {
  id: string;
  expeditaire?: string;
  recepteur?: string;
  contenu?: string;
  dateReponse: Date;
}

export interface PlainteCategorie {
  id: number;
  type: string;
}