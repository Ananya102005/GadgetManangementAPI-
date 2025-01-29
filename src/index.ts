import express from "express";
import dotenv from "dotenv";
dotenv.config( {path:"./.env"} );
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index"
import swaggerUi from 'swagger-ui-express';
import { specs } from './configs/swagger';


const app = express();
// cors options
const corsOptions = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};
// swagger options
// Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    validatorUrl: null,
    docExpansion: 'none'
  }
};

app.use(express.json());
app.use(cookieParser());    
app.use(cors(corsOptions));
app.use(express.urlencoded({extended:true}));
app.use("/api", routes);

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));


app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});


