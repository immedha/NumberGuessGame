# Guess API Documentation
The Guess API takes information about specific Guess The Number games including the game number, actual number, and user guesses. It provides information about whether the guesses are correct.

## Update game data on new game or new guess
**Request Format:** /update endpoint with required POST parameter of `game` and either `actual` or `guess`

**Request Type:** POST

**Returned Data Format**: Plain Text

**Description:** Given a valid game number, updates game data with the actual number or a new guess. It replies with either success or an error. `game` must be greater than or equal to zero, and `actual` and `guess` must be integers between 1 and 100.

**Example Request:** /update with POST parameters of `game=0` and `actual=15`

**Example Response:**
```
success
```

**Error Handling:**
- All errors are in plain text.
- Possible 400 code error: if `guess` is not an integer or is not between 1 and 100, response is `Not a number between 1 and 100!`
- Possible 500 code errors:
  - If game data file couldn't be found, response is `Game data couldn't be processed.`
  - If game POST parameter is not given or is invalid, response is `Game number couldn't be found.`
  - For all below 500 errors, the response is `Something went wrong. Please try again.`
    - If one of `actual` or `guess` POST parameters are not given
    - If `actual` POST parameter is not valid
    - For all other server errors

## Check Guess
**Request Format:** /check with required query parameters `guess` and `game`

**Request Type:** GET

**Returned Data Format**: JSON

**Description:** Checks whether the guess is correct. If correct, it returns game data. If incorrect, returns whether the guess was too high or too low.

**Example Request:** /check with `game=0` and `guess=5`

**Example Response:**

```json
{
  "attempt": "Too low"
}
```

**Error Handling:**
- All errors are of type JSON.
- Possible 400 code error: if `guess` is not valid number. Response is
`Not a number between 1 and 100!`

- Possible 500 code errors:
  - If `game` is not given or valid or `guess` is not given, response is `Game number or guess couldn't be found.`
  - If game data file couldn't be found, response is `Game data couldn't be processed.`
  - For all other server errors, response is `Something went wrong. Please try again.`