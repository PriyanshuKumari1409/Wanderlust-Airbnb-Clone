
const express= require("express");
const app= express();
const mongoose=require("mongoose");
const path=require("path");
const methodOverride = require('method-override');
app.use(methodOverride('_method'));
const ejsMate=require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const flash= require("connect-flash");
const User=require("./models/user.js");
const passport= require("passport");
const LocalStrategy=require("passport-local");




const listingsRouter =require("./routes/listing.js");
const reviewsRouter =require("./routes/review.js");
const { request } = require("http");
const userRouter=require("./routes/user.js");



app.set("views" ,path.join(__dirname,"views"));
app.set("view engine" ,"ejs");
app.use(express.urlencoded({extended:true}));
app.engine("ejs" ,ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.json());


let port=8080;

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


const sessionOptions = {
  secret: "mysupersecretcode",
  resave: false,
  saveUninitialized: true, 
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly:true,
  },
};




// Session & Flash:
app.use(session(sessionOptions));
app.use(flash());


//  Passport: in  MongoDB PBKDF2  hashing algorithm is used.
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy( User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  if (!req.isAuthenticated() && req.method === "GET" && req.originalUrl !== "/login") {
    req.session.returnTo = req.originalUrl;
  }
  next();
});


// Middleware to initialised Flash :
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;

  next();
});


// app.get('/demouser' ,async(req ,res)=>{
//   let fakeUser= new User({
//     email:"student@gmail.com",
//     username:"delta-student"
//   })
//    let registerUser= await User.register(fakeUser,"helloworld");
//    res.send(registerUser);
// })

app.use('/', userRouter);

// Basic api:
app.get('/' ,(req, res)=>{
    res.redirect("/listings");
});

app.use('/listings', listingsRouter);
app.use('/listings/:id/reviews', reviewsRouter);





// app.get('/testlisting' , async(req, res)=>{
//   let sampleListing=new Listing({
//     title:" my new appartment",
//     description: "this is my Appartment",
//     price:100000,
//     image: "https://wallpaperaccess.com/full/4722322.jpg",
//     location:"delhi",
//     country: "India"
//   });
  
//   try {
//     const result = await sampleListing.save();
//     console.log("✅ Saved Listing:", result);
//     res.send("Successfully testing");
//   } catch (err) {
//     console.error("❌ Error saving listiWng:", err);
//     res.status(500).send("Failed to save");
//   }
// });


//  Route for All the ROute when no above route matches:
// your 404 handler:

// app.all('*',(req ,res, next) => {
//   next(new ExpressError(404, "Page not Found!"));
// });


//error-handling middleware:
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong!";
res.status(statusCode).render("error", { message: err.message });
});

app.listen(port,() =>{
  console.log(`Server is listening at ${port}`)
});