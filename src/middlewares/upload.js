import busboy from 'busboy';
import cloudinary from '../config/cloudinary.js';

const uploadImage = async (req, res, next) => {
  const bb = busboy({ headers: req.headers });
  const images = [];
  const fields = {};  // To store form fields like name, price, and categories

  // Handle form fields
  bb.on('field', (fieldname, value) => {
    console.log(`Processed field ${fieldname}: ${value}`);
    fields[fieldname] = value;  // Store form fields
  });

  // Handle file uploads
  bb.on('file', async (fieldname, file, filename, encoding, mimetype) => {
    console.log(`Processing file: ${filename}, mimetype: ${mimetype}`);

    try {
      const cloudinaryStream = cloudinary.uploader.upload_stream(
        { folder: 'ecommerce-products' },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            return res.status(500).json({ message: 'Image upload failed' });
          }

          images.push(result.secure_url);  // Add uploaded image URL to array
          if (images.length === 3) {
            console.log("All images uploaded:", images);
            fields.images = images;  // Attach images to form fields

            req.body = fields;  // Assign the form fields and images to req.body
            next();  // Continue to the next middleware
          }
        }
      );
      file.pipe(cloudinaryStream);
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ message: 'File upload error' });
    }
  });

  bb.on('error', (err) => {
    console.error('Busboy error:', err);
    res.status(500).json({ message: 'File parsing error' });
  });

  req.pipe(bb);
};

export default uploadImage;
