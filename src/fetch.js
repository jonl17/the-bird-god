import fetch from 'node-fetch'
import { config } from 'dotenv'
import { cleanKeyword, makePath, writeToFile } from './utils.js'
import prompt from 'prompt'
config({ path: '.env' })

const { TWITTER_BEARER_TOKEN } = process.env

const auth = () => TWITTER_BEARER_TOKEN

const createHeaders = (bearerToken) => {
  return {
    Authorization: `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
  }
}

const createUrl = (
  keyword,
  granularity = 'day',
  start = '2022-06-16T17:00:00.000Z',
  end = '2022-06-16T17:05:00.000Z',
  maxResults = 10
) => {
  const searchUrl = 'https://api.twitter.com/2/tweets/search/recent'

  const hastag = keyword.includes('#') ? keyword.replace('#', '%23') : null

  return `${searchUrl}?query=${
    hastag ?? keyword
  }&max_results=${maxResults}&expansions=author_id&tweet.fields=created_at,public_metrics&user.fields=public_metrics`
}

const fetchTweets = async (url, headers, path) => {
  const response = await fetch(url, { headers, method: 'GET' })

  try {
    const data = await response.json()
    const next_token = null
    if (data.errors) {
      console.log(data.errors)
      return false
    } else {
      writeToFile(`${path}${next_token ?? 'first'}.json`, JSON.stringify(data))
      const meta = data.meta
      if (meta && meta.next_token) {
        const nextToken = meta.next_token
        const splitted = url.split('&next_token=')
        const nextUrl = `${splitted[0]}&next_token=${nextToken}`
        fetchTweets(nextUrl, headers, path)
      }
      return true
    }
  } catch (err) {
    console.log(err)
    return false
  }
}

prompt.start()

const run = async () =>
  prompt.get(['keyword'], (err, result) => {
    const { keyword } = result
    const path = 'src/tweets/' + cleanKeyword(keyword) + '/'
    const URL = createUrl(keyword)
    const headers = createHeaders(auth())
    const success = fetchTweets(URL, headers, path)
    if (success) {
      console.log(
        'Done fetching tweets for: ',
        keyword,
        '\n',
        'Saved to: ',
        path
      )
    } else {
      console.log('Failed to fetch tweets for: ', keyword)
    }
  })

await run()

// if (args.length === 0) {
//   console.log('Please provide a keyword in quotes')
//   console.log('Usage: yarn fetch "[keyword]"')
//   process.exit(1)
// }

// const keyword = args[0]
// const path = makePath(keyword, 'src/tweets/')

// await fetchTweets(createUrl(keyword), createHeaders(auth()), path)
