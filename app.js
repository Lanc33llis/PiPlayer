var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
var sassMiddleware = require("node-sass-middleware")
const { Builder, By, Key, until } = require("selenium-webdriver")
const fs = require("fs")

var indexRouter = require("./routes/index")
var usersRouter = require("./routes/users")
var searchRouter = require("./routes/search")
var vars = require("./routes/vars")

fs.readFile("queue.json", (err, data) => {
  if (err) return console.error("Could not open queue.json")
  const json = JSON.parse(data.songs)
  vars.queue = json.songs
  vars.play = json.play
})
/**
 * Controls the queue by playing songs when the play button is pressed and popping songs off the queue when they finish
 */
async function queueManager() {
  const driver = await new Builder().forBrowser("chrome").build()
  const songPlaying = false
  await driver.get(`https://www.youtube.com`)
  while (true) {
    if (vars.play) {
      if (!songPlaying) {
        t = ""
        if (vars.queue[0].currentTime != 0) {
          t = `?t=${vars.queue[0].currentTime}`
        }
        await driver.get(`https://www.youtube.com${vars.queue[0].url}${t}`)
        const btn = await driver.findElement(
          By.className("ytp-play-button ytp-button")
        )
        await btn.click()
        songPlaying = true
      }
      if (songPlaying) {
        const current = await driver
          .findElement(By.className("ytp-time-current"))
          .getText()
        const duration = await driver
          .findElement(By.className("ytp-time-duration"))
          .getText()
        if (current == duration) {
          songPlaying = false
          vars.queue.shift()
        }
      }
    }
  }
}

queueManager()

var app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "pug")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(
  sassMiddleware({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    indentedSyntax: true, // true = .sass and false = .scss
    sourceMap: true,
  })
)
app.use(express.static(path.join(__dirname, "public")))

app.use("/", indexRouter)
app.use("/users", usersRouter)
app.use("/search", searchRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404))
})

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app
