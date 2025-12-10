require('dotenv').config();
const mongoose = require('mongoose');
const Teacher = require('./models/Teacher');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`DB Name: ${conn.connection.name}`);

        const count = await Teacher.countDocuments();
        console.log(`Teacher Count: ${count}`);

        const allTeachers = await Teacher.find({});
        console.log('Teachers found:', allTeachers);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

connectDB();
