/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const mongoose = require('mongoose');
const logger = require('../middleware/winston.logger');

const connectionString = process.env.MONGO_URI;
mongoose.set('strictQuery', false);

const connectDatabase = async () => {
  try {
    await mongoose.connect(connectionString);
    logger.info('Connection establish to MongoDB database successful!');
  } catch (error) {
    logger.error('Database connection error: ', error);
    throw error;
  }
};

module.exports = connectDatabase;
