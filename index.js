/*
 * Medha Gupta
 * May 18, 2023
 * CSE 154 AB: Allan Tran, Elizabeth Xiong
 *
 * This is the index.js page that adds interactivity to the "Guess The Number" game
 * structured in index.html. It allows users to play multiple games where the computer
 * chooses an integer between 1 and 100 and the user has to guess it.
 * When the user guesses the number, it populates game results.
 */
"use strict";
(function() {
  const MAX = 100;
  const MIN = 1;
  let gameNum = -1;
  window.addEventListener("load", init);

  /**
   * Starts new game when new game button is clicked.
   */
  function init() {
    qs("main > button").addEventListener("click", newGame);
  }

  /**
   * Starts a new game with an empty board and chooses a number between
   * 1 and 100 for the user to guess.
   */
  async function newGame() {
    try {
      let actualNum = Math.floor((Math.random() * MAX) + MIN);
      gameNum++;
      let data = getData(actualNum, "actual");
      let res = await fetch("/update", {method: "POST", body: data});
      await statusCheck(res);
      qs("main > button").disabled = true;
      let checkBtn = qs("section > button");
      checkBtn.disabled = false;
      qs("input").disabled = false;
      checkBtn.addEventListener("click", evaluateGuess);
      updateErrorText("");
      id("results").innerHTML = "";
      qs("#board > p").textContent = "";
      qs("input").value = "";
    } catch (err) {
      updateErrorText(err);
    }
  }

  /**
   * Checks the user's guess and displays feedback or game results if the user guessed correctly.
   */
  async function evaluateGuess() {
    updateErrorText("");
    let guess = qs("input").value;
    let guessNum = parseInt(guess);
    if (guessNum.toString().length === guess.length && guessNum >= MIN && guessNum <= MAX) {
      await updateData(guessNum);
      await checkAnswer(guessNum);
    } else {
      qs("#board > p").textContent = "";
      updateErrorText("Not a number between 1 and 100!");
    }
  }

  /**
   * Checks whether the guess is too high, low, or is correct.
   * Displays the results if it is correct.
   * @param {String} guess - the user's guess
   */
  async function checkAnswer(guess) {
    try {
      let res = await fetch("/check?game=" + gameNum + "&guess=" + guess);
      await statusCheck(res);
      res = await res.json();
      if (res.attempt) {
        qs("#board > p").textContent = res.attempt;
      } else {
        qs("#board > p").textContent = "You won!";
        displayResults(res);
        qs("main > button").disabled = false;
        qs("section > button").disabled = true;
        qs("input").disabled = true;
      }
    } catch (err) {
      updateErrorText(err);
    }
  }

  /**
   * Displays the game results when the user guesses correctly. It displays the correct answer,
   * how many tries the user took, and the user's exact tries.
   * @param {Object} results - data about games played, including the correct answer and the
   * user's guesses.
   */
  function displayResults(results) {
    for (let i = 0; i < results.length; i++) {
      let gameNumStr = "Game " + (i + 1) + ":";
      let gameAnsStr = " The actual number was " + results[i].actual;
      let gameNumTries = " and you took " + results[i].guesses.length + " tries.";
      let gameTries = " Here are your tries: " + results[i].guesses;
      let gameResult = gen("p");
      gameResult.textContent = gameNumStr + gameAnsStr + gameNumTries + gameTries;
      id("results").appendChild(gameResult);
    }
  }

  /**
   * Updates stored data about the game.
   * @param {String} guess - the user's guess
   */
  async function updateData(guess) {
    try {
      let data = getData(guess, "guess");
      let res = await fetch("/update", {method: "POST", body: data});
      await statusCheck(res);
    } catch (err) {
      updateErrorText(err);
    }
  }

  /**
   * Stores and returns given data about the game
   * @param {Integer} item - the value for the given key
   * @param {String} itemName - the name of the key in the data
   * @returns {Object} - an object storing the given data
   */
  function getData(item, itemName) {
    let data = new FormData();
    data.append("game", gameNum);
    data.append(itemName, item);
    return data;
  }

  /**
   * Displays given text when there is an error in the game.
   * @param {String} text - text to display
   */
  function updateErrorText(text) {
    id("error-text").textContent = text;
  }

  /**
   * Checks the status of an API response
   * @param {Object} res - response from API request
   * @returns {Object} response if in ok range, otherwise returns error
   */
  async function statusCheck(res) {
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return res;
  }

  /**
   * Creates a new HTML element of a specific type
   * @param {String} type - HTML element type
   * @returns {Element} HTML element of that type
   */
  function gen(type) {
    return document.createElement(type);
  }

  /**
   * Gets HTML element with specific id
   * @param {String} id - id of HTML element
   * @returns {Element} HTML element with given id
   */
  function id(id) {
    return document.getElementById(id);
  }

  /**
   * Gets an HTML element that can be described by the given selector
   * @param {String} selector - selector for an HTML element
   * @returns {Element} first HTML element identified by given selector
   */
  function qs(selector) {
    return document.querySelector(selector);
  }
})();