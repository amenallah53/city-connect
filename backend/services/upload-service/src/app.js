const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const localUploadsDir = path.join(__dirname, '../uploads');

const ensureLocalUploadsDir = () => {
  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  }
};

const JWT_SECRET = process.env.JWT_SECRET || 'city-connect-secure-secret-2024';

// Middleware to serve uploaded files locally
app.use('/uploads', express.static(localUploadsDir));

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error (Upload):', err.message);
      return res.status(403).json({ error: 'Invalid token.', message: err.message });
    }
    req.user = user;
    next();
  });
};

// Check if we should use Mock/Local storage
const useLocalStorage = !process.env.B2_BUCKET_NAME ||
  process.env.B2_BUCKET_NAME.includes('your_bucket_name') ||
  !process.env.B2_KEY_ID;

let storage;
let s3;

if (useLocalStorage) {
  console.log('⚠️  Using LOCAL STORAGE for uploads (B2 credentials not configured)');
  ensureLocalUploadsDir();

  storage = multer.diskStorage({
    destination: function (req, file, cb) {
      ensureLocalUploadsDir();
      cb(null, localUploadsDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
    }
  });
} else {
  console.log('✅ Using BACKBLAZE B2 for uploads');
  // Configure S3 Client for Backblaze B2
  s3 = new S3Client({
    endpoint: process.env.B2_ENDPOINT || 'https://s3.us-east-005.backblazeb2.com',
    credentials: {
      accessKeyId: process.env.B2_KEY_ID,
      secretAccessKey: process.env.B2_APPLICATION_KEY,
    },
    region: process.env.B2_REGION || 'us-east-005',
  });

  storage = multerS3({
    s3: s3,
    bucket: process.env.B2_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, 'uploads/' + uniqueSuffix + path.extname(file.originalname));
    },
  });
}

const upload = multer({ storage });

/**
 * @api {post} /api/uploads Upload an image
 */
app.post('/api/uploads', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const PORT = process.env.PORT || 5010;
  let fileUrl;
  if (useLocalStorage) {
    // Generate a URL that points back to this service
    fileUrl = `http://localhost:${PORT}/uploads/${req.file.filename}`;
  } else {
    // Construct proxy URL to bypass B2 private bucket restrictions
    fileUrl = `http://localhost:${PORT}/api/uploads/proxy?key=${req.file.key}`;
  }

  res.json({ url: fileUrl });
});

/**
 * @api {get} /api/uploads/proxy Stream private B2 files to the frontend
 */
app.get('/api/uploads/proxy', async (req, res) => {
  const key = req.query.key;
  if (!key) return res.status(400).send('Missing file key');

  if (useLocalStorage) {
    return res.redirect(`/uploads/${key.replace('uploads/', '')}`);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: process.env.B2_BUCKET_NAME,
      Key: key
    });

    // Fetch directly using AWS SDK S3Client stream
    const response = await s3.send(command);

    // Set appropriate headers so browsers can render images/videos
    res.set('Content-Type', response.ContentType);
    res.set('Content-Length', response.ContentLength);

    // Pipe the readable stream back to the UI seamlessly
    response.Body.pipe(res);
  } catch (err) {
    console.error('Error securely proxying file from B2:', err);
    res.status(500).send('Error loading protected media');
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'Upload service is healthy', storage: useLocalStorage ? 'local' : 's3' });
});

const PORT = process.env.PORT || 5010;
app.listen(PORT, () => {
  console.log(`Upload service running on port ${PORT} 📦`);
});
