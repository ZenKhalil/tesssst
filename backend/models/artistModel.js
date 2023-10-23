import { DataTypes } from "sequelize";
import sequelize from "./index.js";
import Album from "./albumModel.js"; // Import the Album model for the association

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
    genres: {
      type: DataTypes.STRING,
      allowNull: true, // Set to true if you want to allow artists without a genre
    },
    biography: {
      type: DataTypes.TEXT, // TEXT type for longer strings
      allowNull: true, // Set to true if you want to allow artists without a biography
    },
    image_data: {
      type: DataTypes.BLOB, // Suitable for storing images
      allowNull: true, // Optional image
    },
  },
  {
    timestamps: true, // This adds created_at and updated_at fields in the database.
    tableName: "artists", // The name of the table in the database.
  }
);

export default Artist;
