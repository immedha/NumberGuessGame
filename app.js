/*
 * Medha Gupta
 * May 18, 2023
 * CSE 154 AB: Allan Tran, Elizabeth Xiong
 *
 * This is the app.js page that stores data for the "Guess The Number" game. It stores
 * individual game data, including the actual number and the user's guesses. It also evaluates
 * whether given guesses are correct.
 */
"use strict";

const express = require("express");
const multer = require("multer");
const fs = require("fs").promises;
const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(multer().none());

const ERROR_TEXT = "Something went wrong. Please try again.";
const INVALID_NUM = "Not a number between 1 and 100!";
const DATA_FILE = "data.json";
const MAX_NUM = 100;
const MIN_NUM = 1;
const INTERNAL_ERR = 500;
const CLIENT_ERR = 400;
const DEFAULT_PORT = 8000;

/*
 * Updates the file with game data when the user starts a new game or makes a guess.
 * The guess must be an integer between 1 and 100.
 */
app.post("/update", async (req, res) => {
  res.type("text");
  try {
    if (!req.body.game || !checkValidNum(req.body.game)) {
      res.status(INTERNAL_ERR).send("Game number couldn't be found.");
    } else if (req.body.actual && checkValidNum(req.body.actual)) {
      await newGame(parseInt(req.body.game), parseInt(req.body.actual));
      res.send("success");
    } else if (req.body.guess) {
      let guess = req.body.guess;
      let guessNum = parseInt(guess);
      if (checkValidNum(guess) && guessNum >= MIN_NUM && guessNum <= MAX_NUM) {
        updateGuess(parseInt(req.body.game), guessNum);
        res.send("success");
      } else {
        res.status(CLIENT_ERR).send(INVALID_NUM);
      }
    } else {
      res.status(INTERNAL_ERR).send(ERROR_TEXT);
    }
  } catch (err) {
    res.status(INTERNAL_ERR);
    if (err.code === "ENOENT") {
      res.send("Game data couldn't be found.");
    } else {
      res.send(ERROR_TEXT);
    }
  }
});

/*
 * Checks the user's guess and returns whether it is too high, low, or correct.
 * If it is correct, it returns the game data. The guess must be an integer between 1 and 100.
 */
app.get("/check", async (req, res) => {
  try {
    res.type("json");
    if (!req.query.guess || !req.query.game || !checkValidNum(req.query.game)) {
      res.status(INTERNAL_ERR).send("Game number or guess couldn't be found.");
    } else if (checkValidNum(req.query.guess) &&
              parseInt(req.query.guess) >= MIN_NUM && parseInt(req.query.guess) <= MAX_NUM) {
      let content = await fs.readFile(DATA_FILE, "utf-8");
      content = JSON.parse(content);
      let actual = content[parseInt(req.query.game)].actual;
      let response = await checkVal(parseInt(req.query.guess), actual);
      res.send(response);
    } else {
      res.status(CLIENT_ERR).send(INVALID_NUM);
    }
  } catch (err) {
    res.status(INTERNAL_ERR);
    if (err.code === "ENOENT") {
      res.send("Game data couldn't be processed.");
    } else {
      res.send(ERROR_TEXT);
    }
  }
});

/**
 * Updates data about the given game with the user's guess
 * @param {Integer} gameNum - the game number that the user is at
 * @param {Integer} guess - the user's guess
 */
async function updateGuess(gameNum, guess) {
  let content = await fs.readFile(DATA_FILE, "utf-8");
  content = JSON.parse(content);
  content[gameNum].guesses.push(guess);
  await fs.writeFile(DATA_FILE, JSON.stringify(content));
}

/**
 * Stores the actual number for the user to guess upon a new game
 * @param {Integer} gameNum - the game number that the user is at
 * @param {Integer} actual - the true number that the user has to guess
 */
async function newGame(gameNum, actual) {
  if (gameNum === 0) {
    await fs.writeFile(DATA_FILE, "[]");
  }
  let content = await fs.readFile(DATA_FILE, "utf-8");
  content = JSON.parse(content);
  content.push({
    "actual": actual,
    "guesses": []
  });
  await fs.writeFile(DATA_FILE, JSON.stringify(content));
}

/**
 * Checks whether the given guess is equal to the actual number.
 * @param {Integer} guess - the user's guess
 * @param {Integer} actual - the actual number that the user has to guess
 * @returns {Object} - feedback about whether the guess was too high, too low, or if it was
 * correct, returns data about all the games
 */
async function checkVal(guess, actual) {
  if (guess > actual) {
    return {"attempt": "Too high"};
  }
  if (guess < actual) {
    return {"attempt": "Too low"};
  }
  let content = await fs.readFile(DATA_FILE, "utf-8");
  return content;
}

/**
 * Checks if a given string is a number and contains no alphabet or special characters
 * @param {String} value - a given string
 * @returns {Boolean} - true if value is a number, false otherwise
 */
function checkValidNum(value) {
  return parseInt(value).toString().length === value.length;
}

app.use(express.static("public"));
const PORT = process.env.PORT || DEFAULT_PORT;
app.listen(PORT);