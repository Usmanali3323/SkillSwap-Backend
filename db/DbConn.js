import mongoose from "mongoose";
import {DB_Name} from "../constants.js";

const DbConn = async()=>{
try {
    const db = await mongoose.connect(`${process.env.MONGO_URI}/${DB_Name}`);
    console.log(`Connection Establish with Mongodb ${db.connect.host}`);
} catch (error) {
    console.log(" Error in MONGODB Connection ",error);
    process.exit(1);
}
}

export default DbConn;