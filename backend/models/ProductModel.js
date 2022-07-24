const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please enter a name of a product"],
        trim: true,
        maxLength: [30, "Product name not exceed than 30 characters"]
    },
    description: {
        type: String,
        required: [true, "Please add a description of your product"],
        maxlength: [4000, "Description is can not exceed than 4000 characters"]
    }, category: {
        type: String,
        required: [true, "Please add a category of your product"],
        maxlength: [400, "category is can not exceed than 400 characters"]
    }, subcategory: {
        type: String,
        required: [true, "Please add a subcategory of your product"],
        maxlength: [400, "subcategory is can not exceed than 400 characters"]
    }, tags: {
        type: String,
        required: [false, "Please add a tags of your product"],
        maxlength: [400, "tags is can not exceed than 400 characters"]
    }, config: [
        {
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            stock: {
                type: Number,
                required: true,
            }, offer: {
                type: String,
                maxLength: [400, "Discount price can not exceed than 4 characters"],
            },
            time: {
                type: Date,
                default: Date.now()
            }, user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true
            }
        },

    ],
    minprice: {
        type: Number,
        expires: "1m"
    },
    maxprice: {
        type: Number,
    },
    color: {
        type: String,
    }, imagethumb: {
        type: String,
    }, brand: {
        type: String,
    },
    size: {
        type: String,
    },
    ratings: {
        type: Number,
        default: 0,
    },
    avatar: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }
    ],
    images: [
        {
            public_id: {
                type: String,
                required: true,
            },
            url: {
                type: String,
                required: true,
            },
        }
    ],
    // category:{
    //     type: String,
    //     required:[true,"Please add a category of your product"],
    // },
    // Stock:{
    //     type: Number,
    //     required:[true,"Please add some stoke for your product"],
    //     maxLength: [3, "Stock can not exceed than 3 characters"],
    // },
    numOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "User",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            rating: {
                type: Number,
                required: true,
            },
            comment: {
                type: String,
            },
            time: {
                type: Date,
                default: Date.now()
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now()
    }
})
//hide fields
productSchema.methods.toJSON = function () {
    var obj = this.toObject();
    delete obj.__v;
    delete obj.reviews;
    return obj;
}
module.exports = mongoose.model("Product", productSchema);