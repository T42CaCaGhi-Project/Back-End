import { connect } from "./src/db";
import { app } from "./src/app";

const uri = process.env.MONGOURI;
connect(uri);
const port = process.env.PORT || "3300";
app.listen(port, () => {
  console.log(`app listening at port: ${port}`);
});
