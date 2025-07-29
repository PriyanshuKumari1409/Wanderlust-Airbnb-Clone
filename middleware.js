
const Listing=require("./models/listing");
const Review=require("./models/review");

const ExpressError=require("./utils/ExpressError.js");
const {listingSchema,reviewSchema} =require("./schema.js");

// isLoggedIn middleware
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "You must be logged in to create Listings!");
    return res.redirect('/login');
  }
  next();
};

// saveRedirectUrl middleware
module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;

  }
  next();
};



module.exports.isOwner =(async(req, res, next)=>{
   const { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

  if (!listing.owner.equals(req.user._id)) {
    req.flash("error", "You don't have permission to edit this listing!");
    return res.redirect(`/listings/${id}`);
  }
next();
})


  // validate Schema (Server side using joi):
module.exports.validateListing=((req ,res,next)=>{
const { error } = listingSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
})


// validate Schema (Server side using joi):
module.exports.validateReview=((req ,res, next)=>{
  const { error } = reviewSchema.validate(req.body, { abortEarly: false });

  if (error) {
    const errMsg = error.details.map(el => el.message).join(", ");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
});



module.exports.isReviewAuthor =(async(req, res, next)=>{
   const { id, reviewId } = req.params;

    const listing = await Listing.findById(id);
  if (!listing) {
    throw new ExpressError(404, "Listing not found");
  }

    const review = await Review.findById(reviewId);
if (!review) {
    throw new ExpressError(404, "Review not found");
  }

  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You ae not the author of this Review!");
    return res.redirect(`/listings/${id}`);
  }
next();
});