var express = require("express")
var router = express.Router()
var vars = require("./vars")

router.post("/", (req, res, next) => {
  res.json({ queue: vars.queue })
})

module.exports = router
