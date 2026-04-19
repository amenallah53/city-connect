const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 5012;

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: Number(process.env.DB_PORT) || 5432,
});

const PRESTATAIRE_STATUSES = new Set(['pending', 'accepted', 'rejected']);
const PRESTATAIRE_REACH = new Set(['new', 'recommended', 'on-demand']);

const mapPrestataireRow = (row) => ({
	id: row.id,
	cin: row.cin || '',
	firstName: row.first_name || '',
	lastName: row.last_name || '',
	email: row.email || '',
	addresse: row.addresse || '',
	telephone: row.telephone || '',
	status: row.status || 'pending',
	role: row.role || 'prestataire',
	document: row.document || '',
	documentType: row.document_type || '',
	createdAt: row.created_at,
	specialty: row.specialty || '',
	rating: row.rating,
	description: row.description || '',
	reach: row.reach || 'new',
	socialLinks: row.social_links || [],
	submissionDate: row.submission_date,
});

app.get('/health', async (_req, res) => {
	try {
		await pool.query('SELECT 1');
		res.json({ status: 'prestataire-service is running', db: 'connected' });
	} catch (_error) {
		res.status(500).json({ status: 'prestataire-service is running', db: 'disconnected' });
	}
});

app.get('/api/prestataires', async (req, res) => {
	try {
		const { status, q = '', page = '1', limit = '1000' } = req.query;
		const parsedPage = Math.max(1, Number(page) || 1);
		const parsedLimit = Math.min(1000, Math.max(1, Number(limit) || 1000));
		const offset = (parsedPage - 1) * parsedLimit;

		const where = [`u.role = 'prestataire'`];
		const values = [];

		if (typeof status === 'string' && status.trim() && status !== 'all') {
			values.push(status.trim());
			where.push(`p.status = $${values.length}`);
		}

		if (typeof q === 'string' && q.trim()) {
			values.push(`%${q.trim()}%`);
			const param = `$${values.length}`;
			where.push(`(
				u.first_name ILIKE ${param}
				OR u.last_name ILIKE ${param}
				OR u.email ILIKE ${param}
				OR u.cin ILIKE ${param}
				OR COALESCE(p.specialty, '') ILIKE ${param}
			)`);
		}

		const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

		const countQuery = `
			SELECT COUNT(*) AS total
			FROM prestataire p
			JOIN users u ON u.id = p.user_id
			${whereClause}
		`;

		const dataQuery = `
			SELECT
				u.id,
				u.cin,
				u.first_name,
				u.last_name,
				u.email,
				u.adresse AS addresse,
				u.telephone,
				p.status,
				u.role,
				u.document,
				u.document_type,
				u.created_at,
				p.specialty,
				p.rating,
				p.description,
				p.reach,
				p.social_links,
				p.submission_date
			FROM prestataire p
			JOIN users u ON u.id = p.user_id
			${whereClause}
			ORDER BY p.submission_date DESC
			LIMIT $${values.length + 1}
			OFFSET $${values.length + 2}
		`;

		const [countResult, dataResult] = await Promise.all([
			pool.query(countQuery, values),
			pool.query(dataQuery, [...values, parsedLimit, offset]),
		]);

		return res.json({
			success: true,
			data: dataResult.rows.map(mapPrestataireRow),
			pagination: {
				page: parsedPage,
				limit: parsedLimit,
				total: Number(countResult.rows[0]?.total || 0),
			},
		});
	} catch (error) {
		console.error('Failed to fetch prestataires:', error);
		return res.status(500).json({ success: false, error: 'Failed to fetch prestataires' });
	}
});

app.get('/api/prestataires/:id', async (req, res) => {
	try {
		const result = await pool.query(
			`
				SELECT
					u.id,
					u.cin,
					u.first_name,
					u.last_name,
					u.email,
					u.adresse AS addresse,
					u.telephone,
					p.status,
					u.role,
					u.document,
					u.document_type,
					u.created_at,
					p.specialty,
					p.rating,
					p.description,
					p.reach,
					p.social_links,
					p.submission_date
				FROM prestataire p
				JOIN users u ON u.id = p.user_id
				WHERE u.id = $1
			`,
			[req.params.id]
		);

		if (!result.rowCount) {
			return res.status(404).json({ success: false, error: 'Prestataire not found' });
		}

		return res.json({ success: true, data: mapPrestataireRow(result.rows[0]) });
	} catch (error) {
		console.error('Failed to fetch prestataire:', error);
		return res.status(500).json({ success: false, error: 'Failed to fetch prestataire' });
	}
});

