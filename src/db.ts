import "dotenv/config";
import mongoose from "mongoose";

const uri = process.env.MONGOURI;

function connect() {
  mongoose.connect(uri, (err) => {
    if (err) {
      console.log("error code: " + err.message.split(" ")[1]);
      console.log("connection failed, retrying in 5s");
      setTimeout(() => connect(), 5000);
    }
  });
  const db = mongoose.connection;
  //problema che se fa x tentatifi falliti poi esegue x volte il codice sottostante
  db.on("connected", () => console.log("connected to db"));
}

export default { connect };
