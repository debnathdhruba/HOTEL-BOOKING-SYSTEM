const path = require('path');
const crypto = require('crypto');
const { pipeline } = require('stream');
const mongoose = require('mongoose');

const getBucket = () => {
  if (!mongoose.connection.db) throw new Error('MongoDB must be connected before accessing uploads');
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
};

const normalizeUploadName = (value) => {
  const normalized = String(value).replace(/\\/g, '/');
  const match = normalized.match(/(?:^|\/)uploads\/(rooms|users)\/([^/]+)$/);
  return match ? `${match[1]}/${match[2]}` : null;
};

const createStorage = (category) => ({
  _handleFile(_req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    const filename = `${crypto.randomBytes(16).toString('hex')}${extension}`;
    const uploadName = `${category}/${filename}`;
    const output = getBucket().openUploadStream(uploadName, {
      metadata: { contentType: file.mimetype, originalName: file.originalname }
    });

    pipeline(file.stream, output, (error) => {
      if (error) {
        getBucket().delete(output.id).catch(() => {});
        callback(error);
        return;
      }
      callback(null, { filename, id: output.id, size: output.length });
    });
  },

  _removeFile(_req, file, callback) {
    if (!file.id) return callback(null);
    return getBucket().delete(file.id).then(() => callback(null), callback);
  }
});

const deleteByUploadPath = async (filePath) => {
  const uploadName = normalizeUploadName(filePath);
  if (!uploadName) return false;
  const bucket = getBucket();
  const files = await bucket.find({ filename: uploadName }).toArray();
  await Promise.all(files.map((file) => bucket.delete(file._id)));
  return files.length > 0;
};

// Compatibility wrapper for the controllers that previously called fs.unlink.
const unlink = (filePath, callback = () => {}) => {
  deleteByUploadPath(filePath).then(() => callback(null), callback);
};

const serveUpload = async (req, res, next) => {
  try {
    const uploadName = normalizeUploadName(`/uploads/${req.params.category}/${req.params.filename}`);
    if (!uploadName) return next();
    const bucket = getBucket();
    const [file] = await bucket.find({ filename: uploadName }).limit(1).toArray();
    if (!file) return next();

    res.set('Content-Type', file.metadata?.contentType || 'application/octet-stream');
    res.set('Content-Length', String(file.length));
    res.set('Cache-Control', 'public, max-age=86400');
    const stream = bucket.openDownloadStream(file._id);
    stream.on('error', next);
    stream.pipe(res);
    return undefined;
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createStorage, deleteByUploadPath, getBucket, normalizeUploadName, serveUpload, unlink
};
