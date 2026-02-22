// src/pages/admin/products/[id].js
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import { supabase } from '@/lib/supabase'

function slugify(text) {
  return (text || '').toLowerCase().replace(/[®™]+/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EMPTY = {
  brand_id: '', slug: '', name: '', subtitle: '', description: '', short_description: '',
  category: '', image_url: '', gallery: [], price: '', size: '',
  key_ingredients: [], skin_types: [], concerns: [],
  how_to_use: '', pro_tip: '', faq: [], related_services: [],
  staff_picks: {}, post_procedure: null,
  purchase_url: '', purchase_type: '',
  is_bestseller: false, is_new: false, featured: false, active: true,
  sales_rank: '', sort_order: 0, seo_title: '', seo_description: '',
}

const CATEGORIES = ['anti-aging', 'sun-protection', 'hydration', 'brightening', 'acne', 'body']
const SKIN_TYPES = ['normal', 'dry', 'combination', 'oily', 'sensitive']
const CONCERNS = ['fine-lines', 'texture', 'dullness', 'dark-spots', 'melasma', 'acne', 'oiliness', 'redness', 'rosacea', 'sensitivity', 'dryness', 'barrier-damage', 'post-procedure', 'puffiness', 'dark-circles', 'sun-protection', 'firmness', 'post-inflammatory', 'blue-light']

export default function AdminProductEdit() {
  const router = useRouter()
  const { id } = router.query
  const isNew = id === 'new'
  const [product, setProduct] = useState(EMPTY)
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    supabase.from('brands').select('id, name, slug').order('sort_order').then(({ data }) => setBrands(data || []))
  }, [])

  useEffect(() => {
    if (!id || isNew) return
    supabase.from('products').select('*').eq('id', id).limit(1).then(({ data }) => {
      if (data?.[0]) {
        setProduct({
          ...data[0],
          key_ingredients: data[0].key_ingredients || [],
          skin_types: data[0].skin_types || [],
          concerns: data[0].concerns || [],
          gallery: data[0].gallery || [],
          faq: data[0].faq || [],
          related_services: data[0].related_services || [],
          staff_picks: data[0].staff_picks || {},
          price: data[0].price || '',
          sales_rank: data[0].sales_rank || '',
        })
      }
      setLoading(false)
    })
  }, [id, isNew])

  function update(field, value) {
    setProduct(prev => {
      const u = { ...prev, [field]: value }
      if (field === 'name' && (isNew || !prev.slug)) u.slug = slugify(value)
      return u
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const payload = {
      ...product,
      price: product.price ? parseFloat(product.price) : null,
      sales_rank: product.sales_rank ? parseInt(product.sales_rank) : null,
      purchase_type: product.purchase_type || null,
      staff_picks: Object.keys(product.staff_picks || {}).length > 0 ? product.staff_picks : null,
      post_procedure: product.post_procedure || null,
      updated_at: new Date().toISOString(),
    }
    delete payload.id
    delete payload.created_at
    delete payload.brands

    let result
    if (isNew) result = await supabase.from('products').insert(payload).select()
    else result = await supabase.from('products').update(payload).eq('id', id).select()

    if (result.error) setMessage(`Error: ${result.error.message}`)
    else {
      setMessage('Saved!')
      if (isNew && result.data?.[0]?.id) router.replace(`/admin/products/${result.data[0].id}`)
    }
    setSaving(false)
  }

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isNew ? 'New Product' : 'Edit Product'}</h1>
        <a href="/admin/products" className="text-sm text-neutral-500 hover:text-neutral-700">← Back to Products</a>
      </div>

      <form onSubmit={handleSave} className="max-w-4xl space-y-8">
        {/* Basic Info */}
        <Section title="Basic Info">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Product Name" required>
              <input type="text" value={product.name} onChange={e => update('name', e.target.value)} required className="input" />
            </Field>
            <Field label="Slug">
              <input type="text" value={product.slug} onChange={e => update('slug', e.target.value)} required className="input font-mono" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand" required>
              <select value={product.brand_id} onChange={e => update('brand_id', e.target.value)} required className="input">
                <option value="">Select brand...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={product.category || ''} onChange={e => update('category', e.target.value)} className="input">
                <option value="">Select...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Subtitle">
            <input type="text" value={product.subtitle || ''} onChange={e => update('subtitle', e.target.value)} className="input" placeholder="Short tagline" />
          </Field>
        </Section>

        {/* Content */}
        <Section title="Content">
          <Field label="Short Description (for cards)">
            <input type="text" value={product.short_description || ''} onChange={e => update('short_description', e.target.value)} className="input" />
          </Field>
          <Field label="Full Description">
            <textarea value={product.description || ''} onChange={e => update('description', e.target.value)} rows={6} className="input" />
          </Field>
          <Field label="How to Use">
            <textarea value={product.how_to_use || ''} onChange={e => update('how_to_use', e.target.value)} rows={3} className="input" />
          </Field>
          <Field label="Pro Tip">
            <textarea value={product.pro_tip || ''} onChange={e => update('pro_tip', e.target.value)} rows={2} className="input" />
          </Field>
        </Section>

        {/* Image */}
        <Section title="Images">
          <ImageUpload value={product.image_url} onChange={url => update('image_url', url)} folder="products" label="Product Image" />
        </Section>

        {/* Ingredients & Targeting */}
        <Section title="Ingredients & Targeting">
          <Field label="Key Ingredients (comma-separated)">
            <input
              type="text"
              value={(product.key_ingredients || []).join(', ')}
              onChange={e => update('key_ingredients', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="input"
              placeholder="Retinoid, AHA, Vitamin C"
            />
          </Field>
          <Field label="Skin Types">
            <div className="flex flex-wrap gap-2">
              {SKIN_TYPES.map(t => (
                <label key={t} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={(product.skin_types || []).includes(t)}
                    onChange={e => {
                      const arr = [...(product.skin_types || [])]
                      if (e.target.checked) arr.push(t)
                      else arr.splice(arr.indexOf(t), 1)
                      update('skin_types', arr)
                    }}
                    className="rounded"
                  />
                  <span className="capitalize">{t}</span>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Concerns">
            <div className="flex flex-wrap gap-2">
              {CONCERNS.map(c => (
                <label key={c} className="flex items-center gap-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={(product.concerns || []).includes(c)}
                    onChange={e => {
                      const arr = [...(product.concerns || [])]
                      if (e.target.checked) arr.push(c)
                      else arr.splice(arr.indexOf(c), 1)
                      update('concerns', arr)
                    }}
                    className="rounded"
                  />
                  <span className="capitalize">{c.replace(/-/g, ' ')}</span>
                </label>
              ))}
            </div>
          </Field>
        </Section>

        {/* Pricing & Purchase */}
        <Section title="Pricing & Purchase">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Price ($)">
              <input type="text" value={product.price || ''} onChange={e => update('price', e.target.value)} className="input" placeholder="149.00" />
            </Field>
            <Field label="Size">
              <input type="text" value={product.size || ''} onChange={e => update('size', e.target.value)} className="input" placeholder="50ml" />
            </Field>
            <Field label="Purchase Type">
              <select value={product.purchase_type || ''} onChange={e => update('purchase_type', e.target.value)} className="input">
                <option value="">Use brand default</option>
                <option value="affiliate">Affiliate</option>
                <option value="in_clinic">In-Clinic Only</option>
                <option value="direct">Direct</option>
              </select>
            </Field>
          </div>
          <Field label="Purchase URL">
            <input type="text" value={product.purchase_url || ''} onChange={e => update('purchase_url', e.target.value)} className="input" placeholder="https://..." />
          </Field>
        </Section>

        {/* Staff Picks */}
        <Section title="Staff Picks">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Westfield Pick Reason">
              <textarea
                value={product.staff_picks?.westfield || ''}
                onChange={e => update('staff_picks', { ...product.staff_picks, westfield: e.target.value || undefined })}
                rows={2}
                className="input"
                placeholder="Leave blank if not a staff pick"
              />
            </Field>
            <Field label="Carmel Pick Reason">
              <textarea
                value={product.staff_picks?.carmel || ''}
                onChange={e => update('staff_picks', { ...product.staff_picks, carmel: e.target.value || undefined })}
                rows={2}
                className="input"
                placeholder="Leave blank if not a staff pick"
              />
            </Field>
          </div>
        </Section>

        {/* FAQ */}
        <Section title="FAQ">
          {(product.faq || []).map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={item.q}
                  onChange={e => {
                    const faq = [...product.faq]
                    faq[i] = { ...faq[i], q: e.target.value }
                    update('faq', faq)
                  }}
                  className="input"
                  placeholder="Question"
                />
                <textarea
                  value={item.a}
                  onChange={e => {
                    const faq = [...product.faq]
                    faq[i] = { ...faq[i], a: e.target.value }
                    update('faq', faq)
                  }}
                  className="input"
                  rows={2}
                  placeholder="Answer"
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const faq = [...product.faq]
                  faq.splice(i, 1)
                  update('faq', faq)
                }}
                className="text-red-500 hover:text-red-700 text-sm mt-2"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update('faq', [...(product.faq || []), { q: '', a: '' }])}
            className="text-sm text-blue-600 hover:underline"
          >
            + Add FAQ
          </button>
        </Section>

        {/* Related Services */}
        <Section title="Related Services">
          <Field label="Service slugs (comma-separated)">
            <input
              type="text"
              value={(product.related_services || []).join(', ')}
              onChange={e => update('related_services', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="input"
              placeholder="botox, microneedling, chemical-peels"
            />
          </Field>
        </Section>

        {/* SEO Overrides */}
        <Section title="SEO Overrides">
          <Field label="SEO Title">
            <input type="text" value={product.seo_title || ''} onChange={e => update('seo_title', e.target.value)} className="input" placeholder="Leave blank for auto-generated" />
          </Field>
          <Field label="SEO Description">
            <textarea value={product.seo_description || ''} onChange={e => update('seo_description', e.target.value)} rows={2} className="input" placeholder="Leave blank for auto-generated" />
          </Field>
        </Section>

        {/* Flags */}
        <Section title="Flags & Sorting">
          <div className="grid grid-cols-3 gap-4">
            <Field label="Sales Rank">
              <input type="number" value={product.sales_rank || ''} onChange={e => update('sales_rank', e.target.value)} className="input" placeholder="Auto via sync" />
            </Field>
            <Field label="Sort Order">
              <input type="number" value={product.sort_order} onChange={e => update('sort_order', parseInt(e.target.value) || 0)} className="input" />
            </Field>
          </div>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={product.is_bestseller} onChange={e => update('is_bestseller', e.target.checked)} className="rounded" />
              Bestseller
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={product.is_new} onChange={e => update('is_new', e.target.checked)} className="rounded" />
              New
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={product.featured} onChange={e => update('featured', e.target.checked)} className="rounded" />
              Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={product.active} onChange={e => update('active', e.target.checked)} className="rounded" />
              Active
            </label>
          </div>
        </Section>

        {/* Save */}
        <div className="flex items-center gap-4 pb-8">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition">
            {saving ? 'Saving...' : 'Save Product'}
          </button>
          {message && <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>{message}</span>}
        </div>
      </form>

      <style jsx>{`
        .input { @apply w-full border rounded-lg px-3 py-2 text-sm; }
      `}</style>
    </AdminLayout>
  )
}

function Section({ title, children }) {
  return (
    <fieldset className="bg-white rounded-xl border p-6 space-y-4">
      <legend className="text-sm font-semibold text-neutral-700 px-2">{title}</legend>
      {children}
    </fieldset>
  )
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
