import { Plainte } from '../models/plainte.model';

export interface ComplaintView extends Plainte {
  authorName?: string;
  categoryName?: string;
}

export const MOCK_PLAINTES: ComplaintView[] = [
  {
    id: 'c1',
    description: "Nigga i'm broke i'm broke, i'm hungry i can't eat and only you can change this bitch...\nNigga i'm broke i'm broke, i'm hungry i can't eat and only you can change this bitch...\nNigga i'm broke i'm broke, i'm hungry i can't eat and only you can change this bitch...\nNigga i'm broke i'm broke, i'm hungry i can't eat and only you can change this bitch...",
    status: 'pending', // unread
    dateCreation: new Date('2026-03-24T12:00:00Z'),
    media: [
      { id: '1', fileUrl: 'complaint_10545454046.jpg', fileType: 'image/jpeg' },
      { id: '2', fileUrl: 'complaint_10545454047.mp4', fileType: 'video/mp4' }
    ],
    authorName: 'amenallah kalai',
    title: 'amenallah kalai',
    categoryName: 'Road problems',
    location: 'El Mourouj 3 win LC Waikiki',
    reponse: {
      id: 'r1',
      dateReponse: new Date(),
      contenu: "Nigga we understand your bitch ass complaints but make sure that we dont give a fuck!"
    }
  },
  {
    id: 'c2',
    description: "Nigga i'm broke i'm broke, i'm hungry i can't eat and only you can change this bitch...",
    status: 'accepted', // read
    dateCreation: new Date(Date.now() - 86400000),
    media: [],
    authorName: 'ghazi mouaddeb',
    title: 'ghazi mouaddeb',
    categoryName: 'Electricity',
    location: 'Tunis Center'
  },
  {
    id: 'c3',
    description: "Nigga i'm broke i'm broke, i'm hungry i can't eat and only you can change this bitch...",
    status: 'pending', // unread
    dateCreation: new Date(Date.now() - 172800000),
    media: [],
    authorName: 'amenallah Kalai',
    title: 'amenallah Kalai'
  },
  {
    id: 'c4',
    description: "Nigga i'm broke i'm broke, i'm hungry i can't eat and only you can change this bitch...",
    status: 'accepted', // read
    dateCreation: new Date(),
    media: [],
    authorName: 'ghazi mouaddeb',
    title: 'ghazi mouaddeb'
  },
  {
    id: 'c5',
    description: "Nigga i'm broke i'm broke, i'm hungry i can't eat and only you can change this bitch...",
    status: 'pending', // unread
    dateCreation: new Date(Date.now() - 86400000),
    media: [],
    authorName: 'amenallah Kalai',
    title: 'amenallah Kalai'
  },
  {
    id: 'c6',
    description: "Nigga i'm broke i'm broke, i'm hungry i can't eat and only you can change this bitch...",
    status: 'accepted', // read
    dateCreation: new Date(Date.now() - 172800000),
    media: [],
    authorName: 'ghazi mouaddeb',
    title: 'ghazi mouaddeb'
  }
];
