const Category = require("../models/CategoryModel.js");
const SubCategory = require("../models/SubCategoryModel.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

var subCategoryPopulateModule =
{
    path: 'category',
    select: 'name'
}

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
exports.getSubCategoryByid = catchAsyncErrors(async (req, res) => {
    var subCategories = [];
    subCategories = await SubCategory.find({ category: req.params.id }).populate(subCategoryPopulateModule);

    res.status(200).json({
        success: true,
        subCategories
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
    req.body.category = req.params.id;
    if (req.body._id) {
        let subcatDb = await SubCategory.findById(req.body._id);
        if (!subcatDb) {
            return next(new ErrorHandler("SubCategory is not found with this id", 404));
        }
        const subCategory = await SubCategory.findByIdAndUpdate(req.body._id, req.body, {
            new: true,
            upsert: true,
        });

        res.status(200).json({
            success: true,
            subCategory,
        });
    } else {
        const subcat = await SubCategory.create(req.body);
        res.status(200).json({
            success: true,
            subcat,
        });
    }
});