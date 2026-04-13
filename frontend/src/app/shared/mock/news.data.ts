import { News } from './../models/news.model';

export const NEWS_LIST: News[] = [
  {
    id: 'city-park-renovation',
    slug: 'city-park-renovation',
    author: 'City Council',
    date: new Date('2026-02-20'),
    badges: ['featured', 'Daily'],
    heroImg: '/assets/news/news-1.jpg',
    heroTitle: 'City Park Renovation Completed',
    heroSubtitle:
      'The central city park renovation has been completed, offering new playgrounds, walking paths, and green spaces for residents.',
    subArticles: [
      {
        title: 'Project Overview',
        content:
          'The renovation includes modern playgrounds, improved walking paths, and expanded green areas for the community.',
        media: '/assets/news/news-1.jpg',
        mediaType: 'image'
      },
      {
        title: 'Project Overview',
        content:
          'The renovation includes modern playgrounds, improved walking paths, and expanded green areas for the community.',
        media: '/assets/news/news-1.jpg',
        mediaType: 'image'
      }
    ]
  },
  {
    id: 'new-public-transport-routes',
    slug: 'new-public-transport-routes',
    author: 'Transport Department',
    date: new Date('2026-02-18'),
    badges: ['featured'],
    heroImg: '/assets/news/news-2.jpg',
    heroTitle: 'New Public Transport Routes',
    heroSubtitle:
      'Three new bus routes have been introduced to improve connectivity between residential and commercial areas.',
    subArticles: [
      {
        title: 'Route Expansion Details',
        content:
          'The new routes aim to reduce commute times and improve access between key areas of the city.',
        media: '/assets/news/news-2.jpg',
        mediaType: 'image'
      }
    ]
  },
  {
    id: 'community-cleanup-drive',
    slug: 'community-cleanup-drive',
    date: new Date('2026-02-15'),
    badges: [],
    heroImg: '/assets/news/news-3.jpg',
    heroTitle: 'Community Clean-Up Drive This Weekend',
    heroSubtitle:
      'Residents are invited to participate in the city-wide clean-up campaign happening this Saturday morning.',
    subArticles: [
      {
        title: 'Join the Initiative',
        content:
          'Volunteers will gather across multiple locations to help clean and beautify public spaces.',
        media: '/assets/news/news-3.jpg',
        mediaType: 'image'
      }
    ]
  },
  {
    id: 'local-library-extends-hours',
    slug: 'local-library-extends-hours',
    author: 'Public Library',
    date: new Date('2026-02-12'),
    badges: ['featured'],
    heroImg: '/assets/news/news-4.jpg',
    heroTitle: 'Local Library Extends Working Hours',
    heroSubtitle:
      'Starting next week, the main library will remain open until 9 PM on weekdays to accommodate more visitors.',
    subArticles: [
      {
        title: 'New Schedule',
        content:
          'The extended hours aim to provide better access for students and working professionals.',
        media: '/assets/news/news-4.jpg',
        mediaType: 'image'
      }
    ]
  },
  {
    id: 'annual-food-festival-returns',
    slug: 'annual-food-festival-returns',
    author: 'Events Committee',
    date: new Date('2026-02-10'),
    badges: ['featured'],
    heroImg: '/assets/news/news-5.jpg',
    heroTitle: 'Annual Food Festival Returns',
    heroSubtitle:
      'The much-awaited annual food festival returns with over 50 vendors and live entertainment.',
    subArticles: [
      {
        title: 'Festival Highlights',
        content:
          'Visitors can enjoy a wide range of cuisines, live shows, and family-friendly activities.',
        media: '/assets/news/news-5.jpg',
        mediaType: 'image'
      }
    ]
  },
  {
    id: 'new-art-exhibition-downtown',
    slug: 'new-art-exhibition-downtown',
    author: 'City Museum',
    date: new Date('2026-02-08'),
    badges: ['featured'],
    heroImg: '/assets/news/news-6.jpg',
    heroTitle: 'New Art Exhibition Opens Downtown',
    heroSubtitle:
      'A new contemporary art exhibition featuring local and international artists opens this weekend.',
    subArticles: [
      {
        title: 'Exhibition Details',
        content:
          'The exhibition showcases a mix of modern works from emerging and established artists.',
        media: '/assets/news/news-6.jpg',
        mediaType: 'image'
      }
    ]
  },
  {
    id: 'tech-workshop-for-teens',
    slug: 'tech-workshop-for-teens',
    author: 'Innovation Center',
    date: new Date('2026-02-05'),
    badges: [],
    heroImg: '/assets/news/news-6.jpg',
    heroTitle: 'Tech Workshop for Teens',
    heroSubtitle:
      'A hands-on tech workshop for teens will be held at the Innovation Center, teaching robotics and coding basics.',
    subArticles: [
      {
        title: 'Workshop Activities',
        content:
          'Participants will learn programming fundamentals and build simple robotics projects.',
        media: '/assets/news/news-6.jpg',
        mediaType: 'image'
      }
    ]
  }
];