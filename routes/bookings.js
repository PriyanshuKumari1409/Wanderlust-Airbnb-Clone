
const express = require("express");
const router = express.Router({ mergeParams: true });

const Booking = require("../models/bookings");
const Listing = require("../models/listing");
const { isLoggedIn } = require("../middleware");

// Show booking form
router.get("/new", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  res.render("bookings/new", { listing });
});

// Create booking
router.post("/", isLoggedIn, async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests } = req.body;

  const listing = await Listing.findById(id);

  const days =
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24);

  const totalPrice = days * listing.price;

  // Basic double-booking prevention
  const existing = await Booking.find({
    listing: id,
    $or: [
      { checkIn: { $lt: checkOut, $gte: checkIn } },
      { checkOut: { $gt: checkIn, $lte: checkOut } },
    ],
  });

  if (existing.length > 0) {
    req.flash("error", "These dates are already booked!");
    return res.redirect(`/listings/${id}`);
  }

  await Booking.create({
    listing: id,
    user: req.user._id,
    checkIn,
    checkOut,
    guests,
    totalPrice,
  });

  req.flash("success", "Booking confirmed!");
  res.redirect(`/bookings/my`);
});

// Show user's bookings
router.get("/my", isLoggedIn, async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id }).populate("listing");
  res.render("bookings/my", { bookings });
});

module.exports = router;
