const Product = require("../models/ProductModel.js");
const Category = require("../models/CategoryModel.js");
const ErrorHandler = require("../utils/ErrorHandler.js");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const Features = require("../utils/Features");
const cloudinary = require("cloudinary");
var categoryPopulateModule =
{
  path: 'subcat',
  select: 'name',
  populate: {

    path: 'category',
    select: 'name'

  }
}
var userPopulateModule =
{
  path: 'user',
  select: 'name'
}
// create Product --Admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {


  var newBody = {
    ...req.body
  }
  const imagesLinks = [];
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
  if (!req.body.subcategory) {
    return next(new ErrorHandler("subcategory is not found", 404));
  }
  req.body.subcat = req.body.subcategory;
  newBody = {
    tags: tags,
    avatar: imagesLinks,
    ...req.body
  }
  const product = await Product.create(newBody);
  res.status(200).json({
    success: true,
    product,
  });
});
exports.createProductItem = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  var data;
  req.body.user = req.user.id;
  const item = {
    name: req.body.name,
    price: req.body.price,
    stock: req.body.stock,
    offer: req.body.offer,
    _id: req.body._id,
    user: req.body.user
  };
  if (req.body._id) {
    var conf = product.items.filter(
      (con) => con._id.toString() == req.body._id
    );
    //product.config = conf;
    if (conf.length > 0) {
      for (i = 0; i < conf.length; i++) {
        for (j = 0; j < product.items.length; j++) {
          if (product.items[j]._id === conf[i]._id) {
            product.items[j] = item;
          }
        }
      }
    } else {
      product.items.push(req.body);
    }
  } else {
    product.items.push(req.body);
  }
  var minPrice = Number.MAX_SAFE_INTEGER, maxPrice = 0;
  for (i = 0; i < product.items.length; i++) {
    if (product.items[i].price < minPrice) {
      minPrice = product.items[i].price;
    }
    if (product.items[i].price > maxPrice) {
      maxPrice = product.items[i].price;
    }
  }
  product.minprice = minPrice;
  product.maxprice = maxPrice;
  data = await product.save({ validateBeforeSave: false });


  res.status(201).json({
    success: true,
    product,
  });
});

exports.productUpd = catchAsyncErrors(async (req, res, next) => {

  let product = await Product.findById(req.params.id);
  if (!product) {
    return next(new ErrorHandler("Product is not found with this id", 404));
  }
  let images = [];
  var tags = "";
  // if (!req.body.subcategory) {
  //   return next(new ErrorHandler("subcategory is not found", 404));
  // }
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
      if (result) {
        imagesLinks.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    }
    newBody.images = imagesLinks;
  }
  const avatarlink = [];
  if (req.files && req.files.avatar) {
    if (product.avatar.length > 0) {
      const result = await cloudinary.v2.uploader.destroy(
        product.avatar[0].public_id
      );
    }
    const result = await cloudinary.v2.uploader.upload(req.files.avatar.tempFilePath, {
      folder: "products/thumb",
    });
    if (result) {
      avatarlink.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
      newBody.avatar = avatarlink;
    }
  }
  // newBody = {
  //   avatar: avatarlink,
  //   images: imagesLinks,
  //   ...req.body
  // }
  data = await Product.findByIdAndUpdate(req.params.id, newBody, {
    new: true,
    upsert: true,
  })
  .populate(categoryPopulateModule).populate(userPopulateModule);
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
  const searchfrom = ["tags", "description", "name", "items.name"];
  for (i = 0; i < keys.length; i++) {
    srcqry.$or.push({ tags: { $regex: '.*' + keys[i] + '.*', $options: "i" } });
    //srcqry.$or.push({ description: { $regex: '.*' + keys[i] + '.*', $options: "i" } });
    srcqry.$or.push({ name: { $regex: '.*' + keys[i] + '.*', $options: "i" } });
    srcqry.$or.push({ "items.name": { $regex: '.*' + keys[i] + '.*', $options: "i" } });
    srcqry.$or.push({ brand: { $regex: '.*' + keys[i] + '.*', $options: "i" } });


  }
  if (req.query.brand) {
    srcqry.$and.push({ brand: { '$regex': req.query.brand, $options: 'i' } });
  }
  if (req.query.subcat) {
    // srcqry.$and.push({ subcategory: { $regex: req.query.subcat, $options: "i" } });
    srcqry.$and.push({ subcat: req.query.subcat });
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
  const products = await Product.find(srcqry)
    .populate(categoryPopulateModule).populate(userPopulateModule)
    .skip(currentPage * limit).limit(limit);
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
  const product = await Product.findById(req.params.id)
  .populate(categoryPopulateModule).populate(userPopulateModule);
  //.populate("subcat");
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
