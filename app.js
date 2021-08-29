var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
var sassMiddleware = require("node-sass-middleware")
const { Builder, By, until } = require("selenium-webdriver")
var chrome = require("selenium-webdriver/chrome")
const { setIntervalAsync } = require("set-interval-async/dynamic")
const fs = require("fs")
/**
 * Encoder for crx because selnium does not like paths!!
 * @param {*} file
 * @return {Buffer} buffer
 */
function encode(file) {
  var stream = fs.readFileSync(file)
  return new Buffer.from(stream).toString("base64")
}

var indexRouter = require("./routes/index")
var usersRouter = require("./routes/users")
var searchRouter = require("./routes/search")
var addRouter = require("./routes/add")
var queueRouter = require("./routes/getQueue")
var vars = require("./routes/vars")

const queueJson = JSON.parse(fs.readFileSync("queue.json"))
vars.queue = queueJson.songs
vars.play = queueJson.play
vars.currentID = queueJson.currentID
vars.queue

const driver = new Builder()
  .forBrowser("chrome")
  .setChromeOptions(
    new chrome.Options().addExtensions(
      encode(path.resolve(__dirname, "AdBlock.crx"))
    )
  )
  .build()
driver.get(`https://www.youtube.com`)
driver
  .wait(async function () {
    const handles = await driver.getAllWindowHandles()
    return handles.length > 1
  })
  .then(() => {
    driver.getAllWindowHandles().then(async (handles) => {
      await driver.switchTo().window(handles[1])
      await driver.close()
      await driver.switchTo().window(handles[0])
    })
  })
var songPlaying = false
/**
 * Manages the current page of the driver by going to the queue's url
 */
async function queueManager() {
  await driver
  if (vars.play) {
    if (!songPlaying && vars.queue.length > 0) {
      songPlaying = true
      t = ""
      if (vars.queue[0].currentTime != 0) {
        t = `?t=${vars.queue[0].currentTime}`
      }
      await driver.get(`${vars.queue[0].url}${t}`)
      await driver.wait(
        until.elementLocated(By.css(".video-stream.html5-main-video"))
      )
    } else {
      try {
        await driver.wait(
          until.elementLocated(By.css(".video-stream.html5-main-video"))
        )
        const currentStr = await driver.executeScript(
          `const video = document.querySelector(".video-stream.html5-main-video"); return video.currentTime;`
        )
        const durationStr = await driver.executeScript(
          `const video = document.querySelector(".video-stream.html5-main-video"); return video.duration;`
        )
        const current = Number(currentStr)
        const duration = Number(durationStr)
        if (duration == NaN) duration = 9999999999
        if (current >= duration && duration != 0) {
          vars.queue.shift()
          if (vars.queue.length == 0) {
            await driver.get(`https://www.youtube.com`)
          }
          songPlaying = false
        }
      } catch (error) {
        console.error(error)
      }
    }
  }
}

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
app.use("/add", addRouter)
app.use("/getQueue", queueRouter)

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

setIntervalAsync(queueManager, 1000)

module.exports = app
