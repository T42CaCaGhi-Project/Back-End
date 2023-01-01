import "dotenv/config";
import mongoose from "mongoose";

//const uri = process.env.MONGOURI;

export function connect(uri: string) {
  mongoose.connect(uri, (err) => {
    if (err) {
      console.log("error code: " + err.message.split(" ")[1]);
    }
  });
  const db = mongoose.connection;
  db.on("connected", () => console.log("connected to db"));
}
