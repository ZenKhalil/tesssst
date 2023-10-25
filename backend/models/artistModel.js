import { DataTypes } from "sequelize";
import sequelize from "./index.js";

const Artist = sequelize.define(
  "Artist",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    artist_genres: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
    biography: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    image: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    tableName: "artists",
  }
);

const Genre = sequelize.define(
  "Genre",
  {
    genres: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
      unique: true,
    },
  },
  {
    timestamps: false,
    tableName: "genres",
  }
);

export { Artist, Genre };
