import { Prestataire } from "../models/prestataire.model";

export const allJobs: Prestataire[] = [
    {
      id: '1', cin: 'A123456', name: 'John', surname: 'Doe',
      email: 'john@example.com', phone: '+216 34 567 889',
      role: 'PRESTATAIRE', profession: 'Electrician',
      description: 'Certified electrician with 10 years of experience.',
      rating: 4.8, completedJobs: 120, reach: 'recommended',
      profilePictureUrl: undefined,
    },
    {
      id: '2', cin: 'B234567', name: 'Sarah', surname: 'Smith',
      email: 'sarah@example.com', phone: '+216 97 248 200',
      role: 'PRESTATAIRE', profession: 'Plumber',
      description: 'Expert plumber specializing in residential work.',
      rating: 4.5, completedJobs: 85, reach: 'new',
    },
    {
      id: '3', cin: 'C345678', name: 'Ahmed', surname: 'Ben Ali',
      email: 'ahmed@example.com', phone: '+216 46 574 333',
      role: 'PRESTATAIRE', profession: 'Private Tutor',
      description: 'Math and physics tutor for high school students.',
      rating: 4.9, completedJobs: 200, reach: 'recommended',
    },
    {
      id: '4', cin: 'D456789', name: 'Marie', surname: 'Dupont',
      email: 'marie@example.com', phone: '+216 54 567 900',
      role: 'PRESTATAIRE', profession: 'Accountant',
      description: 'Certified accountant with expertise in tax law.',
      rating: 4.7, completedJobs: 60, reach: 'on-demand',
    },
    {
      id: '5', cin: 'E567890', name: 'Carlos', surname: 'Mendez',
      email: 'carlos@example.com', phone: '+216 50 748 248',
      role: 'PRESTATAIRE', profession: 'Contractor',
      description: 'General contractor for renovation and construction.',
      rating: 4.6, completedJobs: 150, reach: 'on-demand',
    },
    {
      id: '6', cin: 'F678901', name: 'Lena', surname: 'Müller',
      email: 'lena@example.com', phone: '+216 77 500 800',
      role: 'PRESTATAIRE', profession: 'Electrician',
      description: 'Industrial electrician, available for urgent calls.',
      rating: 4.3, completedJobs: 40, reach: 'new',
    },
    
  ];