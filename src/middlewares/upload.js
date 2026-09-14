import busboy from 'busboy';
import cloudinary from '../config/cloudinary.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILES = 5;

const uploadImage = (req, res, next) => {
  const bb = busboy({
    headers: req.headers,
    limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES },
  });

  const images = [];
  const fields = {};
  let pendingUploads = 0;
  let parsingDone = false;
  let settled = false;

  const finish = () => {
    if (settled || !parsingDone || pendingUploads > 0) return;
    if (images.length === 0) {
      settled = true;
      return res.status(400).json({ message: 'At least one valid image is required' });
    }
    settled = true;
    fields.images = images;
    req.body = fields;
    next();
  };

  const fail = (status, message) => {
    if (settled) return;
    settled = true;
    res.status(status).json({ message });
  };

  bb.on('field', (fieldname, value) => {
    fields[fieldname] = value;
  });

  bb.on('file', (fieldname, file, info) => {
    const { mimeType } = info;

    if (!mimeType || !mimeType.startsWith('image/')) {
      file.resume();
      return;
    }

    pendingUploads += 1;
    let tooLarge = false;

    file.on('limit', () => {
      tooLarge = true;
      console.error('Upload rejected: file exceeded size limit');
    });

    const cloudinaryStream = cloudinary.uploader.upload_stream(
      { folder: 'ecommerce-products', resource_type: 'image' },
      (error, result) => {
        pendingUploads -= 1;
        if (tooLarge) {
          return fail(413, 'File too large');
        }
        if (error) {
          console.error('Cloudinary upload error:', error);
          return fail(500, 'Image upload failed');
        }
        images.push(result.secure_url);
        finish();
      }
    );
    file.pipe(cloudinaryStream);
  });

  bb.on('filesLimit', () => {
    fail(400, `Too many files; maximum is ${MAX_FILES}`);
  });

  bb.on('error', (err) => {
    console.error('Busboy error:', err);
    fail(500, 'File parsing error');
  });

  bb.on('close', () => {
    parsingDone = true;
    finish();
  });

  req.pipe(bb);
};

export default uploadImage;
