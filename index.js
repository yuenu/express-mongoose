const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
require("dotenv").config();

const Product = require("./models/product");
const Farm = require("./models/farm");
const { format } = require("path");

// Connect to
const uri = process.env.dbUrl2;
mongoose
  .connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("CONNECTION OPEN!!!");
  })
  .catch((err) => {
    console.log("OH NO ERROR!!!");
    console.log(err);
  });

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const categories = ["fruit", "vegetable", "dairy"];

// FARM ROUTES
app.get("/farms", async (req, res) => {
  const farms = await Farm.find({});
  res.render("farms/index", { farms });
});

app.get("/farms/new", (req, res) => {
  res.render("farms/new");
});

app.post("/farms", async (req, res) => {
  const farm = new Farm(req.body);
  await farm.save();
  res.redirect("/farms");
});

app.get("/farms/:id", async (req, res) => {
  const farm = await Farm.findById(req.params.id).populate("products");
  res.render("farms/show", { farm });
});

app.delete("/farms/:id", async (req, res) => {
  const farm = await Farm.findByIdAndDelete(req.params.id);
  res.redirect("/farms");
});

app.get("/farms/:id/products/new", async (req, res) => {
  const { id } = req.params;
  const farm = await Farm.findById(id);
  res.render("products/new", { categories, farm });
});

app.post("/farms/:id/products", async (req, res) => {
  const farm = await Farm.findById(req.params.id);
  const { name, price, category } = req.body;
  const product = new Product({ name, price, category });
  farm.products.push(product);
  product.farm = farm;
  await farm.save();
  await product.save();
  res.redirect(`/farms/${farm._id}`);
});

// PRODUCT ROUTES
app.get("/products", async (req, res) => {
  const { category } = req.query;
  let products;
  if (category) {
    products = await Product.find({ category });
  } else {
    products = await Product.find({});
  }
  res.render("products/index", { products });
});

app.get("/products/new", (req, res) => {
  res.render("products/new", { categories });
});

app.get("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id).populate("farm", "name");
  res.render("products/show", { product });
});

app.post("/products", async (req, res) => {
  const newProduct = new Product(req.body);
  await newProduct.save();
  res.redirect(`/products/${newProduct._id}`);
});

app.get("/products/:id/edit", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  res.render("products/edit", { product, categories });
});

app.put("/products/:id", async (req, res) => {
  const { id } = req.params;
  const product = await Product.findByIdAndUpdate(id, req.body, {
    runValidators: true,
    new: true,
  });
  res.redirect(`/products/${[product._id]}`);
});

app.delete("/products/:id", async (req, res) => {
  const { id } = req.params;
  const deletedProduct = await Product.findByIdAndDelete(id);
  res.redirect("/products");
});

app.listen(3000, () => {
  console.log("APP IS LISTENING ON http://localhost:3000/");
});
