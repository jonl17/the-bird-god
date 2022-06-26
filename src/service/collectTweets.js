import fetch from 'node-fetch'
import prompt from 'prompt'
import { stringify } from 'querystring'
import {
  cleanKeyword,
  makePath,
  validateKeyword,
  writeToFile,
  promptSchema,
  validateTwitterResponse,
} from '../utils.js'
import { auth, createHeaders, searchTweetUrl } from './apiConfig.js'
import { resolveData } from '../lib/resolveData.js'
import { saveToJson } from '../lib/saveToJson.js'

const fetchTweets = async (url, headers) => {
  // try fetch
  const response = await fetch(url, { headers, method: 'GET' })
  try {
    const data = await response.json()
    const success = validateTwitterResponse(data)

    if (success.errors) {
      console.error(success.errors)
    } else {
      return data
    }
  } catch (error) {
    throw new Error(error.message)
  }
}

const start = '2022-06-16T17:00:00.000Z'
const end = '2022-06-16T17:05:00.000Z'

const collectTweets = async (keyword, maxResults) => {
  console.log(
    'collecting tweets for keyword:',
    keyword,
    '\n',
    'Max results: ',
    maxResults
  )
  const storagePath = `src/tweets/${cleanKeyword(keyword)}_tweets.json`

  const headers = createHeaders(auth())

  /* 
    order of execution:
    (1) run fetch
    (2) deconstruct data to array
    (3) save to json
      (3.1) if file exists and contains data go to step (3.3), else step (3.2)
      (3.2) create json file with incoming array and go to step (3.5)
      (3.3) translate current data to array
      (3.4) append incoming array to current array
      (3.5) write the json file
    (4) if next_token go to step (1), else go to step (10)
    (10) end
  */

  const fetcher = async (url) => {
    // (1) run fetch
    const data = await fetchTweets(url, headers)
    if (!data) return
    // (2) deconstruct data to an array
    const tweetArray = resolveData(data)

    if (tweetArray[9].startingTime > 60000) {
      throw new Error('Early return... tweets were too infrequent.')
    }

    // (3) save to json
    await saveToJson(tweetArray, storagePath)

    const nextToken = data.meta.next_token

    if (nextToken) {
      const updatedUrl = searchTweetUrl(keyword, { maxResults })
      fetcher(updatedUrl)
    }
  }

  // (4) if next_token go to step (1), else go to step (10)
  const url = searchTweetUrl(keyword, { maxResults })
  await fetcher(url)
}

// get keyword from user
const runPrompt = async () => {
  let keyword = ''
  prompt.start()
  return await prompt.get(promptSchema)
}

await runPrompt().then((result) => {
  // collect tweets
  collectTweets(result.keyword, result.maxResults)
})
