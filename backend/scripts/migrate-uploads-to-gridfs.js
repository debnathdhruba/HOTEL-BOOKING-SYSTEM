/* eslint-disable no-await-in-loop, no-console, no-continue */
const fs = require('fs');
const path = require('path');
const { pipeline } = require('stream/promises');
const mongoose = require('mongoose');
const env = require('dotenv');

env.config({ path: path.resolve(__dirname, '../.env') });

const connectDatabase = require('../src/database/connect.mongo.db');
const { getBucket, normalizeUploadName } = require('../src/lib/gridfs.storage');

const contentTypeFor = (filename) => {
  const extension = path.extname(filename).toLowerCase();
  if (extension === '.png') return 'image/png';
  if (extension === '.webp') return 'image/webp';
  return 'image/jpeg';
};

const referencedUploads = async () => {
  const rooms = await mongoose.connection.db.collection('rooms')
    .find({}, { projection: { room_images: 1 } }).toArray();
  const users = await mongoose.connection.db.collection('users')
    .find({}, { projection: { avatar: 1 } }).toArray();

  return [...new Set([
    ...rooms.flatMap((room) => (room.room_images || []).map((image) => image.url)),
    ...users.map((user) => user.avatar)
  ].map(normalizeUploadName).filter(Boolean))];
};

const migrate = async () => {
  await connectDatabase();
  const bucket = getBucket();
  const names = await referencedUploads();
  const publicDirectory = path.resolve(__dirname, '../public');
  const result = { copied: 0, existing: 0, missing: [] };

  for (const uploadName of names) {
    const existing = await mongoose.connection.db.collection('uploads.files')
      .findOne({ filename: uploadName });
    if (existing) {
      result.existing += 1;
      continue;
    }

    const source = path.resolve(publicDirectory, 'uploads', uploadName);
    if (!source.startsWith(`${publicDirectory}${path.sep}`) || !fs.existsSync(source)) {
      result.missing.push(uploadName);
      continue;
    }

    const output = bucket.openUploadStream(uploadName, {
      metadata: { contentType: contentTypeFor(source), migratedFrom: uploadName }
    });
    try {
      await pipeline(fs.createReadStream(source), output);
      result.copied += 1;
    } catch (error) {
      await bucket.delete(output.id).catch(() => {});
      throw error;
    }
  }

  console.log(JSON.stringify(result, null, 2));
  if (result.missing.length) process.exitCode = 1;
};

migrate()
  .catch((error) => {
    console.error(`Upload migration failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
