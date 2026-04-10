const mongoose= require("mongoose");
const review = require("./review");
const Schema= mongoose.Schema;
const Review = require("./review.js");



const listingSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: String,

  image: {
    filename: String,  // Stores uploaded file's name
    url: {
      type: String,
      default: "https://tse3.mm.bing.net/th/id/OIP._TMbDrfgMFsbhdxHwgy4ZAHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      set: (v) =>
        v === " " ? "https://tse3.mm.bing.net/th/id/OIP._TMbDrfgMFsbhdxHwgy4ZAHaFj?r=0&rs=1&pid=ImgDetMain&o=7&rm=3" : v
    }
  },

  price: Number,
  location: String,
  country: String,
reviews:[{
  type:Schema.Types.ObjectId,
   ref:"Review"
   }
  ],
   owner:{
    type:Schema.Types.ObjectId,
   ref:"User"
   }, 
  //   geometry: {
  // type: {
  //   type: String,
  //   enum: ["Point"], // Must be 'Point'
  //   required: true
  // },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
});


//   Delete middleware ( used to delete reviews in case listings is deleted )
listingSchema.post("findOneAndDelete" , async(listing) =>{
  if(listing){
      await Review.deleteMany({_id : {$in : listing.reviews}});

  }
  
})

const Listing=mongoose.model("Listing", listingSchema);
module.exports=Listing;