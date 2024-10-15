import { log } from "console";
import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?:number
}
const connection: ConnectionObject = {}

async function dbConnect(): Promise<void> {
    //check agr db already connected hai
    //! NextJs is an edge time framwork so we donr have a db running all the time we make db connection when we need as the application process so we are cjecking here if db is connected already or not so that our calls dont clash
    if (connection.isConnected) { 
        console.log("Already connected to db");
        return
    }

    try {
      const db = await mongoose.connect(process.env.MONGODB_URI || "", {});

      //Upon successful connection, connection.isConnected is updated to reflect the state of the connection (db.connections[0].readyState), which indicates whether the connection is open, connected, or closed.
      connection.isConnected = db.connections[0].readyState;
      console.log("DB Connected successfully");

      // console.log(db);
    } catch (error) {
        console.log("db connection failed", error);
        process.exit(1);
        
    }
}
export default dbConnect