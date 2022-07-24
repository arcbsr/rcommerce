const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter a name of a Category"],
        trim: true,
        maxLength:[20, "Category name not exceed than 20 characters"]
    },
    subcategory:[
        {
            name:{
                type: String,
                required: true,
            }

        }
    ],
    createAt:{
        type:Date,
        default: Date.now()
    }


})
categorySchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.__v;
    delete obj.createAt;
    return obj;
   }
module.exports = mongoose.model("Category", categorySchema);