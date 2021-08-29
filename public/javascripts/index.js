const queueContainer = document.getElementsByClassName("queue")[0]

const ids = []

setInterval(() => {
  fetch("getQueue", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "manual",
  })
    .then((data) => {
      return data.json()
    })
    .then((data) => {
      data.queue.forEach((song) => {
        if (!ids.includes(song.id)) {
          const songContainer = document.createElement("div")
          const songTitle = document.createElement("h2")
          songTitle.innerHTML = song.title
          songContainer.appendChild(songTitle)
          queueContainer.appendChild(songContainer)
          ids.push(song.id)
        }
      })
      for (let i = 0; i < ids.length; i++) {
        let isInQueue = false
        for (let j = 0; j < data.queue.length; j++) {
          if (data.queue[j].id === ids[i]) {
            isInQueue = true
          }
        }
        if (!isInQueue) {
          queueContainer.removeChild(queueContainer.children[i])
          ids.splice(i, 1)
        }
      }
    })
}, 1000)
