const mongoose = require('mongoose');
const connectDB = require('../config/db');

const noValue = (value) => value || 'none';
const yesNo = (value) => value ? 'yes' : 'no';

const withDatabase = async (operation, {
  connect = connectDB,
  disconnect = () => mongoose.disconnect(),
} = {}) => {
  let operationFailed = false;
  try {
    await connect();
    return await operation();
  } catch (error) {
    operationFailed = true;
    throw error;
  } finally {
    try {
      await disconnect();
    } catch (disconnectError) {
      if (!operationFailed) throw disconnectError;
    }
  }
};

const runCli = (run, failureMessage) => {
  require('dotenv').config();
  run().catch((error) => {
    console.error(error?.message || failureMessage);
    process.exitCode = 1;
  });
};

module.exports = { noValue, runCli, withDatabase, yesNo };
