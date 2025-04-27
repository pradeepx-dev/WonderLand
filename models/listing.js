const mongoose = require("mongoose");
const schema = mongoose.Schema;
const reviewSchema = require("./review")
const review = require("./review.js")

const listingSchema = new schema({
    title:{
        type: String,
        require: true
    },
    description: String,
    image:{
        type: String,
        default: "https://unsplash.com/photos/brown-and-white-wooden-house-near-green-trees-during-daytime-2gDwlIim3Uw",
        Set: (v)=>v===""? "https://unsplash.com/photos/brown-and-white-wooden-house-near-green-trees-during-daytime-2gDwlIim3Uw" : v
    },
    price: Number,
    location: String,
    country: String,
    review:[
        {
            type: schema.Types.ObjectId,
            ref: "Review"
        },
    ]
})

listingSchema.post("findOneAndDelete", async(listing)=>{
    if(listing){
        await review.deleteMany({_id: {$in: listing.review}})
    }
})

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;