const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  user: 'postgres',
  password: '200410',
  database: 'city-connect',
  port: 5432
});

const mockNews = [
  {
    slug: 'city-hall-renovation',
    author: 'Mayor Office',
    badges: ['Infrastructure', 'Update'],
    hero_img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000',
    hero_title: 'City Hall Renovation Starts Next Month',
    hero_subtitle: 'The historic building will undergo a 6-month restoration process.',
    content: 'We are thrilled to announce that the City Hall will be renovated to improve accessibility and restore its 19th-century facade. Services will be relocated temporarily.',
  },
  {
    slug: 'new-park-opens-downtown',
    author: 'Parks Dept',
    badges: ['Community', 'Green'],
    hero_img: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&q=80&w=1000',
    hero_title: 'New Eco-Park Opens Downtown',
    hero_subtitle: 'A new green space featuring solar-powered lights and native plants.',
    content: 'Join us this Saturday for the grand opening. There will be food trucks, live music, and activities for kids.',
  },
  {
    slug: 'annual-summer-festival',
    author: 'Events Committee',
    badges: ['Event', 'Festival'],
    hero_img: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=1000',
    hero_title: 'Annual Summer Festival Dates Announced',
    hero_subtitle: 'Get ready for the biggest event of the year!',
    content: 'The festival will take place from July 10-14. Stay tuned for the artist lineup and schedule.',
  },
  {
    slug: 'public-transport-upgrade',
    author: 'Transit Authority',
    badges: ['Transport', 'Tech'],
    hero_img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1000',
    hero_title: 'Public Transport Gets Smart Upgrade',
    hero_subtitle: 'New contactless payment systems and real-time tracking apps.',
    content: 'Commuting just got easier. All buses and trains are now equipped with the new system.',
  },
  {
    slug: 'local-business-grants',
    author: 'Economic Dept',
    badges: ['Business', 'Economy'],
    hero_img: 'https://images.unsplash.com/photo-1444653614773-995cb1ef9efa?auto=format&fit=crop&q=80&w=1000',
    hero_title: 'New Grants for Local Businesses',
    hero_subtitle: 'Up to $10,000 available for eligible small businesses.',
    content: 'Apply now for the Small Business Recovery Grant. Deadline is end of next month.',
  },
  {
    slug: 'clean-street-initiative',
    author: 'Sanitation Dept',
    badges: ['Environment', 'Community'],
    hero_img: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=1000',
    hero_title: 'Clean Streets Initiative Launches',
    hero_subtitle: 'New daily cleaning schedules and additional recycling bins.',
    content: 'Help us keep our city beautiful. Report overflowing bins using the City Connect app.',
  }
];

async function seedNews() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Clear old data
    await client.query('DELETE FROM news_article');
    await client.query('DELETE FROM news');
    console.log('Deleted old news data.');

    // Insert 6 mock news
    for (const item of mockNews) {
      const res = await client.query(`
        INSERT INTO news (slug, author, badges, hero_img, hero_title, hero_subtitle)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [item.slug, item.author, item.badges, item.hero_img, item.hero_title, item.hero_subtitle]);
      
      const newsId = res.rows[0].id;

      await client.query(`
        INSERT INTO news_article (news_id, position, title, content)
        VALUES ($1, 1, $2, $3)
      `, [newsId, 'Full Story', item.content]);
    }

    await client.query('COMMIT');
    console.log('Successfully inserted 6 mock news entries.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding news:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

seedNews();
