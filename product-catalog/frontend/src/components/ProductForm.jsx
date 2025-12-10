import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function ProductForm({ product, onDone }) {
  const [form, setForm] = useState({ name:'', description:'', price:0, category:'' })

  useEffect(() => { if (product) setForm(product); else setForm({ name:'', description:'', price:0, category:'' }) }, [product])

  async function submit(e) {
    e.preventDefault()
    if (product) {
      await api.put(`/products/${product.id}`, form)
    } else {
      await api.post('/products', form)
    }
    onDone()
  }

  return (
    <form onSubmit={submit}>
      <div>
        <label>Name</label><br/>
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required />
      </div>
      <div>
        <label>Category</label><br/>
        <input value={form.category} onChange={e=>setForm({...form,category:e.target.value})} />
      </div>
      <div>
        <label>Price</label><br/>
        <input type="number" step="0.01" value={form.price} onChange={e=>setForm({...form,price:parseFloat(e.target.value) || 0})} required />
      </div>
      <div>
        <label>Description</label><br/>
        <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} />
      </div>
      <div style={{marginTop:8}}>
        <button className="btn" type="submit">Save</button>
        <button type="button" className="btn" onClick={()=>{ onDone(); }}>Cancel</button>
      </div>
    </form>
  )
}
