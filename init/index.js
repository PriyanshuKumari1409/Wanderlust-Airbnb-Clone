
const mongoose =require("mongoose");
const initData= require("./data.js");
const Listing=require("../models/listing.js");




const MONGO_URL="mongodb://127.0.0.1:27017/Wanderlust";

 main()
 .then(() =>{
  console.log("Connected to DB");
 })
 .catch((err)=>{
  console.log(err);
 });

    async function main() {
      await mongoose.connect(MONGO_URL);
    };


    const initDB = async () => {
  await Listing.deleteMany({});

  // Create a new array with owner field added
  initData.data = initData.data.map(obj => {
    return { ...obj, owner: '6884d242040e971bdd5089a5' };
  });

  await Listing.insertMany(initData.data);
  console.log("Data was initialized");
};


    initDB();