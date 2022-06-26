import fs from 'fs'

const getUserData = (user) => {
  const { followers_count: followersCount } = user.public_metrics
  return { id: user.id, followersCount }
}
const getLikeCount = (data) => {
  const { like_count: likeCount } = data.public_metrics
  return { likeCount }
}

const solveSameTimeTweets = (tweets) => {
  const minute = 1000
  let startTimes = {}
  for (let i = 0; i < tweets.length; i++) {
    const time = tweets[i].startingTime
    const registered = startTimes[time]
    if (registered === undefined) {
      const arr = [tweets[i]]
      startTimes[time] = {
        gap: 0,
        tweets: arr,
        newTweets: [],
      }
    } else {
      const oldArr = startTimes[time].tweets
      startTimes[time].tweets = [...oldArr, tweets[i]]
    }
  }

  const result = []

  Object.keys(startTimes).forEach((key) => {
    const startOffset = minute / startTimes[parseInt(key)].tweets.length
    const tweets = startTimes[parseInt(key)].tweets
    const newTweets = tweets.map((tweet, idx) => ({
      ...tweet,
      startingTime: tweet.startingTime + idx * startOffset,
    }))
    result.push(...newTweets)
  })

  return result
}

const resolveData = (result) => {
  const {
    data,
    meta,
    includes: { users },
  } = result

  const userArr = Array.from(users).map((user) => getUserData(user))
  const dataArr = Array.from(data)

  const rawTweets = userArr.map((user, idx) => {
    const tweet = dataArr.find((d) => d.author_id === user.id)

    const timeOffset = new Date(
      dataArr[dataArr.length - 1].created_at
    ).getTime()

    const startingTime = new Date(tweet.created_at).getTime() - timeOffset

    return {
      ...user,
      likes: tweet.public_metrics.like_count,
      retweets: tweet.public_metrics.retweet_count,
      createdAt: {
        raw: tweet.created_at,
        formatted: new Date(tweet.created_at).toLocaleString(),
        ms: new Date(tweet.created_at).getTime(),
      },
      startingTime,
    }
  })

  return solveSameTimeTweets(rawTweets)
}

export { resolveData }
