const app = require("./app");
const connectDatabase = require("./db/Database.js");
const cloudinary = require("cloudinary");
const dotenv = require('dotenv');

// Handling uncaught Exception
process.on("uncaughtException",(err) =>{
    console.log(`Error: ${err.message}`);
    console.log(`Shutting down the server for Handling uncaught Exception`);
})

// config
// if(process.env.NODE_ENV!=="PRODUCTION"){
// require("dotenv").config({
//     path:"./backend/config/.env"
// })}

// Set up Global configuration access
dotenv.config();
// connect database
connectDatabase();

// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// })
cloudinary.config({ 
    cloud_name: 'dlhgax0bc', 
    api_key: '834963545329235', 
    api_secret: 'fagZJ5ieNiTLZTRr2-2MufUQvco' 
  });
// create server  process.env.PORT
const server = app.listen(801,() =>{
    console.log(`Server is working on http://localhost:${process.env.PORT}`)
    console.error(`server listening on ${server.address().port}`);
})


// Unhandled promise rejection
process.on("unhandledRejection", (err) =>{
    console.log(`Shutting down server for ${err.message}`);
    console.log(`Shutting down the server due to Unhandled promise rejection`);
    server.close(() =>{
        process.exit(1);
    });
});