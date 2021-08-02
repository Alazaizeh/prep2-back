const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");

require("dotenv").config();

const PORT = process.env.PORT || 4002;
const server = express();

server.use(cors());
server.use(express.json());

mongoose.connect(
  "mongodb://books:booksDB01@cluster0-shard-00-00.uvjqt.mongodb.net:27017,cluster0-shard-00-01.uvjqt.mongodb.net:27017,cluster0-shard-00-02.uvjqt.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-h1qilz-shard-0&authSource=admin&retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

let drinkSchema = mongoose.Schema({
  strDrink: String,
  strDrinkThumb: String,
  idDrink: String,
});

let userSchema = mongoose.Schema({
  email: String,
  drinks: [drinkSchema],
});

const userModel = new mongoose.model("usersDrinks", userSchema);

let seed = () => {
  let omar = new userModel({
    email: "omx302@gmail.com",
    drinks: [
      {
        strDrink: "pepsi",
        strDrinkThumb: "https://m.media-amazon.com/images/I/515Lwr5CyxL.jpg",
        idDrink: "1",
      },
      {
        strDrink: "cola",
        strDrinkThumb:
          "https://images-na.ssl-images-amazon.com/images/I/61QKKsgtVqL.jpg",
        idDrink: "2",
      },
    ],
  });

  omar.save();
};

server.get("/", (req, res) => {
  res.send("Home Route");
});

server.get("/drinks", (req, res) => {
  axios
    .get(
      "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic"
    )
    .then((resultData) => {
      res.send(resultData.data.drinks);
    })
    .catch((error) => res.send(error));
});

server.get("/getToFav", (req, res) => {
  userModel.findOne({ email: req.query.email }, (error, result) => {
    if (error) {
      res.send("NOT FOUND");
    } else {
      res.send(result.drinks);
    }
  });
});

server.post("/addToFav", (req, res) => {
  userModel.findOne({ email: req.query.email }, (error, result) => {
    if (error) {
      res.status(404).send(error);
    } else {
      result.drinks.push(req.body);
      result.save();
      res.send(result.drinks);
    }
  });
});

server.delete("/removeFav/:index", (req, res) => {
  let index = Number(req.params.index);

  userModel.findOne({ email: req.query.email }, (error, result) => {
    if (error) {
      res.send(error);
    } else {
      result.drinks.splice(index, 1);
      result.save();
      res.send(result.drinks);
    }
  });
});

server.put("/updateFav/:index", (req, res) => {
  let index = Number(req.params.index);

  userModel.findOne({ email: req.query.email }, (error, result) => {
    if (error) {
      res.send(error);
    } else {
      result.drinks.splice(index, 1, req.body);
      result.save();
      res.send(result.drinks);
    }
  });
});

server.listen(PORT, () => console.log(`Live on ${PORT}`));
