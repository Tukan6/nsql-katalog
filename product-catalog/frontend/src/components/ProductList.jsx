import React, { useState, useEffect } from 'react'
import { api } from '../api'

export default function ProductList({ onEdit, refreshTrigger }) {
  const [products, setProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const itemsPerPage = 8

  useEffect(() => {
    loadProducts()
  }, [currentPage, refreshTrigger])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      const response = await api.get('/products', {
        params: {
          search: searchQuery,
          page: currentPage,
          limit: itemsPerPage
        }
      })
      setProducts(response.data.items)
      setTotalProducts(response.data.total)
    } catch (err) {
      console.error('Error loading products:', err)
      alert('Failed to load products')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadProducts()
  }

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) {
      return
    }

    try {
      await api.delete(`/products/${id}`)
      loadProducts()
    } catch (err) {
      console.error('Error deleting product:', err)
      alert('Failed to delete product')
    }
  }

  const handleViewDetail = async (id) => {
    try {
      const response = await api.get(`/products/${id}`)
      const { cache, product } = response.data
      alert(
        `Cache Status: ${cache}\n\n` +
        `Name: ${product.name}\n` +
        `Category: ${product.category || 'N/A'}\n` +
        `Price: $${product.price}\n` +
        `Description: ${product.description || 'N/A'}`
      )
    } catch (err) {
      console.error('Error fetching product details:', err)
      alert('Failed to fetch product details')
    }
  }

  const totalPages = Math.ceil(totalProducts / itemsPerPage)

  return (
    <div className="product-list">
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleSearchKeyPress}
          className="search-input"
        />
        <button onClick={handleSearch} className="btn btn-primary">
          Search
        </button>
      </div>

      {isLoading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="no-products">No products found</div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-header">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">${product.price}</div>
              </div>
              
              <div className="product-info">
                {product.category && (
                  <span className="product-category">{product.category}</span>
                )}
              </div>
              
              {product.description && (
                <p className="product-description">{product.description}</p>
              )}
              
              <div className="product-actions">
                <button
                  onClick={() => onEdit(product)}
                  className="btn btn-primary"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="btn btn-danger"
                >
                  Delete
                </button>
                <button
                  onClick={() => handleViewDetail(product.id)}
                  className="btn btn-secondary"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pagination">
        <button
          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={currentPage === 1 || isLoading}
          className="btn btn-secondary"
        >
          Previous
        </button>
        
        <span className="page-info">
          Page {currentPage} of {totalPages || 1}
        </span>
        
        <button
          onClick={() => setCurrentPage(prev => prev + 1)}
          disabled={currentPage >= totalPages || isLoading}
          className="btn btn-secondary"
        >
          Next
        </button>
        
        <div className="total-count">
          Total products: {totalProducts}
        </div>
      </div>
    </div>
  )
}
