import dotenv from 'dotenv';
dotenv.config();

export const development = {
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'Kim2300@',
    database: process.env.DB_DATABASE || 'music_db',
    host: process.env.DB_HOST || '127.0.0.1',
    dialect: 'mysql'
};
