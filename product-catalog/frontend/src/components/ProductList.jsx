import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function ProductList({ onEdit, reload, onReload }) {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  async function load() {
    const res = await api.get(`/products?search=${encodeURIComponent(search)}&page=${page}&limit=8`)
    setItems(res.data.items)
    setTotal(res.data.total)
  }

  useEffect(() => { load() }, [page, search, reload])

  async function del(id) {
    if (!confirm('Delete product?')) return
    await api.delete(`/products/${id}`)
    onReload()
  }

  async function showDetail(id) {
    const res = await api.get(`/products/${id}`)
    alert(`Cache: ${res.data.cache}\nName: ${res.data.product.name}`)
  }

  return (
    <div>
      <div style={{marginBottom:10}}>
        <input placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} />
        <button className="btn" onClick={()=>{ setPage(1); load(); }}>Search</button>
      </div>

      {items.map(p => (
        <div key={p.id} className="card" style={{marginBottom:8}}>
          <strong>{p.name}</strong>
          <div className="small">{p.category} • ${p.price}</div>
          <div style={{marginTop:8}}>
            <button className="btn" onClick={()=>onEdit(p)}>Edit</button>
            <button className="btn" onClick={()=>del(p.id)}>Delete</button>
            <button className="btn" onClick={()=>showDetail(p.id)}>Detail (shows cache)</button>
          </div>
        </div>
      ))}

      <div style={{marginTop:10}}>
        <button className="btn" onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
        <span style={{margin:'0 8px'}}>Page {page}</span>
        <button className="btn" onClick={()=>setPage(p=>p+1)}>Next</button>
        <div className="small">Total: {total}</div>
      </div>
    </div>
  )
}
