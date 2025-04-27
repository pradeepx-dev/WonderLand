const express = require('express')
const app = express()
const mongoose = require('mongoose')
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const path = require('path'); 
const session = require("express-session")
const flash = require("connect-flash")
const Listing = require("./models/listing.js");
const Review = require('./models/review.js')
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user.js");
const user = require('./models/user.js');
const port = 8080

// const listing = require("./routes/listing.js")
// const reviews = require("./routes/review.js")

main()
.then(()=>{console.log("connection successfull")})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wonderland');
}

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionOption = {
  secret:"mysupersecretcode",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 1000*60*60*24*7,
    maxAge: 1000*60*60*24*7,
    httpOnly: true
  }
}

app.get('/', (req, res) => {
  res.redirect("/listings")
})

app.use(session(sessionOption))
app.use(flash())

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success= req.flash("success")
  // res.locals.success= req.flash("error")
  next();
})

// app.get("/demouser", async(req, res)=>{
//   let fakeUser = new User({
//     email: "student@gmail.com",
//     username: "pradeepx"
//   })
//   let registerUser = await User.register(fakeUser, "hell")
//   res.send(registerUser)
// })
// ----------------auth Start-----------------
app.get("/signup", (req,res)=>{
  res.render("users/signup.ejs")
})

app.post("/signup", async (req, res, next) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });

    let registerUser = await User.register(newUser, password);
    req.flash("success", "Welcome to Wonderland!");
    res.redirect("/listings");
  } catch (error) {
    next(error);  // Pass error to error-handling middleware
    res.redirect("/signup")
  }
});


app.get("/login", (req,res)=>{
  res.render("users/login.ejs")
})

app.post("/login", passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), 
async(req, res) => {
  req.flash("success", "Welcome back to Wonderland!");
  res.redirect("/listings");
});

// ----------------auth end-----------------


//Index Route
app.get("/listings", async(req, res)=>{
  let allListings = await Listing.find({})
  res.render("./listings/index.ejs", {allListings})
})

//Show Route
app.get("/listings/:id", async(req, res)=>{
let {id} = req.params
let listing = await Listing.findById(id).populate("review");
// if(!listing){
//   req.flash("error", "Listing that you requested for does not exist!");
//   res.redirect("/listings")
// }
res.render("./listings/show.ejs", {listing})
})

//create Route
app.get("/listing/new", (req, res)=>{
res.render("./listings/new.ejs")
})

app.post("/listing/new", async(req, res)=>{
try{
  let newListing = new Listing(req.body.listing)
  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings")
} catch (error) {
  next(error)
}
})

//Edit route
app.get("/listings/:id/edit", async(req, res)=>{
let {id} = req.params
let listing =  await Listing.findById(id)
res.render("./listings/edit.ejs",{listing})
})
app.put("/listings/:id", async(req, res)=>{
let {id} = req.params
await Listing.findByIdAndUpdate(id, {...req.body.listing})
req.flash("success", "Listing Updated!");
res.redirect("/listings")
})

//Delete Route
app.delete("/listings/:id", async(req, res)=>{
let {id} = req.params
let deleteListing =  await Listing.findByIdAndDelete(id)
req.flash("success", "Listing Deleted!");
console.log(deleteListing)
res.redirect("/listings")
})

//Reviews Route
app.post("/listings/:id/reviews", async(req, res)=>{
  let listing = await Listing.findById(req.params.id)
  let newReview = new Review(req.body.review)
  listing.review.push(newReview)
   await newReview.save()
   await listing.save()
   req.flash("success", "Review Added");
    res.redirect(`/listings/${listing._id}`)
})



// app.use("/listings/:id/reviews", reviews);
// app.use("/listings", listing)

app.get("*", (req, res)=>{
  res.redirect("/listings")
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})