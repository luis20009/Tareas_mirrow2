const { test, describe } = require('node:test')
const assert = require('node:assert')
const favoriteBlog = require('../utils/list_helper').favoriteBlog

describe('favorite blog', () => {
  const blog = [
    {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    }
  ]
  const blogs = [
    {
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    },
    {
      title: 'Type wars',
      author: 'Robert C. Martin',
      likes: 10
    },
    {
      title: 'React vs Vue',
      author: 'Linus Torvalds',
      likes: 15
    }
  ]
  test('of empty list is null', () => {
    assert.deepStrictEqual(favoriteBlog([]), null)
  })

  test('when list has only one blog', () => {
    assert.deepStrictEqual(favoriteBlog(blog), blog[0])
  })

  test('of a bigger list is blog with most likes', () => {
    assert.deepStrictEqual(favoriteBlog(blogs), blogs[2])
  })
})