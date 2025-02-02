// require('dotenv').config({path: './env});
import dotenv from "dotenv";
dotenv.config({
    path: './env'
});

import connectDB  from "./db/index.js";
import { app } from "./app.js";

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log(`ERROR: `, error);
        throw error;
    })
    app.listen(process.env.PORT || 8000, ()=>{
        console.log(`server is running at port : ${process.env.PORT}`);
    });
})
.catch((error)=>{
    console.log(`MONGODB connecte failed: ${error}`);
})