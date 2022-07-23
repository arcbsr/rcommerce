const Product = require("../models/ProductModel.js");
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
  newBody = {
    avatar : imagesLinks,
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
  };
  if (req.body._id) {
    var conf = product.config.filter(
      (con) => con._id.toString() !== req.body._id
    );
    product.config = conf;
  }
  product.config.push(confige);
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

  newBody = {
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
  const resultPerPage = 12;
  //?page=1...
  const productsCount = await Product.countDocuments();
  const feature = new Features(Product.find()
    .select('name config avatar brand')
    , req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await feature.query;
  for (i = 0; i < products.length; i++) {
    if (products[i].avatar.length > 0) {
      products[i].imagethumb = products[i].avatar[0].url;
    }
  }
  res.status(200).json({
    success: true,
    products,
    productsCount,
    resultPerPage,
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