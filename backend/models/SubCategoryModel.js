const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, "Please enter a name of a subCategorySchema"],
        trim: true,
        maxLength:[20, "subCategorySchema name not exceed than 20 characters"]
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "Category",
        required: true
    },
    createAt:{
        type:Date,
        default: Date.now()
    }


})
subCategorySchema.methods.toJSON = function() {
    var obj = this.toObject();
    delete obj.__v;
    delete obj.createAt;
    return obj;
   }
module.exports = mongoose.model("SubCategory", subCategorySchema);