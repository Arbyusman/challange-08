const db = require("../app/models");

const {
  DB_USER = "postgres",
  DB_PASSWORD = "IRqjQbJHXJmkNrLUiNh5",
  DB_NAME = "railway",
  DB_HOST = "containers-us-west-112.railway.app",
  DB_PORT = "7845",
} = process.env;

module.exports = {
  development: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres"
  },
  test: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres"
  },
  production: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    host: DB_HOST,
    port: DB_PORT,
    dialect: "postgres"
  }
}
