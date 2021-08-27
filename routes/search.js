var express = require("express")
var router = express.Router()
var vars = require("./routes/vars")
const { Builder, By, Key, until } = require("selenium-webdriver")

/**
 * Sends a request to YouTube with the search query and returns the plain text response
 * @param {String} searchQuery the request search query
 * @return {Promise<Array[]>} the plain text response as a string
 */
async function getVideos(searchQuery) {
  try {
    const encodedSearchQuery = encodeURI(searchQuery)
    const driver = await new Builder().forBrowser("chrome").build()
    await driver.get(
      `https://www.youtube.com/results?search_query=${encodedSearchQuery}`
    )
    const elems = await driver.wait(
      until.elementsLocated(By.css("a#video-title"))
    )
    const data = await Promise.all(
      elems.map((elem) => {
        return new Promise(async (resolve, reject) => {
          resolve({
            title: await elem.getAttribute("title"),
            url: await elem.getAttribute("href"),
          })
        })
      })
    )
    await driver.quit()
    return [data, null]
  } catch (error) {
    return [null, error]
  }
}

router.get("/", async (req, res, next) => {
  if (req.query.searchQuery) {
    searchQuery = req.query.searchQuery
    const [data, error] = await getVideos(searchQuery)
    if (error) return console.log(error)
    const topItems = 3
    res.render("search", {
      searchQuery: searchQuery,
      data: data.slice(0, topItems),
    })
  } else {
    next()
  }
})

module.exports = router
