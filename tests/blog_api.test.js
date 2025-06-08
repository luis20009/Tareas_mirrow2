const bcrypt = require('bcrypt')
const { test, after, beforeEach } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

beforeEach(async () => {
  await User.deleteMany({})
  await Blog.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'admin', name: 'admin', passwordHash, blogs: [] })
  await user.save()

  const userInDb = await User.findOne({ username: 'admin' })

  const blogObjects = helper.initialBlogs.map(blog => new Blog({ ...blog, user: userInDb._id }))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')

  assert.strictEqual(response.body.length, helper.initialBlogs.length)
})

test('unique identifier property of blog posts is named id', async () => {
  const response = await api.get('/api/blogs')

  for (const blog of response.body) {
    assert.ok(blog.id, 'Blog does not have an id property')
    assert.strictEqual(blog._id, undefined, 'Blog should not have _id property')
  }
})

test('a valid blog can be added ', async () => {
  // 1. Autenticarse para obtener el token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'admin',
      password: 'sekret'
    })

  const token = loginResponse.body.token
  assert(token, 'Token no recibido en el login')

  // 2. Crear el nuevo blog
  const newBlog = {
    title: 'Cómo aprender C en 30 días',
    author: 'Tom & Jerry',
    url: 'https://ejemplo.com/aprender-python',
    likes: 54
  }

  // 3. Enviar el blog con el token
  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length + 1)

  const contents = blogsAtEnd.map(n => n.title)
  assert(contents.includes('Cómo aprender C en 30 días'))
})

test('if likes property is missing, it defaults to 0', async () => {
  // 1. Autenticarse para obtener el token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'admin',
      password: 'sekret'
    })

  const token = loginResponse.body.token
  assert(token, 'Token no recibido en el login')

  // 2. Crear el nuevo blog
  const newBlog = {
    title: 'Cómo aprender C en 30 días',
    author: 'Tom & Jerry',
    url: 'https://ejemplo.com/aprender-python'
  }

  // 3. Enviar el blog con el token
  const response = await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, 0)
})

test('blog without title or url is not added and returns 400', async () => {
  // 1. Autenticarse para obtener el token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'admin',
      password: 'sekret'
    })

  const token = loginResponse.body.token
  assert(token, 'Token no recibido en el login')

  const blogWithoutTitle = {
    author: 'Autor sin título',
    url: 'https://ejemplo.com/sin-titulo',
    likes: 5
  }

  const blogWithoutUrl = {
    title: 'Blog sin URL',
    author: 'Autor sin url',
    likes: 3
  }

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blogWithoutTitle)
    .expect(400)

  await api
    .post('/api/blogs')
    .set('Authorization', `Bearer ${token}`)
    .send(blogWithoutUrl)
    .expect(400)
})

test('delete a existent blog', async () => {
  // 1. Autenticarse para obtener el token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'admin',
      password: 'sekret'
    })

  const token = loginResponse.body.token
  assert(token, 'Token no recibido en el login')
  const blogsAtStart = await Blog.find({})
  const blogToDelete = blogsAtStart[0]

  await api
    .delete(`/api/blogs/${blogToDelete._id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)

  const blogsAtEnd = await helper.blogsInDb()
  assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1)
})

test('return 400 if id is malformatted', async () => {
  // 1. Autenticarse para obtener el token
  const loginResponse = await api
    .post('/api/login')
    .send({
      username: 'admin',
      password: 'sekret'
    })

  const token = loginResponse.body.token
  assert(token, 'Token no recibido en el login')
  await api
    .delete('/api/blogs/invalid-id')
    .set('Authorization', `Bearer ${token}`)
    .expect(400)
})

test('PUT update only likes from single blog', async () => {
  const blogsAtStart = await helper.blogsInDb()
  const blogToUpdate = blogsAtStart[1]
  const newLikes = 56

  const response = await api
    .put(`/api/blogs/${blogToUpdate.id}/likes`)
    .send({ likes: newLikes })
    .expect(200)
    .expect('Content-Type', /application\/json/)

  assert.strictEqual(response.body.likes, newLikes)
  assert.strictEqual(response.body.title, blogToUpdate.title)
})


after(async () => {
  await mongoose.connection.close()
})