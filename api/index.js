import express from 'express'
import mongoose from 'mongoose';
import dotenv from 'dotenv'



dotenv.config()
mongoose.connect(process.env.MONGO).then(() => {
    console.log("connected to mongooDB")
}).catch((err)=>{
    console.log(err)
})



const app = express();

app.listen(3000, () => {
    console.log("This Server is running on PORT 3000!!")
});
