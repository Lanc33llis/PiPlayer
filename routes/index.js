var express = require("express")
var router = express.Router()
var vars = require("./vars")

/* GET home page. */
router.get("/", function (req, res, next) {
  var songs = vars.queue
  res.render("index", { title: "Express", songs: songs })
})

module.exports = router
