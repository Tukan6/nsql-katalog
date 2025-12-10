import React, { useEffect, useState } from 'react'
import { api } from './api'
import ProductList from './components/ProductList'
import ProductForm from './components/ProductForm'

export default function App() {
  const [selected, setSelected] = useState(null)
  const [reload, setReload] = useState(0)

  return (
    <div className="container">
      <h1>Product Catalog</h1>
      <div className="grid">
        <div>
          <ProductList onEdit={(p) => setSelected(p)} reload={reload} onReload={() => setReload(r=>r+1)} />
        </div>
        <div>
          <div className="card">
            <h3>{selected ? 'Edit Product' : 'Add Product'}</h3>
            <ProductForm product={selected} onDone={() => { setSelected(null); setReload(r=>r+1); }} />
          </div>
        </div>
      </div>
    </div>
  )
}
