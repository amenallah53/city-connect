import { JobOffer } from "../models/offer.model";

export const MOCK_OFFERS: JobOffer[] = [
  {
    id: 'offer-1',
    status: 'pending',
    dateJobSuggestion: new Date('2026-09-07T16:00:00'),
    dateCreation: new Date('2026-09-01'),
    prestataireId: 'p-1',
    offerorId: 'user-1',
    offeror: {
      id: 'user-1',
      firstName: 'Amenallah',
      lastName: 'Kalai',
      email: 'amenkalai53@gmail.com',
      telephone: '+216 50 748 248',
      addresse: 'manqulch win noskn, gyagyagya, gyagya',
      cin: '12345678',
      status: 'accepted',
      role: 'citoyen',
      createdAt: new Date('2026-01-01')
    }
  },
  {
    id: 'offer-2',
    status: 'approved',
    dateJobSuggestion: new Date('2026-09-07T16:00:00'),
    dateCreation: new Date('2026-09-02'),
    prestataireId: 'p-1',
    offerorId: 'user-2',
    offeror: {
      id: 'user-2',
      firstName: 'Sami',
      lastName: 'Ben Ali',
      email: 'sami.benali@gmail.com',
      telephone: '+216 22 123 456',
      addresse: 'Tunis, Avenue Habib Bourguiba',
      cin: '87654321',
      status: 'accepted',
      role: 'citoyen',
      createdAt: new Date('2026-02-01')
    }
  },
  {
    id: 'offer-3',
    status: 'rejected',
    dateJobSuggestion: new Date('2026-09-10T10:00:00'),
    dateCreation: new Date('2026-09-03'),
    prestataireId: 'p-2',
    offerorId: 'user-3',
    offeror: {
      id: 'user-3',
      firstName: 'Fatma',
      lastName: 'Zohra',
      email: 'fatma.zohra@gmail.com',
      telephone: '+216 98 765 432',
      addresse: 'Sfax, Route El Ain',
      cin: '11223344',
      status: 'accepted',
      role: 'citoyen',
      createdAt: new Date('2026-03-01')
    }
  },
  {
    id: 'offer-4',
    status: 'done',
    dateJobSuggestion: new Date('2026-08-15T09:00:00'),
    dateCreation: new Date('2026-08-01'),
    prestataireId: 'p-1',
    offerorId: 'user-1',
    offeror: {
      id: 'user-1',
      firstName: 'Amenallah',
      lastName: 'Kalai',
      email: 'amenkalai53@gmail.com',
      telephone: '+216 50 748 248',
      addresse: 'manqulch win noskn, gyagyagya, gyagya',
      cin: '12345678',
      status: 'accepted',
      role: 'citoyen',
      createdAt: new Date('2026-01-01')
    }
  },
  {
    id: 'offer-5',
    status: 'cancelled',
    dateJobSuggestion: new Date('2026-10-01T14:30:00'),
    dateCreation: new Date('2026-09-20'),
    prestataireId: 'p-3',
    offerorId: 'user-4',
    offeror: {
      id: 'user-4',
      firstName: 'Youssef',
      lastName: 'Mrad',
      email: 'youssef.mrad@gmail.com',
      telephone: '+216 55 111 222',
      addresse: 'Sousse, Khezama West',
      cin: '55667788',
      status: 'accepted',
      role: 'citoyen',
      createdAt: new Date('2026-04-01')
    }
  }
];