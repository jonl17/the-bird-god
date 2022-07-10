import { config } from 'dotenv'

config({ path: '.env' })

const auth = () => process.env.TWITTER_BEARER_TOKEN

const createHeaders = (bearerToken) => {
  return {
    Authorization: `Bearer ${bearerToken}`,
    'Content-Type': 'application/json',
  }
}

const searchTweetUrl = (keyword, options = { maxResults: 10 }) => {
  const { maxResults, start, end } = options
  const baseUrl = 'https://api.twitter.com/2/tweets/search/recent'

  const hastag = keyword.includes('#') ? keyword.replace('#', '%23') : null

  const base = `${baseUrl}?query=${
    hastag ?? keyword
  }&max_results=${maxResults}&expansions=author_id&tweet.fields=created_at,context_annotations,public_metrics&user.fields=public_metrics`

  if (start && end) {
    return `${base}&start_time=${start}&end_time=${end}`
  } else return base
}

export { auth, createHeaders, searchTweetUrl }
