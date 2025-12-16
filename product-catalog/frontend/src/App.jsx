import React, { useState } from 'react'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [refreshCounter, setRefreshCounter] = useState(0)

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
  }

  const handleFormSuccess = () => {
    setSelectedProduct(null)
    setRefreshCounter(prev => prev + 1)
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Product Catalog</h1>
        <p className="subtitle">Manage your products efficiently</p>
      </header>

      <div className="app-content">
        <div className="products-section">
          <h2>Products</h2>
          <ProductList 
            onEdit={handleEditProduct} 
            refreshTrigger={refreshCounter}
          />
        </div>

        <div className="form-section">
          <div className="form-card">
            <h2>{selectedProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <ProductForm 
              product={selectedProduct} 
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
