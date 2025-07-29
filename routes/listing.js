const express= require("express");
const router= express.Router();
const Listing= require("../models/listing.js");
const wrapAsync=require("../utils/wrapAsync.js");
const{isLoggedIn, isOwner,validateListing,validateReview}= require("../middleware.js");





// Index Route:
router.get('/', wrapAsync(async(req ,res) =>{
   const allListings=await Listing.find({});
   res. render("listings/index.ejs" ,{allListings});
  }));



   //  New Route:
  router.get('/new', isLoggedIn, (req ,res) =>{
   
    res.render("listings/new.ejs")
  });



// Show Route:
router.get('/:id', wrapAsync(async(req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: { path: "author" }
        })
        .populate("owner");

    if (!listing) {
        req.flash("error", "The listing you requested does not exist!");
        return res.redirect('/listings');
    }

//     // ✅ Check if geometry is correctly defined
//     if (!listing.geometry || !listing.geometry.coordinates || listing.geometry.coordinates.length !== 2) {
//         console.log("⚠️ Geometry not properly defined for this listing.");
//         console.log(listing.geometry); // helpful for debugging
//     }

    res.render('listings/show.ejs', { listing });
}));





// Create Route:
router.post('/', isLoggedIn, validateListing,
  wrapAsync(async (req, res, next) => {
    const newListings = new Listing(req.body.listing);
    newListings.owner = req.user._id;

   
    await newListings.save();
    req.flash("success", "New Listings Created!");
    res.redirect('/listings');
  })
);



// Edit Route:
router.get('/:id/edit', isLoggedIn,isOwner,wrapAsync(async(req, res) => {
   let { id } = req.params;
   const listing = await Listing.findById(id);
   if (!listing) {
       throw new ExpressError(404, "Listing not found");
   }
   res.render('listings/edit.ejs', { listing });
}));


//  update Route:
router.put('/:id', isLoggedIn,isOwner, validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  const updatedListing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });
  req.flash("success", "Listing updated!");
  res.redirect(`/listings/${updatedListing._id}`);
}));


// DELETE Route:
router.delete('/:id',isLoggedIn, isOwner,wrapAsync(async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
    req.flash("success" ,"Listings Deleted ");
  res.redirect("/listings"); 
}));


module.exports= router;




// Passport is Express-compatible authentication middleware for Node.js.