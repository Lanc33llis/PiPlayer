var express = require("express")
var router = express.Router()
var vars = require("./routes/vars")

router.post("/", function (req, res, next) {
  res.render("index")
})

module.exports = router
