import React, { useState, useEffect } from 'react'
import { api } from '../api'

export default function ProductForm({ product, onSuccess }) {
  const initialFormState = {
    name: '',
    description: '',
    price: '',
    category: ''
  }

  const [formData, setFormData] = useState(initialFormState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        category: product.category || ''
      })
    } else {
      setFormData(initialFormState)
    }
    setError('')
  }, [product])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Product name is required')
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: price,
        category: formData.category.trim()
      }

      if (product && product.id) {
        await api.put(`/products/${product.id}`, payload)
      } else {
        await api.post('/products', payload)
      }

      setFormData(initialFormState)
      onSuccess()
    } catch (err) {
      const errorMessage = err?.response?.data?.error || err.message || 'Failed to save product'
      setError(errorMessage)
      console.error('Error saving product:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData(initialFormState)
    setError('')
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="product-form">
      {error && (
        <div className="error-message">{error}</div>
      )}

      <div className="form-group">
        <label htmlFor="name">Product Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter product name"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="category">Category</label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          placeholder="Enter category"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-group">
        <label htmlFor="price">Price *</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          min="0"
          disabled={isSubmitting}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter product description"
          rows="4"
          disabled={isSubmitting}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}
