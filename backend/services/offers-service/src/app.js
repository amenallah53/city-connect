const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT) || 5011;

const pool = new Pool({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	port: Number(process.env.DB_PORT) || 5432,
});

const OFFER_STATUSES = new Set(['pending', 'approved', 'rejected', 'done', 'cancelled']);

const mapOfferRow = (row) => ({
	id: row.id,
	status: row.status,
	dateJobSuggestion: row.date_job_suggestion,
	dateCreation: row.date_creation,
	prestataireId: row.prestataire_id,
	offerorId: row.offeror_id,
	offeror: {
		id: row.offeror_id,
		cin: row.offeror_cin || '',
		firstName: row.offeror_first_name || '',
		lastName: row.offeror_last_name || '',
		email: row.offeror_email || '',
		addresse: row.offeror_addresse || '',
		telephone: row.offeror_telephone || '',
		status: row.offeror_status || 'accepted',
		role: row.offeror_role || 'citoyen',
		createdAt: row.offeror_created_at,
	},
	prestataire: {
		id: row.prestataire_id,
		firstName: row.prestataire_first_name || '',
		lastName: row.prestataire_last_name || '',
		email: row.prestataire_email || '',
		telephone: row.prestataire_telephone || '',
	},
});

app.get('/health', async (_req, res) => {
	try {
		await pool.query('SELECT 1');
		res.json({ status: 'offers-service is running', db: 'connected' });
	} catch (_error) {
		res.status(500).json({ status: 'offers-service is running', db: 'disconnected' });
	}
});

app.get('/api/offers', async (req, res) => {
	try {
		const { status, q = '', offerorId, prestataireId, page = '1', limit = '1000' } = req.query;
		const parsedPage = Math.max(1, Number(page) || 1);
		const parsedLimit = Math.min(1000, Math.max(1, Number(limit) || 1000));
		const offset = (parsedPage - 1) * parsedLimit;

		const where = [];
		const values = [];

		if (typeof status === 'string' && status.trim() && status !== 'all') {
			values.push(status.trim());
			where.push(`jo.status = $${values.length}`);
		}

		if (offerorId) {
			values.push(offerorId);
			where.push(`jo.offeror_id = $${values.length}`);
		}

		if (prestataireId) {
			values.push(prestataireId);
			where.push(`jo.prestataire_id = $${values.length}`);
		}

		if (typeof q === 'string' && q.trim()) {
			values.push(`%${q.trim()}%`);
			const param = `$${values.length}`;
			where.push(`(
				u.first_name ILIKE ${param}
				OR u.last_name ILIKE ${param}
				OR u.email ILIKE ${param}
			)`);
		}

		const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

		const countQuery = `
			SELECT COUNT(*) AS total
			FROM job_offer jo
			JOIN users u_off ON u_off.id = jo.offeror_id
			${whereClause.replace(/u\./g, 'u_off.')}
		`;

		const dataQuery = `
			SELECT
				jo.id,
				jo.status,
				jo.date_job_suggestion,
				jo.date_creation,
				jo.prestataire_id,
				jo.offeror_id,
				u_off.cin AS offeror_cin,
				u_off.first_name AS offeror_first_name,
				u_off.last_name AS offeror_last_name,
				u_off.email AS offeror_email,
				u_off.adresse AS offeror_addresse,
				u_off.telephone AS offeror_telephone,
				u_off.status AS offeror_status,
				u_off.role AS offeror_role,
				u_off.created_at AS offeror_created_at,
				u_pres.first_name AS prestataire_first_name,
				u_pres.last_name AS prestataire_last_name,
				u_pres.email AS prestataire_email,
				u_pres.telephone AS prestataire_telephone
			FROM job_offer jo
			JOIN users u_off ON u_off.id = jo.offeror_id
			JOIN users u_pres ON u_pres.id = jo.prestataire_id
			${whereClause.replace(/u\./g, 'u_off.')}
			ORDER BY jo.date_creation DESC
			LIMIT $${values.length + 1}
			OFFSET $${values.length + 2}
		`;

		const [countResult, dataResult] = await Promise.all([
			pool.query(countQuery, values),
			pool.query(dataQuery, [...values, parsedLimit, offset]),
		]);

		res.json({
			success: true,
			data: dataResult.rows.map(mapOfferRow),
			pagination: {
				page: parsedPage,
				limit: parsedLimit,
				total: Number(countResult.rows[0]?.total || 0),
			},
		});
	} catch (error) {
		console.error('Failed to fetch offers:', error);
		res.status(500).json({
			success: false,
			error: 'Failed to fetch offers',
			details: process.env.NODE_ENV === 'production' ? undefined : String(error?.message || error),
		});
	}
});

