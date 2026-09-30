/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const multer = require('multer');
const { createStorage } = require('../lib/gridfs.storage');

// prepare the final multer upload object
const roomImageUpload = multer({
  storage: createStorage('rooms'),
  limits: {
    fileSize: 1000000 // 1MB
  },
  fileFilter: (_req, files, cb) => {
    if (files.fieldname === 'room_images') {
      if (files.mimetype === 'image/png' || files.mimetype === 'image/jpg' || files.mimetype === 'image/jpeg') {
        cb(null, true);
      } else {
        cb(new Error('Only .jpg, .png or .jpeg format allowed!'));
      }
    } else {
      cb(new Error('There was an unknown error!'));
    }
  }
});

module.exports = roomImageUpload;
