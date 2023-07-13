const express = require("express");
const axios = require("axios");
const app = express();
require('dotenv').config();
app.use(express.json());
const port = process.env.PORT;  

var config = {
  method: "post",
  url: `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${process.env.API_KEY}`,
  headers: {
    "Content-Type": "application/json",
  },
};

app.post("/", async (req, res) => {
  const {
    productName,
    productDescription,
    productPrice,
    categoryName,
    productOptions,
  } = req.body;

  const numReviews = getRandomNumber(1, 8);
  const reviews = [];
  let ratingsAvg = 0;

  for (let i = 0; i < numReviews; i++) {
    try {
      const data = generatePrompt(
        productName,
        productDescription,
        productPrice,
        categoryName,
        productOptions
      );
      config.data = data;

      const response = await axios(config);
      const { output, safetyRatings } = response.data.candidates[0];
      const [title, description] = output.split("\n\n");

      let finalDescription = description ? description : '';
      let finalTitle = title ? title : '';
      if (finalDescription.trim() === '') {
        const [newTitle, newDescription] = output.split("\n");
        finalDescription = newDescription ? newDescription : '';
        finalTitle = newTitle
      }

      const ratings = calculateRatings();
      ratingsAvg += ratings;
      const review = {
        name: getRandomName(),
        title: finalTitle?.replace("Title: ", ""),
        description: finalDescription?.replace("Description: ", ""),
        ratings: ratings,
      };
      reviews.push(review);
    } catch (error) {
      console.log(error);
      res.send(error);
    }
  }
  ratingsAvg /= numReviews
  console.log("Number of reviews generated: " + numReviews);
  console.log("Average Ratings: " + ratingsAvg);
  res.send(reviews);
});


function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function calculateRatings() {
  let ratings = getRandomNumber(1, 5);
  return ratings;
}

function generatePrompt(
  productName,
  productDescription,
  productPrice,
  categoryName,
  productOptions
) {
  let promptText = `Generate a product review of ${productName} in the ${categoryName} category with a price of ${productPrice}. ${productDescription}. Write with incorrect grammar, using 5-30 worded sentences, and begin description with first person.`;

  const randomOption = getRandomNumber(0, productOptions.length - 1);
  promptText += `${randomOption.optionName} is ${randomOption.optionVariationValue}.`;
  promptText +=
    "Output into two separate lines, with the first line as the title and the second line as the description.";

  return JSON.stringify({
    prompt: {
      text: promptText,
    },
  });
}

function getRandomName() {
  return "Dr. L.C Keswani";
}

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});