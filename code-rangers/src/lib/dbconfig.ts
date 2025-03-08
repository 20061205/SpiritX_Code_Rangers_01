import mongoose from 'mongoose';

const connectMongo = async () => {
  console.log("Connecting to mongo");
  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to mongo");
    return mongoose.connection.asPromise();
   
  }
  console.log("Alrjzdnljy connected to mongo");
  return mongoose.connect(process.env.MONGO_URI as string);
};

export default connectMongo;