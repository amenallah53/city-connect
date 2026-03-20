import { News } from './../models/news.model';

export const NEWS_LIST: News[] = [
  {
    id: 'city-park-renovation',
    title: 'City Park Renovation Completed',
    author: 'City Council',
    description: 'The central city park renovation has been completed, offering new playgrounds, walking paths, and green spaces for residents.',
    date: new Date('2026-02-20'),
    imageUrl: '/assets/news/news-1.jpg',
    featured: true
  },
  {
    id: 'new-public-transport-routes',
    title: 'New Public Transport Routes',
    author: 'Transport Department',
    description: 'Three new bus routes have been introduced to improve connectivity between residential and commercial areas.',
    date: new Date('2026-02-18'),
    imageUrl: '/assets/news/news-2.jpg',
    featured: true
  },
  {
    id: 'community-cleanup-drive',
    title: 'Community Clean-Up Drive This Weekend',
    description: 'Residents are invited to participate in the city-wide clean-up campaign happening this Saturday morning.',
    date: new Date('2026-02-15'),
    imageUrl: '/assets/news/news-3.jpg'
  },
  {
    id: 'local-library-extends-hours',
    title: 'Local Library Extends Working Hours',
    author: 'Public Library',
    description: 'Starting next week, the main library will remain open until 9 PM on weekdays to accommodate more visitors.',
    date: new Date('2026-02-12'),
    imageUrl: '/assets/news/news-4.jpg',
    featured: true
  },
  {
    id: 'annual-food-festival-returns',
    title: 'Annual Food Festival Returns',
    author: 'Events Committee',
    description: 'The much-awaited annual food festival returns with over 50 vendors and live entertainment.',
    date: new Date('2026-02-10'),
    imageUrl: '/assets/news/news-5.jpg',
    featured: true
  },
  {
    id: 'new-art-exhibition-downtown',
    title: 'New Art Exhibition Opens Downtown',
    author: 'City Museum',
    description: 'A new contemporary art exhibition featuring local and international artists opens this weekend.',
    date: new Date('2026-02-08'),
    imageUrl: '/assets/news/news-6.jpg',
    featured: true
  },
  {
    id: 'tech-workshop-for-teens',
    title: 'Tech Workshop for Teens',
    author: 'Innovation Center',
    description: 'A hands-on tech workshop for teens will be held at the Innovation Center, teaching robotics and coding basics.',
    date: new Date('2026-02-05'),
    imageUrl: '/assets/news/news-6.jpg'
  }
];