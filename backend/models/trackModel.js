import { DataTypes } from 'sequelize';
import sequelize from './index.js';

const Track = sequelize.define('Track', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duration: {
    type: DataTypes.STRING(10)
  },
  album_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'albums', // This is the name of the table in the database, not the model name in the code.
      key: 'id'
    }
  }
}, {
  timestamps: false, // Since you didn't specify any timestamp fields in the SQL
  tableName: 'tracks'
});

export default Track;
