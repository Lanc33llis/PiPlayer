var express = require("express")
var router = express.Router()
var vars = require("./vars")

router.post("/", function (req, res, next) {
  if (req.body.title && req.body.url) {
    let t = 0
    if (req.body.timestamp) {
      t = req.body.timestamp
    }
    vars.queue.push({
      title: req.body.title,
      url: req.body.url,
      currentTime: t,
      id: vars.currentID,
    })
    vars.currentID++
    res.redirect("/")
  }
})

module.exports = router
