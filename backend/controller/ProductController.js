const Product = require("../models/ProductModel.js");
const Category = require("../models/CategoryModel.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Features = require("../utils/Features");
const cloudinary = require("cloudinary");

// create Product --Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

  const imagesLinks = [];

  var newBody = {
    ...req.body
  }
  if (req.files && req.files.avatar) {
    const result = await cloudinary.v2.uploader.upload(req.files.avatar.tempFilePath, {
      folder: "products/thumb",
    });
    imagesLinks.push({
      public_id: result.public_id,
      url: result.secure_url,
    });
  }
  req.body.user = req.user.id;
  var tags = "";
  const category = await Category.findById(req.body.category);
  if (category) {
    var sub = category.subcategory.filter(
      (sub) => sub._id.toString() == req.body.subcategory
    );
    tags = category.name;
    if (sub.length > 0) {
      tags = tags + " " + sub[0].name;
    }
  }
  newBody = {
    tags: tags,
    avatar: imagesLinks,
    ...req.body
  }
  //req.body.avatar = imagesLinks;
  const product = await Product.create(newBody);
  res.status(200).json({
    success: true,
    product,
  });
});
exports.createProductConfig = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  var data;
  const confige = {
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock,
    offer: req.body.offer,
    _id: req.body._id,
    user: req.user.id
  };
  if (req.body._id) {
    var conf = product.config.filter(
      (con) => con._id.toString() == req.body._id
    );
    //product.config = conf;
    if (conf.length > 0) {
      for (i = 0; i < conf.length; i++) {
        for (j = 0; j < product.config.length; j++) {
          if (product.config[j]._id === conf[i]._id) {
            product.config[j] = confige;
          }
        }
      }
    } else {
      product.config.push(confige);
    }
  } else {
    product.config.push(confige);
  }
  var minPrice = Number.MAX_SAFE_INTEGER, maxPrice = 0;
  for (i = 0; i < product.config.length; i++) {
    if (product.config[i].price < minPrice) {
      minPrice = product.config[i].price;
    }
    if (product.config[i].price > maxPrice) {
      maxPrice = product.config[i].price;
    }
  }
  product.minprice = minPrice;
  product.maxprice = maxPrice;
  data = await product.save({ validateBeforeSave: false });


  res.status(201).json({
    success: true,
    data,
  });
});

exports.productUpd = catchAsyncErrors(async (req, res, next) => {

  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product is not found with this id", 404));
  }
  let images = [];
  var tags = "";
  const category = await Category.findById(product.category);
  if (category) {
    var sub = category.subcategory.filter(
      (sub) => sub._id.toString() == product.subcategory
    );
    tags = category.name;
    if (sub.length > 0) {
      tags = tags + " " + sub[0].name;
    }
  }
  var newBody = {
    tags: tags,
    ...req.body
  }
  if (req.files && req.files.images) {
    images = req.files.images;
  }
  const imagesLinks = [];
  if (images.length > 0) {
    for (i = 0; i < product.images.length; i++) {
      imagesLinks.push(product.images[i]);
    }
    for (let i = 0; i < images.length; i++) {
      const result = await cloudinary.v2.uploader.upload(images[i].tempFilePath, {
        folder: "products/preview",
      });
      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }
    newBody = {
      images: imagesLinks,
      ...req.body
    }
  }

  data = await Product.findByIdAndUpdate(req.params.id, newBody, {
    new: true,
    upsert: true,
  });
  res.status(200).json({
    success: true,
    data,
  });
});

// Get All Product (Admin)
exports.getAdminProducts = catchAsyncErrors(async (req, res, next) => {
  const products = await Product.find();

  res.status(200).json({
    success: true,
    products,
  });
});

