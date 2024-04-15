import express from "express";
import routes from "./routes/routes.js";
import dotenv from "dotenv";
import cors from "cors";
import { connectMongoDB } from "./db/mongodb.js";
import { redisConnect } from "./db/redis.js";
import bodyParser from "express";

dotenv.config();

// Define the allowed origins
const allowedOrigins = [
  "http://localhost:4200",
  "https://test.conversation.goengen.com",
  "https://web-conversation-v2-sn5rsq6dda-uc.a.run.app",
]; // Add your allowed domains here

// Set up CORS options
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const app = express();
app.use(express.json());
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

app.use(cors());

async function startWebApp() {
  try {
    const PORT = process.env.PORT || 3000;
    await connectMongoDB();
    //await redisConnect();
    routes(app);
    try {
      app.listen(PORT, () => {
        console.log(`Service waiting you on room number:${PORT}`);
      });
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    console.error(
      "Error connecting to the database or starting the server:",
      error
    );
  }
}

startWebApp()
  .then(() => {
    console.log("server started and ready to serve!!!");
  })
  .catch((error) => {
    console.error(error);
  });
