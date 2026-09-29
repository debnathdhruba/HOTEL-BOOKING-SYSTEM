const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Room = require('../src/models/room.model');
const User = require('../src/models/user.model');

const backupDirectory = path.join(__dirname, '..', 'docs', 'db-backup-7-22-2023');
const roomsFile = path.join(backupDirectory, 'rooms.json');
const sourceImagesDirectory = path.join(backupDirectory, 'uploads', 'rooms');
const publicImagesDirectory = path.join(__dirname, '..', 'public', 'uploads', 'rooms');

const copyRoomImages = () => {
  fs.mkdirSync(publicImagesDirectory, { recursive: true });
  fs.readdirSync(sourceImagesDirectory).forEach((fileName) => {
    fs.copyFileSync(
      path.join(sourceImagesDirectory, fileName),
      path.join(publicImagesDirectory, fileName)
    );
  });
};

const createAdmin = async () => {
  const email = 'admin@hotel.local';
  let admin = await User.findOne({ email });

  if (!admin) {
    if (!process.env.SEED_ADMIN_PASSWORD) {
      throw new Error('SEED_ADMIN_PASSWORD must be set before running the room seeder.');
    }

    admin = await User.create({
      userName: 'hotel-admin',
      fullName: 'Hotel Administrator',
      email,
      phone: '+14155552671',
      password: process.env.SEED_ADMIN_PASSWORD,
      avatar: '/avatar.png',
      gender: 'male',
      dob: '1990-01-01',
      address: 'Hotel Administration',
      role: 'admin',
      verified: true,
      status: 'logout'
    });
  }

  return admin;
};

const seedRooms = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be set before running the room seeder.');
  }

  await mongoose.connect(process.env.MONGO_URI);

  const existingRoomCount = await Room.countDocuments();
  if (existingRoomCount > 0) {
    console.log(`Skipped: database already contains ${existingRoomCount} room(s).`);
    return;
  }

  const admin = await createAdmin();
  const backupRooms = JSON.parse(fs.readFileSync(roomsFile, 'utf8'));
  const rooms = backupRooms.map((room) => ({
    room_name: room.room_name,
    room_slug: room.room_slug,
    room_type: room.room_type,
    room_price: room.room_price,
    room_size: room.room_size,
    room_capacity: room.room_capacity,
    allow_pets: room.allow_pets,
    provide_breakfast: room.provide_breakfast,
    featured_room: room.featured_room,
    room_description: room.room_description,
    extra_facilities: room.extra_facilities,
    room_images: room.room_images.map((image) => ({ url: image.url })),
    room_status: room.room_status,
    created_by: admin._id
  }));

  copyRoomImages();
  await Room.insertMany(rooms);
  console.log(`Seeded ${rooms.length} rooms and copied their images.`);
};

seedRooms()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
