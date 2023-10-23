import { Sequelize } from 'sequelize';
import { development } from "../config/database.js";

const sequelize = new Sequelize(
  development.database,
  development.username,
  development.password,
  {
    host: development.host,
    dialect: 'mysql',
    logging: console.log  // Add this line
  }
);


sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(error => {
    console.error('Unable to connect to the database:', error);
  });

export default sequelize;