import fs from 'fs'
import { writeToFile } from '../utils.js'

const saveToJson = async (incomingData = [], path) => {
  // (3) save to json
  //     (3.1) if file exists and contains data go to step (3.3), else step (3.2)
  //     (3.2) create json file with incoming array and go to step (3.5)
  //     (3.3) translate current data to array
  //     (3.4) append incoming array to current array
  //     (3.5) write the json file

  const noHashPath = path.replace('#', '')

  await fs.readFile(noHashPath, (err, data) => {
    if (err) {
      console.log('File: ', noHashPath, ' did not exist. Creating new file...')
      writeToFile(noHashPath, JSON.stringify(incomingData))
    } else {
      console.log(
        'Updating existing file with ',
        incomingData.length,
        ' new entries'
      )
      const currentData = JSON.parse(data)
      const updatedData = [
        ...currentData,
        ...incomingData.map((d) => ({
          ...d,
          startingTime:
            currentData[currentData.length - 1].startingTime + d.startingTime,
        })),
      ]
      console.log('Updated total entries: ', updatedData.length)
      writeToFile(noHashPath, JSON.stringify(updatedData))
    }
  })
}

export { saveToJson }
