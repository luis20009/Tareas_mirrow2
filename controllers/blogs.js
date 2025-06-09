const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const { userExtractor } = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs)
});

blogsRouter.put('/:id/dislikes', userExtractor, async (request, response) => {
  const { dislikes } = request.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { dislikes },
      { new: true, runValidators: true }
    ).populate('user', { username: 1, name: 1 });

    if (!updatedBlog) {
      return response.status(404).json({ error: 'Blog not found' });
    }

    response.json(updatedBlog);
  } catch (error) {
    response.status(500).json({ error: 'Server error' });
  }
});

blogsRouter.put('/:id/likes', userExtractor, async (request, response) => {
  const { likes } = request.body;

  try {
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      { likes }, // Solo usa "likes", sin necesidad de dislikes
      { new: true, runValidators: true }
    ).populate('user', { username: 1, name: 1 });

    if (!updatedBlog) {
      return response.status(404).json({ error: 'Blog not found' });
    }

    response.json(updatedBlog);
  } catch {
    response.status(500).json({ error: 'Server error' });
  }
});


blogsRouter.post('/', userExtractor, async (request, response, next) => {
  const body = request.body
  const user = request.user  // Ya viene desde userExtractor

  if (!body.title || !body.url) {
    return response.status(400).json({ error: 'title and url are required' })
  }

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    dislikes: body.dislikes || 0,
    user: user._id
  })

  try {
    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    const populatedBlog = await savedBlog.populate('user', { username: 1, name: 1 })
    response.status(201).json(populatedBlog)
  } catch (exception) {
    next(exception)
  }
})



blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id)
  if (blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

blogsRouter.delete('/:id', userExtractor, async (request, response, next) => {
  try {
    const user = request.user  // Viene del middleware

    const blog = await Blog.findById(request.params.id)
    if (!blog) {
      return response.status(404).json({ error: 'blog not found' })
    }

    if (blog.user.toString() !== user._id.toString()) {
      return response.status(403).json({ error: 'only the creator can delete the blog' })
    }

    await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end()

  } catch (error) {
    next(error)
  }
})



module.exports = blogsRouter