app.get('/api/offers/:id', async (req, res) => {
	try {
		const result = await pool.query(
			`
				SELECT
					jo.id,
					jo.status,
					jo.date_job_suggestion,
					jo.date_creation,
					jo.prestataire_id,
					jo.offeror_id,
					u_off.cin AS offeror_cin,
					u_off.first_name AS offeror_first_name,
					u_off.last_name AS offeror_last_name,
					u_off.email AS offeror_email,
					u_off.adresse AS offeror_addresse,
					u_off.telephone AS offeror_telephone,
					u_off.status AS offeror_status,
					u_off.role AS offeror_role,
					u_off.created_at AS offeror_created_at,
					u_pres.first_name AS prestataire_first_name,
					u_pres.last_name AS prestataire_last_name,
					u_pres.email AS prestataire_email,
					u_pres.telephone AS prestataire_telephone
				FROM job_offer jo
				JOIN users u_off ON u_off.id = jo.offeror_id
				JOIN users u_pres ON u_pres.id = jo.prestataire_id
				WHERE jo.id = $1
			`,
			[req.params.id]
		);

		if (!result.rowCount) {
			return res.status(404).json({ success: false, error: 'Offer not found' });
		}

		return res.json({ success: true, data: mapOfferRow(result.rows[0]) });
	} catch (error) {
		console.error('Failed to fetch offer details:', error);
		return res.status(500).json({ success: false, error: 'Failed to fetch offer details' });
	}
});

app.post('/api/offers', async (req, res) => {
	try {
		const { prestataireId, offerorId, dateJobSuggestion, status } = req.body || {};

		if (!prestataireId || !offerorId || !dateJobSuggestion) {
			return res.status(400).json({
				success: false,
				error: 'prestataireId, offerorId and dateJobSuggestion are required',
			});
		}

		const finalStatus = typeof status === 'string' && OFFER_STATUSES.has(status) ? status : 'pending';

		const insertResult = await pool.query(
			`
				INSERT INTO job_offer (prestataire_id, offeror_id, date_job_suggestion, status)
				VALUES ($1, $2, $3, $4)
				RETURNING id
			`,
			[prestataireId, offerorId, dateJobSuggestion, finalStatus]
		);

		const createdId = insertResult.rows[0]?.id;
		const details = await pool.query(
			`
				SELECT
					jo.id,
					jo.status,
					jo.date_job_suggestion,
					jo.date_creation,
					jo.prestataire_id,
					jo.offeror_id,
					u_off.cin AS offeror_cin,
					u_off.first_name AS offeror_first_name,
					u_off.last_name AS offeror_last_name,
					u_off.email AS offeror_email,
					u_off.adresse AS offeror_addresse,
					u_off.telephone AS offeror_telephone,
					u_off.status AS offeror_status,
					u_off.role AS offeror_role,
					u_off.created_at AS offeror_created_at,
					u_pres.first_name AS prestataire_first_name,
					u_pres.last_name AS prestataire_last_name,
					u_pres.email AS prestataire_email,
					u_pres.telephone AS prestataire_telephone
				FROM job_offer jo
				JOIN users u_off ON u_off.id = jo.offeror_id
				JOIN users u_pres ON u_pres.id = jo.prestataire_id
				WHERE jo.id = $1
			`,
			[createdId]
		);

		return res.status(201).json({ success: true, data: mapOfferRow(details.rows[0]) });
	} catch (error) {
		console.error('Failed to create offer:', error);
		return res.status(500).json({ success: false, error: 'Failed to create offer' });
	}
});

app.patch('/api/offers/:id/status', async (req, res) => {
	try {
		const { status } = req.body || {};

		if (typeof status !== 'string' || !OFFER_STATUSES.has(status)) {
			return res.status(400).json({
				success: false,
				error: 'Invalid status. Allowed values: pending, approved, rejected, done, cancelled',
			});
		}

		const updateResult = await pool.query(
			`
				UPDATE job_offer
				SET status = $1
				WHERE id = $2
				RETURNING id
			`,
			[status, req.params.id]
		);

		if (!updateResult.rowCount) {
			return res.status(404).json({ success: false, error: 'Offer not found' });
		}

		return res.json({
			success: true,
			data: { id: req.params.id, status },
		});
	} catch (error) {
		console.error('Failed to update offer status:', error);
		return res.status(500).json({ success: false, error: 'Failed to update offer status' });
	}
});

app.use((_req, res) => {
	res.status(404).json({ success: false, error: 'Route not found' });
});

app.listen(PORT, () => {
	console.log(`Offers service running on port ${PORT} 💼`);
});
