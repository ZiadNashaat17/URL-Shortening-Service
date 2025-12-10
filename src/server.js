import { connect } from "mongoose";

import app from "./app.js";

const port = process.env.PORT;
const DB = process.env.DATABASE;

(async () => {
  try {
    await connect(DB);
    console.log("Connected to database successfully");

    app.listen(port, () => {
      console.log("URL Shortening Service is up and running on port: ", port);
    });
  } catch (error) {
    console.error("User service startup error: ", error);
    process.exit(1);
  }
})();
