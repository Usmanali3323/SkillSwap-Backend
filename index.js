import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./Routes/user.routes.js";
import DbConn from "./db/DbConn.js";// Replace with your actual DB connection file path
import skillRouter from './Routes/skill.routes.js'
import categoryRouter from './Routes/category.routes.js'
import connectionRouter from './Routes/connection.routes.js'
import chatRouter from './Routes/chat.routes.js'
import reviewRouter from './Routes/review.routes.js'
import adminRouter from './Routes/admin.routes.js'
import reportRouter from './Routes/report.routes.js'
import notificationRouter from './Routes/notification.routes.js'
// Load environment variables
dotenv.config({ path: "./.env" });

const app = express();


// const allowedOrigins = ['http://localhost:5173']; // Frontend URL

// Middleware


const allowedOrigins = [
  "https://skillswap-backend-ta8t.onrender.com", // production
  "http://localhost:3000",
  "http://localhost:5173/"// local dev
];

app.use(cors({
  origin: function (origin, callback) {
    console.log("CORS request from:", origin);
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));




app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));


// Routes
app.use('/message', chatRouter)
app.use("/users", userRouter);
app.use("/skill", skillRouter);
app.use('/category',categoryRouter)
app.use('/connection',connectionRouter)
app.use('/review',reviewRouter)
app.use('/admin',adminRouter)
app.use('/report',reportRouter)
app.use('/notification',notificationRouter)
// Global error handler
// Database connection and server start
DbConn()
  .then(() => {
    app.on("error", () => {
      console.log("Error is coming in App");
    });

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`App is working on port ${PORT}`);
    });
  })
  .catch(() => {
    console.log("Error in MONGODB Connection");
  });

