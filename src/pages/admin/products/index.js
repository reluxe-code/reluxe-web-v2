// src/pages/admin/products/index.js
import { useEffect, useState } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { supabase } from '@/lib/supabase'

export default function AdminProductsList() {
  const [products, setProducts] = useState([])
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [brandFilter, setBrandFilter] = useState('')

  useEffect(() => { loadData() }, [])

  async function loadData() {
    setLoading(true)
    const [{ data: prods }, { data: br }] = await Promise.all([
      supabase.from('products').select('id, slug, name, category, is_bestseller, is_new, active, sales_rank, purchase_type, brand_id, brands(name, slug, purchase_type)').order('sales_rank', { ascending: true, nullsFirst: false }),
      supabase.from('brands').select('id, name, slug').order('sort_order'),
    ])
    setProducts(prods || [])
    setBrands(br || [])
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this product? This cannot be undone.')) return
    await supabase.from('products').delete().eq('id', id)
    loadData()
  }

  const filtered = products.filter(p => {
    if (brandFilter && p.brand_id !== brandFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return p.name.toLowerCase().includes(q) || p.slug.includes(q) || p.brands?.name?.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Link href="/admin/products/brands" className="px-4 py-2 bg-white border rounded-lg text-sm font-medium hover:bg-neutral-50 transition">
            Manage Brands
          </Link>
          <Link href="/admin/products/new" className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-neutral-800 transition">
            New Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm flex-1 max-w-xs"
        />
        <select
          value={brandFilter}
          onChange={e => setBrandFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Brands</option>
          {brands.map(b => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {loading ? <p className="text-neutral-500">Loading...</p> : filtered.length === 0 ? (
        <p className="text-neutral-500">No products found.</p>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">Brand</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-center px-4 py-3 font-medium">Rank</th>
                <th className="text-center px-4 py-3 font-medium">Flags</th>
                <th className="text-center px-4 py-3 font-medium">Active</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b last:border-b-0 hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium hover:underline">{p.name}</Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{p.brands?.name || '—'}</td>
                  <td className="px-4 py-3 text-neutral-500 capitalize">{p.category || '—'}</td>
                  <td className="px-4 py-3 text-center">{p.sales_rank || '—'}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {p.is_bestseller && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">Best</span>}
                      {p.is_new && <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-700">New</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block w-2 h-2 rounded-full ${p.active ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="text-blue-600 hover:underline mr-3">Edit</Link>
                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="px-4 py-2 bg-neutral-50 text-xs text-neutral-500 border-t">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

AdminProductsList.getLayout = (page) => page
