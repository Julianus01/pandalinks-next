function timeSince(date: any) {
  var seconds = Math.floor(((new Date() as any) - date) / 1000)

  var interval = seconds / 31536000

  if (interval > 1) {
    return Math.floor(interval) + ' years ago'
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return Math.floor(interval) + ' months ago'
  }
  interval = seconds / 86400
  if (interval > 1) {
    return Math.floor(interval) + ' days ago'
  }
  interval = seconds / 3600
  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return Math.floor(interval) + ' hour ago'
    }

    return Math.floor(interval) + ' hours ago'
  }
  interval = seconds / 60
  if (interval > 1) {
    if (Math.floor(interval) === 1) {
      return Math.floor(interval) + ' minute ago'
    }

    return Math.floor(interval) + ' minutes ago'
  }

  if (Math.floor(seconds) === 0) {
    return 'now'
  }

  return 'less than a minute ago'
}

export const DateUtils = {
  timeSince,
}
