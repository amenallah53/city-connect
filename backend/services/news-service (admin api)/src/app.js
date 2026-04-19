const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = parseInt(process.env.PORT, 10) || 5005;

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be set in .env');
const jwtSecret = process.env.JWT_SECRET;

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

app.use(cors());
app.use(express.json());

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Authorization header missing' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token not provided' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorizeAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }
  next();
}



app.get('/news', async (req, res) => {
  try {
    const news = await pool.query(
      `SELECT n.*, 
        json_agg(
          na ORDER BY na.position
        ) FILTER (WHERE na.id IS NOT NULL) AS articles
       FROM news n
       LEFT JOIN news_article na ON na.news_id = n.id
       GROUP BY n.id
       ORDER BY n.date DESC`
    );

    return res.status(200).json(news.rows);
  } catch (err) {
    console.error('Get news error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a news post with its sub-articles
app.post('/news', authenticateToken, authorizeAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      slug, author, badges, hero_img,
      hero_title, hero_subtitle, municipalite_id,
      articles // array of { title, content, media_url, media_type, position }
    } = req.body;

    if (!slug || !hero_title) {
      return res.status(400).json({ error: 'slug and hero_title are required' });
    }

    await client.query('BEGIN');

    const newsResult = await client.query(
      `INSERT INTO news (slug, author, badges, hero_img, hero_title, hero_subtitle, municipalite_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [slug, author || null, badges || [], hero_img || null, hero_title, hero_subtitle || null, municipalite_id || null]
    );

    const news = newsResult.rows[0];

    if (articles && articles.length > 0) {
      for (const article of articles) {
        await client.query(
          `INSERT INTO news_article (news_id, title, content, media_url, media_type, position)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [news.id, article.title, article.content, article.media_url || null, article.media_type || null, article.position ?? 0]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({ message: 'News created successfully', news });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Create news error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Edit a news post
app.put('/news/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      slug, author, badges, hero_img,
      hero_title, hero_subtitle, municipalite_id,
      articles
    } = req.body;

    await client.query('BEGIN');

    const newsResult = await client.query(
      `UPDATE news SET
        slug            = COALESCE($1, slug),
        author          = COALESCE($2, author),
        badges          = COALESCE($3, badges),
        hero_img        = COALESCE($4, hero_img),
        hero_title      = COALESCE($5, hero_title),
        hero_subtitle   = COALESCE($6, hero_subtitle),
        municipalite_id = COALESCE($7, municipalite_id)
       WHERE id = $8
       RETURNING *`,
      [slug || null, author || null, badges || null, hero_img || null,
      hero_title || null, hero_subtitle || null, municipalite_id || null, id]
    );

    if (newsResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'News not found' });
    }

    // If articles are provided, replace them entirely
    if (articles && articles.length > 0) {
      await client.query('DELETE FROM news_article WHERE news_id = $1', [id]);

      for (const article of articles) {
        await client.query(
          `INSERT INTO news_article (news_id, title, content, media_url, media_type, position)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, article.title, article.content, article.media_url || null, article.media_type || null, article.position ?? 0]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      message: 'News updated successfully',
      news: newsResult.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Edit news error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

// Delete a news post
app.delete('/news/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM news WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'News not found' });
    }

    return res.status(200).json({ message: 'News deleted successfully' });
  } catch (err) {
    console.error('Delete news error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/', (req, res) => {
  res.status(200).json({ message: 'News service is running' });
});

app.listen(port, () => {
  console.log(`News service running on port ${port}`);
});