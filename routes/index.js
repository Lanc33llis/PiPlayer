var express = require("express")
var router = express.Router()
var vars = require("./routes/vars")

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" })
})

module.exports = router
