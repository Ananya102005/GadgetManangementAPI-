import express from "express";
import dotenv from "dotenv";
dotenv.config( {path:"./.env"} );
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index"

const app = express();
const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

app.use(express.json());
app.use(cookieParser());    
app.use(cors(corsOptions));
app.use(express.urlencoded({extended:true}));
app.use("/api", routes);


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});


