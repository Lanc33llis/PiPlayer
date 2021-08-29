var express = require("express")
var router = express.Router()
// var vars = require("./routes/vars")
const { Builder, By, Key, until } = require("selenium-webdriver")

const driver = new Builder().forBrowser("chrome").build()
driver.get(`https://www.youtube.com`)
/**
 * Sends a request to YouTube with the search query and returns the plain text response
 * @param {String} searchQuery the request search query
 * @return {Promise<Array[]>} the plain text response as a string
 */
async function getVideos(searchQuery) {
  await driver
  try {
    const encodedSearchQuery = encodeURI(searchQuery)
    await driver.get(
      `https://www.youtube.com/results?search_query=${encodedSearchQuery}`
    )
    const elems = await driver.wait(
      until.elementsLocated(By.css("a#video-title"))
    )

    const data = await Promise.all(
      elems.map(async (elem) => {
        const title = await elem.getAttribute("title")
        const url = await elem.getAttribute("href")
        return {
          title: title,
          url: url,
        }
      })
    )
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
  }
})

module.exports = router
