import fs from 'fs'
const path = 'src/new-tweets/'
fs.readdir(path, (err, files) => {
  if (err) {
    console.log(err)
  } else {
    files.forEach((file) => {
      fs.rename(path + file, path + file.replace('#', ''), (err) =>
        console.log(err)
      )
    })
  }
})
