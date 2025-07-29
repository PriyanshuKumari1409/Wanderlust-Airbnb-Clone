
const express= require("express");
const router= express.Router({mergeParams :true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const Review= require("../models/review.js");
const Listing= require("../models/listing.js");
const {validateReview,isLoggedIn, isReviewAuthor}=require("../middleware.js")



// Reviews:
// POST Route:

router.post('/' ,isLoggedIn, validateReview, wrapAsync(async(req ,res) =>{
  let listing =await Listing.findById(req.params.id); 
  let newReview = new Review(req.body.review);
  newReview.author=req.user._id;

  listing.reviews.push(newReview);

  await newReview.save();             // if we want anything to get saved in DB then we have to call .save() function ,which is asynchronous and need to await.
  await listing.save();
    req.flash("success" ,"New Review Added! ");
  res.redirect(`/listings/${listing._id}`);
}));




//Delete Review Route:
router.delete('/:reviewId',isLoggedIn,isReviewAuthor ,wrapAsync(async(req ,res)=>{
  let {id,reviewId}=req.params;

  await Listing.findByIdAndUpdate(id ,{$pull: {reviews:  reviewId}});

  await Review.findByIdAndDelete(reviewId);
    req.flash("success" ,"Review Deleted! ");
  res.redirect(`/listings/${id}`);
}))


module.exports=router;



/* Cookies:


   const express = require('express');
   const cookieParser = require('cookie-parser');
   const app = express();
   app.use(cookieParser('your-secret-key')); // Replace with your actual secret key


  // Setting Signed Cookies: To set a signed cookie, use the res.cookie() method with the signed option set to true. 

     app.get('/set-signed-cookie', (req, res) => {
     res.cookie('signed_example', 'some_value', { signed: true });
     res.send('Signed cookie set');
   });


   // 1.  Accessing Signed Cookies: Signed cookies are accessed through the req.signedCookies object. 


      app.get('/get-signed-cookie', (req, res) => {
     console.log(req.signedCookies); // Output: { signed_example: 'some_value' }
     res.send('Signed cookie accessed');
   });
*/