app.post('/api/prestataires', async (req, res) => {
	const client = await pool.connect();
	try {
		const {
			firstName,
			lastName,
			email,
			cin,
			telephone,
			addresse,
			specialty,
			description,
			status,
			reach,
			socialLinks,
			document,
			documentType,
			password,
		} = req.body || {};

		if (!firstName || !lastName || !email) {
			return res.status(400).json({
				success: false,
				error: 'firstName, lastName and email are required',
			});
		}

		const finalStatus = typeof status === 'string' && PRESTATAIRE_STATUSES.has(status) ? status : 'pending';
		const finalReach = typeof reach === 'string' && PRESTATAIRE_REACH.has(reach) ? reach : 'new';
		const safePassword = typeof password === 'string' && password.trim() ? password.trim() : 'temp-password-change-me';

		await client.query('BEGIN');

		let userId;
		const checkUser = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email]);

		if (checkUser.rows.length > 0) {
			// Existing user — update profile and role
			userId = checkUser.rows[0].id;
			await client.query(
				`
					UPDATE users
					SET
						cin = COALESCE($1, cin),
						first_name = COALESCE($2, first_name),
						last_name = COALESCE($3, last_name),
						adresse = COALESCE($4, adresse),
						telephone = COALESCE($5, telephone),
						role = 'prestataire',
						status = $6
					WHERE id = $7
				`,
				[cin || null, firstName, lastName, addresse || null, telephone || null, finalStatus, userId]
			);
		} else {
			// New user
			const userInsert = await client.query(
				`
					INSERT INTO users (cin, first_name, last_name, email, password, adresse, telephone, role, status, document, document_type)
					VALUES ($1, $2, $3, $4, $5, $6, $7, 'prestataire', $8, $9, $10)
					RETURNING id
				`,
				[cin || null, firstName, lastName, email, safePassword, addresse || null, telephone || null, finalStatus, document || null, documentType || null]
			);
			userId = userInsert.rows[0]?.id;
		}

		// Check if prestataire record already exists for this user
		const checkPrestataire = await client.query('SELECT user_id FROM prestataire WHERE user_id = $1', [userId]);

		if (checkPrestataire.rows.length > 0) {
			await client.query(
				`
					UPDATE prestataire
					SET
						status = $1,
						reach = $2,
						description = COALESCE($3, description),
						social_links = COALESCE($4, social_links),
						specialty = COALESCE($5, specialty)
					WHERE user_id = $6
				`,
				[
					finalStatus,
					finalReach,
					description || null,
					Array.isArray(socialLinks) ? socialLinks : null,
					specialty || null,
					userId,
				]
			);
		} else {
			await client.query(
				`
					INSERT INTO prestataire (user_id, status, reach, description, social_links, specialty)
					VALUES ($1, $2, $3, $4, $5, $6)
				`,
				[
					userId,
					finalStatus,
					finalReach,
					description || null,
					Array.isArray(socialLinks) ? socialLinks : null,
					specialty || null,
				]
			);
		}

		const details = await client.query(
			`
				SELECT
					u.id,
					u.cin,
					u.first_name,
					u.last_name,
					u.email,
					u.adresse AS addresse,
					u.telephone,
					p.status,
					u.role,
					u.document,
					u.document_type,
					u.created_at,
					p.specialty,
					p.rating,
					p.description,
					p.reach,
					p.social_links,
					p.submission_date
				FROM prestataire p
				JOIN users u ON u.id = p.user_id
				WHERE u.id = $1
			`,
			[userId]
		);

		await client.query('COMMIT');
		return res.status(201).json({ success: true, data: mapPrestataireRow(details.rows[0]) });
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Failed to create prestataire:', error);
		return res.status(500).json({ success: false, error: 'Failed to create prestataire' });
	} finally {
		client.release();
	}
});

