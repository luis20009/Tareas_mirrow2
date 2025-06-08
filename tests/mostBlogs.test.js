const { test } = require('node:test')
const assert = require('assert')
const { mostBlogs } = require('../utils/list_helper')  // Asegúrate que es un objeto exportado correctamente

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

test('author with most blogs', () => {
  const result = mostBlogs(blogs)
  assert.deepStrictEqual(result, {
    author: 'Robert C. Martin',
    blogs: 2
  })
})
