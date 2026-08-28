const mongoose = require("mongoose");
const slugify = require("slugify");

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [120, "Product name cannot exceed 120 characters"],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: 2000,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    discountPrice: {
      type: Number,
      validate: {
        validator: function (val) {
          return val == null || val < this.price;
        },
        message: "Discount price must be less than the regular price",
      },
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    brand: { type: String, trim: true },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        alt: String,
      },
    ],
    stock: {
      type: Number,
      required: [true, "Stock quantity is required"],
      min: [0, "Stock cannot be negative"],
      default: 0,
    },
    sku: {
      type: String,
      unique: true,
      sparse: true,
    },
    attributes: {
      type: Map,
      of: String, // e.g. { size: "M", color: "Red" }
    },
    reviews: [reviewSchema],
    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsCount: {
      type: Number,
      default: 0,
    },
    soldCount: {
      type: Number,
      default: 0,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Indexes for performant querying/searching/filtering (part of the "20+ optimized APIs")
productSchema.index({ name: "text", description: "text", brand: "text" });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ ratingsAverage: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });

productSchema.virtual("inStock").get(function () {
  return this.stock > 0;
});

productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now().toString(36)}`;
  }
  next();
});

// Recalculate rating aggregates whenever reviews change
productSchema.methods.recalculateRatings = function () {
  if (this.reviews.length === 0) {
    this.ratingsAverage = 0;
    this.ratingsCount = 0;
    return;
  }
  const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
  this.ratingsAverage = total / this.reviews.length;
  this.ratingsCount = this.reviews.length;
};

module.exports = mongoose.model("Product", productSchema);
