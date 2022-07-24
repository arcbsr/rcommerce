const Category = require("../models/CategoryModel.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

exports.createCategory = catchAsyncErrors(async (req, res, next) => {

    const category = await Category.create(req.body);
    res.status(200).json({
        success: true,
        category,
    });
});

exports.updateCategory = catchAsyncErrors(async (req, res, next) => {
    let category = await Category.findById(req.params.id);
    if (!category) {
        return next(new ErrorHandler("Category is not found with this id", 404));
    }
    data = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        upsert: true,
    });
    res.status(200).json({
        success: true,
        data,
    });


});
exports.getAllCategory = catchAsyncErrors(async (req, res) => {
    const categories = await Category.find();

    res.status(200).json({
        success: true,
        categories
    });
});
exports.SubCatByID = catchAsyncErrors(async (req, res, next) => {
    const categories = await Category.findById(req.params.id);
    res.status(200).json({
        success: true,
        categories
    });
});
exports.addSubCat = catchAsyncErrors(async (req, res, next) => {
    if (!req.body || !req.body.name) {
        return next(new ErrorHandler("Empty Subcategory name", 500));
    }
    const category = await Category.findById(req.params.id);

    if (!category) {
        return next(new ErrorHandler("Category is not found with this id", 404));
    }
    const subcat = {
        name: req.body.name,
        _id: req.body._id,
    };
    if (req.body._id) {
        var sub = category.subcategory.filter(
            (sub) => sub._id.toString() == req.body._id
        );
        if (sub.length > 0) {
            for (i = 0; i < sub.length; i++) {
                for (j = 0; j < category.subcategory.length; j++) {
                    if (category.subcategory[j]._id === sub[i]._id) {
                        category.subcategory[j].name = req.body.name;
                    }
                }
            }
        }else {
            category.subcategory.push(subcat);
        }
    } else {
        category.subcategory.push(subcat);
    }
    data = await category.save({ validateBeforeSave: false });


    res.status(201).json({
        success: true,
        data,
    });
});