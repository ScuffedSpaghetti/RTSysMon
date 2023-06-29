/**

This patches compress-json with an option that ensures that the object stays in order

**/

let compressedJson = require("compressed-json")
compressedJson.compress = require("./compress.js")
module.exports = compressedJson