const _ = require('lodash')

const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const favorite = blogs.reduce((max, blog) =>
    blog.likes > max.likes ? blog : max, blogs[0])

  return {
    title: favorite.title,
    author: favorite.author,
    likes: favorite.likes
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const grouped = _.countBy(blogs, 'author')
  const topAuthor = _.maxBy(Object.keys(grouped), author => grouped[author])

  return {
    author: topAuthor,
    blogs: grouped[topAuthor]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const grouped = _.groupBy(blogs, 'author')

  const mostLikedAuthor = _.maxBy(
    _.keys(grouped),
    author => _.sumBy(grouped[author], 'likes')
  )

  const totalLikes = _.sumBy(grouped[mostLikedAuthor], 'likes')

  return {
    author: mostLikedAuthor,
    likes: totalLikes
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}