app.put('/api/prestataires/:id', async (req, res) => {
	const client = await pool.connect();
	try {
		const { id } = req.params;
		const {
			firstName,
			lastName,
			email,
			cin,
			telephone,
			addresse,
			specialty,
			description,
			status,
			reach,
			socialLinks,
			document,
			documentType,
		} = req.body || {};

		const finalStatus = typeof status === 'string' && PRESTATAIRE_STATUSES.has(status) ? status : 'pending';
		const finalReach = typeof reach === 'string' && PRESTATAIRE_REACH.has(reach) ? reach : 'new';

		await client.query('BEGIN');

		const userResult = await client.query(
			`
				UPDATE users
				SET
					cin = COALESCE($1, cin),
					first_name = COALESCE($2, first_name),
					last_name = COALESCE($3, last_name),
					email = COALESCE($4, email),
					telephone = COALESCE($5, telephone),
					adresse = COALESCE($6, adresse),
					status = $7,
					document = COALESCE($8, document),
					document_type = COALESCE($9, document_type)
				WHERE id = $10 AND role = 'prestataire'
				RETURNING id
			`,
			[cin || null, firstName || null, lastName || null, email || null, telephone || null, addresse || null, finalStatus, document || null, documentType || null, id]
		);

		if (!userResult.rowCount) {
			await client.query('ROLLBACK');
			return res.status(404).json({ success: false, error: 'Prestataire not found' });
		}

		await client.query(
			`
				UPDATE prestataire
				SET
					status = $1,
					reach = $2,
					specialty = COALESCE($3, specialty),
					description = COALESCE($4, description),
					social_links = COALESCE($5, social_links)
				WHERE user_id = $6
			`,
			[
				finalStatus,
				finalReach,
				specialty || null,
				description || null,
				Array.isArray(socialLinks) ? socialLinks : null,
				id,
			]
		);

		const details = await client.query(
			`
				SELECT
					u.id,
					u.cin,
					u.first_name,
					u.last_name,
					u.email,
					u.adresse AS addresse,
					u.telephone,
					p.status,
					u.role,
					u.document,
					u.document_type,
					u.created_at,
					p.specialty,
					p.rating,
					p.description,
					p.reach,
					p.social_links,
					p.submission_date
				FROM prestataire p
				JOIN users u ON u.id = p.user_id
				WHERE u.id = $1
			`,
			[id]
		);

		await client.query('COMMIT');
		return res.json({ success: true, data: mapPrestataireRow(details.rows[0]) });
	} catch (error) {
		await client.query('ROLLBACK');
		console.error('Failed to update prestataire:', error);
		return res.status(500).json({ success: false, error: 'Failed to update prestataire' });
	} finally {
		client.release();
	}
});

app.patch('/api/prestataires/:id/status', async (req, res) => {
	try {
		const { status } = req.body || {};
		if (typeof status !== 'string' || !PRESTATAIRE_STATUSES.has(status)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid status. Allowed values: pending, accepted, rejected',
			});
		}

		const result = await pool.query(
			`
				UPDATE prestataire p
				SET status = $1
				FROM users u
				WHERE p.user_id = u.id
					AND u.id = $2
					AND u.role = 'prestataire'
				RETURNING p.user_id
			`,
			[status, req.params.id]
		);

		if (!result.rowCount) {
			return res.status(404).json({ success: false, error: 'Prestataire not found' });
		}

		await pool.query('UPDATE users SET status = $1 WHERE id = $2', [status, req.params.id]);

		return res.json({ success: true, data: { id: req.params.id, status } });
	} catch (error) {
		console.error('Failed to update prestataire status:', error);
		return res.status(500).json({ success: false, error: 'Failed to update prestataire status' });
	}
});

app.delete('/api/prestataires/:id', async (req, res) => {
	try {
		const result = await pool.query(
			`
				DELETE FROM users
				WHERE id = $1 AND role = 'prestataire'
				RETURNING id
			`,
			[req.params.id]
		);

		if (!result.rowCount) {
			return res.status(404).json({ success: false, error: 'Prestataire not found' });
		}

		return res.json({ success: true, data: { id: req.params.id } });
	} catch (error) {
		console.error('Failed to delete prestataire:', error);
		return res.status(500).json({ success: false, error: 'Failed to delete prestataire' });
	}
});

app.use((_req, res) => {
	res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, () => {
	console.log(`Prestataire service running on port ${PORT} 👷`);
});
