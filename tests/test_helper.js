const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Cómo aprender JavaScript en 30 días',
    author: 'Tom & Jerry',
    url: 'https://ejemplo.com/aprender-js',
    likes: 54,
    user: {
      username: 'admin',
      name: 'admin'
    }
  },
  {
    title: 'Cómo aprender Python en 30 días',
    author: 'Tom & Jerry',
    url: 'https://ejemplo.com/aprender-python',
    likes: 54,
    user: {
      username: 'admin',
      name: 'admin'
    }
  },
]

const nonExistingId = async () => {
  const blog = new Blog({ content: 'willremovethissoon' })
  await blog.save()
  await blog.deleteOne()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

module.exports = {
  initialBlogs,
  nonExistingId,
  blogsInDb,
  usersInDb,
}