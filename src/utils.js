import fs from 'fs'

export const cleanKeyword = (keyword) => keyword.replace(/\s/g, '_')

export const makePath = (filename, folder) => {
  return `${folder}${filename}.json`
}

export const writeToFile = (path, data) =>
  fs.writeFile(path, data, (err, results) => {
    if (err) {
      console.log('error', err)
    }
  })

export const validateKeyword = (kw) => {
  return kw.length > 1
}

export const promptSchema = {
  properties: {
    keyword: {
      pattern: /^.*$/,
      message: 'Provide a proper keyword mate',
      required: true,
    },
    maxResults: {
      pattern: /\d+/,
      message: 'Provide a valid number ye hog',
      required: true,
    },
  },
}

export const validateTwitterResponse = (data) => {
  if (data.errors) {
    return {
      errors: data.errors,
    }
  }
  return true
}

export const readFilesFromDir = (path) => {
  fs.readdir(path, (err, files) => {
    if (err) {
      console.log(err)
    } else {
      return files
    }
  })
}
