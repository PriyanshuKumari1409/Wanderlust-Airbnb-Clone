// Load env FIRST
require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const bookingRouter = require("./routes/bookings.js");

// ---------------- APP SETUP ----------------
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(methodOverride("_method"));

// ---------------- DATABASE ----------------
const MONGO_URL = process.env.MONGO_URL;

async function main() {
  try {
    await mongoose.connect(MONGO_URL, {
      dbName: "Wanderlust", // 🔥 FORCE correct DB
    });

    console.log("✅ Connected to MongoDB");
    console.log("🔥 DB NAME:", mongoose.connection.name);

  } catch (err) {
    console.log("❌ DB Connection Error:", err);
  }
}
main();

// ---------------- SESSION ----------------
const sessionOptions = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

// ---------------- PASSPORT ----------------
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Save last visited URL
app.use((req, res, next) => {
  if (!req.isAuthenticated() && req.method === "GET" && req.originalUrl !== "/login") {
    req.session.returnTo = req.originalUrl;
  }
  next();
});

// Global middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// ---------------- ROUTES ----------------
app.use("/", userRouter);

app.get("/", (req, res) => {
  res.redirect("/listings");
});

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);

// booking
app.use("/listings/:id/book", bookingRouter);
app.use("/bookings", bookingRouter);

// ---------------- ERROR ----------------
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error", { message: err.message });
});

// ---------------- SERVER ----------------
const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});