const express = require("express");
const app = express();
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const userRoute = require("./routes/user.route.js")
const conversationRoute = require("./routes/conversation.route.js")
const gigRoute = require("./routes/gig.route.js")
const messageRoute = require("./routes/message.route.js")
const orderRoute = require("./routes/order.route.js")
const reviewRoute = require("./routes/review.route.js")
const authroute = require("./routes/auth.route.js")
const cookieParser = require("cookie-parser")
const cors = require('cors')


dotenv.config()

const connectWithRetry = async() => {
  try{
    await mongoose.connect( process.env.MONGO );
    console.log("winner winner chicken dinner !!!!!!");
  }catch(err){
    console.log("failed to connect to mongoDB on startup - retrying in 5 seconds");
    setTimeout(connectWithRetry , 5000)
  }
};
const port = process.env.PORT;

const allowedOrigins = [
  'https://playsoft-client.vercel.app', // Make sure this matches exactly
  'https://playsoft-client-8bxyvbb3k-karthikeyan-v-maxs-projects.vercel.app/', // Include any other allowed origins if needed
  'https://playsoft-client-git-main-karthikeyan-v-maxs-projects.vercel.app/',
  'https://playsoft-client-karthikeyan-v-maxs-projects.vercel.app/',
  'http://localhost:5173'
];

app.use(cookieParser())
app.use(express.json());

app.use(cors({
  origin: (origin, callback) => {
    // checks the incoming reqest origin is not undefined or the origin is not present in the above allowed origin array
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}));


app.use("/api/auth",authroute)
app.use("/api/users",userRoute);
app.use("/api/conversation",conversationRoute);
app.use("/api/message",messageRoute);
app.use("/api/order",orderRoute);
app.use("/api/review",reviewRoute);
app.use("/api/gigs",gigRoute);

// Global error handling middleware
app.use((err,req,res,next)=>{
  const errorStatus = err.status || 500;
  if (err.message === "Operation `users.findOne()` buffering timed out after 10000ms"){
    err.message = "Your database is not connected or cannot get the User from the database"
  }
  const errorMessage = err.message || "Something went wrong";

  return res.status(errorStatus).send(errorMessage);
})


app.listen(port,()=>{
  console.log(`hey man I'm running at port ${port} so you go continue your work`);
  connectWithRetry();
}) 
