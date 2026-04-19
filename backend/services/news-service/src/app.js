const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 5013;

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: Number(process.env.DB_PORT) || 5432,
});

function mapNewsRow(row) {
	return {
		id: row.id,
		slug: row.slug,
		author: row.author,
		date: row.date,
		badges: Array.isArray(row.badges) ? row.badges : [],
		heroImg: row.hero_img,
		heroTitle: row.hero_title,
		heroSubtitle: row.hero_subtitle,
		municipaliteId: row.municipalite_id,
		subArticles: Array.isArray(row.sub_articles) ? row.sub_articles : [],
	};
}

app.get('/health', async (_req, res) => {
	try {
		await pool.query('SELECT 1');
		res.json({ status: 'news-service is running', db: 'connected' });
	} catch (_error) {
		res.status(500).json({ status: 'news-service is running', db: 'disconnected' });
	}
});

app.get('/api/news', async (req, res) => {
	try {
		const requestedLimit = Number(req.query.limit);
		const limit = Number.isFinite(requestedLimit)
			? Math.min(100, Math.max(1, requestedLimit))
			: 4;

		const { rows } = await pool.query(
			`SELECT
				n.id,
				n.slug,
				n.author,
				n.date,
				n.badges,
				n.hero_img,
				n.hero_title,
				n.hero_subtitle,
				n.municipalite_id,
				COALESCE(
					json_agg(
						json_build_object(
							'id', na.id,
							'position', na.position,
							'title', na.title,
							'content', na.content,
							'mediaUrl', na.media_url,
							'mediaType', CASE
								WHEN na.media_type ILIKE 'image/%' THEN 'image'
								ELSE na.media_type
							END
						)
						ORDER BY na.position
					) FILTER (WHERE na.id IS NOT NULL),
					'[]'::json
				) AS sub_articles
			FROM news n
			LEFT JOIN news_article na ON na.news_id = n.id
			GROUP BY n.id
			ORDER BY n.date DESC
			LIMIT $1`,
			[limit]
		);

		res.json(rows.map(mapNewsRow));
	} catch (error) {
		console.error('Failed to fetch latest news:', error);
		res.status(500).json({
			message: 'Failed to fetch latest news',
			details: process.env.NODE_ENV === 'production' ? undefined : String(error?.message || error),
		});
	}
});

app.get('/api/news/:id', async (req, res) => {
	try {
		const { id } = req.params;

		const { rows } = await pool.query(
			`SELECT
				n.id,
				n.slug,
				n.author,
				n.date,
				n.badges,
				n.hero_img,
				n.hero_title,
				n.hero_subtitle,
				n.municipalite_id,
				COALESCE(
					json_agg(
						json_build_object(
							'id', na.id,
							'position', na.position,
							'title', na.title,
							'content', na.content,
							'mediaUrl', na.media_url,
							'mediaType', CASE
								WHEN na.media_type ILIKE 'image/%' THEN 'image'
								ELSE na.media_type
							END
						)
						ORDER BY na.position
					) FILTER (WHERE na.id IS NOT NULL),
					'[]'::json
				) AS sub_articles
			FROM news n
			LEFT JOIN news_article na ON na.news_id = n.id
			WHERE n.id::text = $1 OR n.slug = $1
			GROUP BY n.id
			LIMIT 1`,
			[id]
		);

		if (rows.length === 0) {
			return res.status(404).json({ message: 'News not found' });
		}

		return res.json(mapNewsRow(rows[0]));
	} catch (error) {
		console.error('Failed to fetch news details:', error);
		return res.status(500).json({
			message: 'Failed to fetch news details',
			details: process.env.NODE_ENV === 'production' ? undefined : String(error?.message || error),
		});
	}
});

app.listen(PORT, () => {
	console.log(`news-service running on port ${PORT}`);
});
