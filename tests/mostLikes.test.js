const { test } = require('node:test')
const assert = require('assert')
const { mostLikes } = require('../utils/list_helper')

const blogs = [
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    url: 'https://example.com',
    likes: 5
  },
  {
    title: 'Refactoring',
    author: 'Martin Fowler',
    url: 'https://example.com',
    likes: 10
  },
  {
    title: 'Clean Architecture',
    author: 'Robert C. Martin',
    url: 'https://example.com',
    likes: 7
  }
]

test('author with most likes', () => {
  const result = mostLikes(blogs)
  assert.deepStrictEqual(result, {
    author: 'Robert C. Martin',
    likes: 12
  })
})