// get All Products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  
  var strData = req.query.str || "";
  //var brand = req.query.brand || "";
  const keys = strData.split(" ");
  var srcqry = {
    $or: [
      // { tags: { $regex: '.*' + strData + '.*' } },
      // { description: { $regex: '.*' + strData + '.*' } },
      // { name: { $regex: '.*' + strData + '.*' } },
      // { "config.name": { $regex: '.*' + strData + '.*' } }
    ], $and: [

    ]
  };
  const searchfrom = ["tags", "description", "name", "config.name"];
  for (i = 0; i < keys.length; i++) {
    srcqry.$or.push({ tags: { $regex: '.*' + keys[i] + '.*', $options: "i" } });
    srcqry.$or.push({ description: { $regex: '.*' + keys[i] + '.*', $options: "i" } });
    srcqry.$or.push({ name: { $regex: '.*' + keys[i] + '.*', $options: "i" } });
    srcqry.$or.push({ "config.name": { $regex: '.*' + keys[i] + '.*', $options: "i" } });
    srcqry.$or.push({ brand: { $regex: '.*' + keys[i] + '.*', $options: "i" } });


  }
  if (req.query.brand) {
    srcqry.$and.push({ brand: { $regex: req.query.brand, $options: "i" } });
  }
  if (req.query.subcat) {
    srcqry.$and.push({ subcategory: { $regex: req.query.subcat, $options: "i" } });
  }
  if (req.query.category) {
    srcqry.$and.push({ category: { $regex: req.query.category, $options: "i" } });
  }
  if (req.query.pricemin) {
    srcqry.$and.push({ maxprice: { $gte: req.query.pricemin } });
  }
  if (req.query.pricemax) {
    srcqry.$and.push({ maxprice: { $lte: req.query.pricemax } });
  }

  if (srcqry.$and.length == 0) {
    srcqry.$and.push({});
  }

  if (srcqry.$or.length == 0) {
    srcqry.$or.push({});
  }
  const total = await Product.countDocuments(srcqry);

  //var start = parseInt(req.query.start || 0, 10);
  var limit = parseInt(req.query.n || total, 10);
  var currentPage = parseInt(req.query.page || 0, 10);
  const products = await Product.find(srcqry).skip(currentPage * limit).limit(limit);
  var totalPage = parseInt(Math.ceil(total / limit), 10) || 0;
  var isNextPage = (currentPage + 1) >= totalPage ? false : true;


  res.status(200).json({
    success: true,
    total,
    totalPage,
    currentPage, limit, nextpage: isNextPage,
    products,
    size: products.length,
  });
});

// Update Product ---Admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product is not found with this id", 404));
  }
  product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
    useUnified: false,
  });
  res.status(200).json({
    success: true,
    product,
  });
});

// delete Product
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new ErrorHandler("Product is not found with this id", 404));
  }

  // Deleting images from cloudinary
  for (let i = 0; i < product.images.length; i++) {
    if (product.images[i].public_id) {
      const result = await cloudinary.v2.uploader.destroy(
        product.images[i].public_id
      );
    }
  }
  await cloudinary.v2.uploader.dele
  for (let i = 0; i < product.avatar.length; i++) {
    if (product.avatar[i].public_id) {
      const result = await cloudinary.v2.uploader.destroy(
        product.avatar[i].public_id
      );
    }
  }
  await product.remove();

  res.status(200).json({
    success: true,
    message: "Product deleted succesfully",
  });
});

// single Product details
exports.getSingleProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product is not found with this id", 404));
  }
  res.status(200).json({
    success: true,
    product,
  });
});

// Create New Review or Update the review
exports.createProductReview = catchAsyncErrors(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev) => rev.user.toString() === req.user._id.toString()
  );

  if (isReviewed) {
    product.reviews.forEach((rev) => {
      if (rev.user.toString() === req.user._id.toString())
        (rev.rating = rating), (rev.comment = comment);
    });
  } else {
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  let avg = 0;

  product.reviews.forEach((rev) => {
    avg += rev.rating;
  });

  product.ratings = avg / product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
  });
});

// Get All reviews of a single product
exports.getSingleProductReviews = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  if (!product) {
    return next(new ErrorHandler("Product is not found with this id", 404));
  }

  res.status(200).json({
    success: true,
    reviews: product.reviews,
  });
});

// Delete Review --Admin
exports.deleteReview = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  if (!product) {
    return next(new ErrorHandler("Product not found with this id", 404));
  }

  const reviews = product.reviews.filter(
    (rev) => rev._id.toString() !== req.query.id.toString()
  );

  let avg = 0;

  reviews.forEach((rev) => {
    avg += rev.rating;
  });

  let ratings = 0;

  if (reviews.length === 0) {
    ratings = 0;
  } else {
    ratings = avg / reviews.length;
  }

  const numOfReviews = reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
});

// 