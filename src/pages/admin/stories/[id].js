import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import AdminLayout from '@/components/admin/AdminLayout'
import ImageUpload from '@/components/admin/ImageUpload'
import { supabase } from '@/lib/supabase'

function slugify(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const EMPTY_STORY = {
  slug: '',
  status: 'draft',
  person_name: '',
  person_title: '',
  person_image: '',
  title: '',
  subtitle: '',
  hero_image: '',
  hero_video_url: '',
  intro: '',
  body_html: '',
  treatments: [],
  social_embeds: [],
  gallery: [],
  cta_text: 'Book Your Consultation',
  cta_link: '/start/not-sure',
  meta_description: '',
  og_image: '',
  sort_order: 0,
  featured: false,
}

const EMPTY_TREATMENT = { date: '', treatment: '', slug: '', description: '', images: [], embeds: [] }
const EMPTY_TREATMENT_EMBED = { platform: 'instagram', url: '', caption: '' }
const EMPTY_TREATMENT_IMAGE = { url: '', caption: '' }
const EMPTY_EMBED = { platform: 'instagram', url: '', caption: '' }
const EMPTY_GALLERY = { url: '', caption: '', alt: '', type: 'journey' }
const EMPTY_LIFESTYLE = { url: '', caption: '', alt: '', type: 'lifestyle' }

const SERVICE_SLUGS = [
  '', 'tox', 'filler', 'sculptra', 'morpheus8', 'microneedling', 'ipl',
  'laser-hair-removal', 'hydrafacial', 'glo2facial', 'facials', 'massage',
  'skinpen', 'opus', 'clearlift', 'co2', 'body-contouring',
]

/* ─── Reusable section wrapper ─── */
function Section({ title, children }) {
  return (
    <fieldset className="border border-neutral-200 rounded-xl p-5 space-y-4">
      <legend className="px-2 text-sm font-semibold text-neutral-600">{title}</legend>
      {children}
    </fieldset>
  )
}

/* ─── Single field components ─── */
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">{label}</label>
      {children}
    </div>
  )
}

function Input({ value, onChange, ...props }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none"
      {...props}
    />
  )
}

function TextArea({ value, onChange, rows = 4, mono, ...props }) {
  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-black outline-none ${mono ? 'font-mono' : ''}`}
      {...props}
    />
  )
}

export default function AdminStoryEdit() {
  const router = useRouter()
  const { id } = router.query
  const isNew = id === 'new'

  const [story, setStory] = useState(EMPTY_STORY)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!id || isNew) return
    async function load() {
      const { data } = await supabase.from('stories').select('*').eq('id', id).limit(1)
      if (data?.[0]) setStory(data[0])
      setLoading(false)
    }
    load()
  }, [id, isNew])

  function updateField(field, value) {
    setStory((prev) => {
      const updated = { ...prev, [field]: value }
      if (field === 'person_name' && (isNew || !prev.slug)) {
        updated.slug = slugify(value)
      }
      return updated
    })
  }

  /* ─── JSONB array helpers ─── */
  function updateArrayItem(field, index, key, value) {
    setStory((prev) => {
      const arr = [...(prev[field] || [])]
      arr[index] = { ...arr[index], [key]: value }
      return { ...prev, [field]: arr }
    })
  }

  function addArrayItem(field, template) {
    setStory((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), { ...template }],
    }))
  }

  function removeArrayItem(field, index) {
    setStory((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }))
  }

  function moveArrayItem(field, from, to) {
    setStory((prev) => {
      const arr = [...(prev[field] || [])]
      if (to < 0 || to >= arr.length) return prev
      const [item] = arr.splice(from, 1)
      arr.splice(to, 0, item)
      return { ...prev, [field]: arr }
    })
  }

  /* ─── Typed gallery helpers (lifestyle vs journey within single gallery array) ─── */
  function getGalleryRealIndex(type, filteredIndex) {
    const all = story.gallery || []
    let count = -1
    for (let i = 0; i < all.length; i++) {
      const isLifestyle = all[i].type === 'lifestyle'
      if ((type === 'lifestyle' && isLifestyle) || (type !== 'lifestyle' && !isLifestyle)) {
        count++
        if (count === filteredIndex) return i
      }
    }
    return -1
  }

  function addGalleryItem(type) {
    const template = type === 'lifestyle' ? EMPTY_LIFESTYLE : EMPTY_GALLERY
    addArrayItem('gallery', template)
  }

  function updateGalleryItem(type, filteredIndex, key, value) {
    const realIndex = getGalleryRealIndex(type, filteredIndex)
    if (realIndex >= 0) updateArrayItem('gallery', realIndex, key, value)
  }

  function removeGalleryItem(type, filteredIndex) {
    const realIndex = getGalleryRealIndex(type, filteredIndex)
    if (realIndex >= 0) removeArrayItem('gallery', realIndex)
  }

  /* ─── Nested array helpers (e.g. treatments[i].embeds, treatments[i].images) ─── */
  function addNestedItem(field, index, nestedKey, template) {
    setStory((prev) => {
      const arr = [...(prev[field] || [])]
      arr[index] = { ...arr[index], [nestedKey]: [...(arr[index][nestedKey] || []), { ...template }] }
      return { ...prev, [field]: arr }
    })
  }

  function updateNestedItem(field, index, nestedKey, nestedIndex, key, value) {
    setStory((prev) => {
      const arr = [...(prev[field] || [])]
      const nested = [...(arr[index][nestedKey] || [])]
      nested[nestedIndex] = { ...nested[nestedIndex], [key]: value }
      arr[index] = { ...arr[index], [nestedKey]: nested }
      return { ...prev, [field]: arr }
    })
  }

  function removeNestedItem(field, index, nestedKey, nestedIndex) {
    setStory((prev) => {
      const arr = [...(prev[field] || [])]
      arr[index] = { ...arr[index], [nestedKey]: (arr[index][nestedKey] || []).filter((_, i) => i !== nestedIndex) }
      return { ...prev, [field]: arr }
    })
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const payload = { ...story }
    delete payload.created_at
    if (isNew) delete payload.id
    payload.updated_at = new Date().toISOString()

    let result
    if (isNew) {
      result = await supabase.from('stories').insert(payload).select()
    } else {
      const sid = payload.id
      delete payload.id
      result = await supabase.from('stories').update(payload).eq('id', sid).select()
    }

    if (result.error) {
      setMessage(`Error: ${result.error.message}`)
    } else {
      setMessage('Saved!')
      if (isNew && result.data?.[0]?.id) {
        router.replace(`/admin/stories/${result.data[0].id}`)
      }
    }
    setSaving(false)
  }

  if (loading) {
    return <AdminLayout><p className="text-neutral-500">Loading...</p></AdminLayout>
  }

  const treatments = story.treatments || []
  const socialEmbeds = story.social_embeds || []
  const allGallery = story.gallery || []
  const lifestyleGallery = allGallery.filter((g) => g.type === 'lifestyle')
  const journeyGallery = allGallery.filter((g) => g.type !== 'lifestyle')

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{isNew ? 'New Story' : `Edit: ${story.person_name}`}</h1>
        <div className="flex items-center gap-3">
          {!isNew && (
            <a href={`/stories/${story.slug}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
              View on site
            </a>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {message && (
            <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
              {message}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-4xl space-y-6">

        {/* ─── Basic Info ─── */}
        <Section title="Basic Info">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Person Name *">
              <Input value={story.person_name} onChange={(v) => updateField('person_name', v)} required />
            </Field>
            <Field label="Person Title">
              <Input value={story.person_title} onChange={(v) => updateField('person_title', v)} placeholder="e.g. Indy Ignite Guard | Purdue NIL" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Page Title *">
              <Input value={story.title} onChange={(v) => updateField('title', v)} required placeholder="e.g. Blake's RELUXE Journey" />
            </Field>
            <Field label="Subtitle">
              <Input value={story.subtitle} onChange={(v) => updateField('subtitle', v)} placeholder="e.g. How a pro athlete keeps her skin camera-ready" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Slug">
              <Input value={story.slug} onChange={(v) => updateField('slug', v)} className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:ring-2 focus:ring-black outline-none" />
            </Field>
            <Field label="Status">
              <select
                value={story.status}
                onChange={(e) => updateField('status', e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </Field>
            <Field label="Sort Order">
              <input
                type="number"
                value={story.sort_order ?? 0}
                onChange={(e) => updateField('sort_order', parseInt(e.target.value) || 0)}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </Field>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={story.featured || false}
              onChange={(e) => updateField('featured', e.target.checked)}
            />
            Featured on homepage
          </label>
        </Section>

        {/* ─── Images ─── */}
        <Section title="Images">
          <div className="grid grid-cols-2 gap-6">
            <ImageUpload
              value={story.person_image}
              onChange={(url) => updateField('person_image', url)}
              folder="stories"
              label="Person Image (headshot)"
            />
            <ImageUpload
              value={story.hero_image}
              onChange={(url) => updateField('hero_image', url)}
              folder="stories"
              label="Hero Image"
            />
          </div>
          <Field label="Hero Video URL (YouTube/Vimeo — future)">
            <Input value={story.hero_video_url} onChange={(v) => updateField('hero_video_url', v)} placeholder="https://youtube.com/embed/..." />
          </Field>
        </Section>

        {/* ─── Content ─── */}
        <Section title="Content">
          <Field label="Intro (opening narrative)">
            <TextArea value={story.intro} onChange={(v) => updateField('intro', v)} rows={5} />
          </Field>
          <Field label="Body (HTML)">
            <TextArea value={story.body_html} onChange={(v) => updateField('body_html', v)} rows={12} mono />
          </Field>
        </Section>

        {/* ─── Treatment Timeline ─── */}
        <Section title="Treatment Timeline">
          {treatments.map((t, i) => {
            const tImages = t.images || (t.image_url ? [{ url: t.image_url, caption: '' }] : [])
            const tEmbeds = t.embeds || []
            return (
            <div key={i} className="border border-neutral-200 rounded-xl p-5 space-y-4 relative">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-neutral-600">Treatment {i + 1}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveArrayItem('treatments', i, i - 1)} disabled={i === 0} className="text-xs text-neutral-400 hover:text-neutral-600 disabled:opacity-30 px-1">&uarr;</button>
                  <button type="button" onClick={() => moveArrayItem('treatments', i, i + 1)} disabled={i === treatments.length - 1} className="text-xs text-neutral-400 hover:text-neutral-600 disabled:opacity-30 px-1">&darr;</button>
                  <button type="button" onClick={() => removeArrayItem('treatments', i)} className="text-xs text-red-500 hover:text-red-700 px-1 ml-2">Remove</button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Date">
                  <Input value={t.date} onChange={(v) => updateArrayItem('treatments', i, 'date', v)} placeholder="March 2026" />
                </Field>
                <Field label="Treatment Name">
                  <Input value={t.treatment} onChange={(v) => updateArrayItem('treatments', i, 'treatment', v)} placeholder="Daxxify" />
                </Field>
                <Field label="Service Slug">
                  <select
                    value={t.slug || ''}
                    onChange={(e) => updateArrayItem('treatments', i, 'slug', e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {SERVICE_SLUGS.map((s) => (
                      <option key={s} value={s}>{s || '(none)'}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Description">
                <TextArea value={t.description} onChange={(v) => updateArrayItem('treatments', i, 'description', v)} rows={2} />
              </Field>

              {/* ── Images & Videos ── */}
              <div className="border-t border-neutral-100 pt-3">
                <p className="text-xs font-semibold text-neutral-500 mb-2">Photos & Videos</p>
                {tImages.map((img, j) => (
                  <div key={j} className="flex items-start gap-3 mb-3 bg-neutral-50 rounded-lg p-3">
                    <div className="flex-1">
                      <ImageUpload
                        value={img.url}
                        onChange={(url) => updateNestedItem('treatments', i, 'images', j, 'url', url)}
                        folder="stories"
                        label={`Media ${j + 1}`}
                        accept="image/*,video/*"
                      />
                      <div className="mt-2">
                        <Input value={img.caption} onChange={(v) => updateNestedItem('treatments', i, 'images', j, 'caption', v)} placeholder="Caption (optional)" />
                      </div>
                    </div>
                    <button type="button" onClick={() => removeNestedItem('treatments', i, 'images', j)} className="text-xs text-red-500 hover:text-red-700 mt-1">Remove</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addNestedItem('treatments', i, 'images', EMPTY_TREATMENT_IMAGE)}
                  className="px-3 py-1.5 border border-dashed rounded-lg text-xs font-medium text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition"
                >
                  + Add Photo or Video
                </button>
              </div>

              {/* ── Social Embeds ── */}
              <div className="border-t border-neutral-100 pt-3">
                <p className="text-xs font-semibold text-neutral-500 mb-2">Social Embeds (Instagram, TikTok, YouTube)</p>
                {tEmbeds.map((emb, j) => (
                  <div key={j} className="flex items-start gap-3 mb-3 bg-neutral-50 rounded-lg p-3">
                    <div className="flex-1 space-y-2">
                      <div className="grid grid-cols-4 gap-2">
                        <select
                          value={emb.platform || 'instagram'}
                          onChange={(ev) => updateNestedItem('treatments', i, 'embeds', j, 'platform', ev.target.value)}
                          className="border rounded-lg px-2 py-1.5 text-xs"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="tiktok">TikTok</option>
                          <option value="youtube">YouTube</option>
                        </select>
                        <div className="col-span-3">
                          <Input value={emb.url} onChange={(v) => updateNestedItem('treatments', i, 'embeds', j, 'url', v)} placeholder="https://www.instagram.com/reel/..." />
                        </div>
                      </div>
                      <Input value={emb.caption} onChange={(v) => updateNestedItem('treatments', i, 'embeds', j, 'caption', v)} placeholder="Caption (optional)" />
                    </div>
                    <button type="button" onClick={() => removeNestedItem('treatments', i, 'embeds', j)} className="text-xs text-red-500 hover:text-red-700 mt-1">Remove</button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addNestedItem('treatments', i, 'embeds', EMPTY_TREATMENT_EMBED)}
                  className="px-3 py-1.5 border border-dashed rounded-lg text-xs font-medium text-neutral-400 hover:border-neutral-400 hover:text-neutral-600 transition"
                >
                  + Add Social Embed
                </button>
              </div>
            </div>
            )
          })}
          <button
            type="button"
            onClick={() => addArrayItem('treatments', EMPTY_TREATMENT)}
            className="px-4 py-2 border border-dashed rounded-lg text-sm font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition w-full"
          >
            + Add Treatment
          </button>
        </Section>

        {/* ─── Social Embeds ─── */}
        <Section title="Social Embeds">
          <p className="text-xs text-neutral-400 -mt-2">Paste Instagram, TikTok, or YouTube URLs. They'll render as native embeds on the public page.</p>
          {socialEmbeds.map((e, i) => (
            <div key={i} className="border border-neutral-100 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-neutral-400">Embed {i + 1}</span>
                <div className="flex gap-1">
                  <button type="button" onClick={() => moveArrayItem('social_embeds', i, i - 1)} disabled={i === 0} className="text-xs text-neutral-400 hover:text-neutral-600 disabled:opacity-30 px-1">&uarr;</button>
                  <button type="button" onClick={() => moveArrayItem('social_embeds', i, i + 1)} disabled={i === socialEmbeds.length - 1} className="text-xs text-neutral-400 hover:text-neutral-600 disabled:opacity-30 px-1">&darr;</button>
                  <button type="button" onClick={() => removeArrayItem('social_embeds', i)} className="text-xs text-red-500 hover:text-red-700 px-1 ml-2">Remove</button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <Field label="Platform">
                  <select
                    value={e.platform || 'instagram'}
                    onChange={(ev) => updateArrayItem('social_embeds', i, 'platform', ev.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                  </select>
                </Field>
                <div className="col-span-3">
                  <Field label="URL">
                    <Input value={e.url} onChange={(v) => updateArrayItem('social_embeds', i, 'url', v)} placeholder="https://www.instagram.com/reel/..." />
                  </Field>
                </div>
              </div>
              <Field label="Caption (optional)">
                <Input value={e.caption} onChange={(v) => updateArrayItem('social_embeds', i, 'caption', v)} />
              </Field>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('social_embeds', EMPTY_EMBED)}
            className="px-4 py-2 border border-dashed rounded-lg text-sm font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition w-full"
          >
            + Add Social Embed
          </button>
        </Section>

        {/* ─── Gallery ─── */}
        <Section title="Lifestyle Gallery — Who They Are">
          <p className="text-xs text-neutral-400 -mt-2 mb-3">Personal or professional photos showing who this person is outside of RELUXE.</p>
          <div className="grid grid-cols-2 gap-4">
            {lifestyleGallery.map((g, i) => (
              <div key={i} className="border border-neutral-100 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400">Lifestyle {i + 1}</span>
                  <button type="button" onClick={() => removeGalleryItem('lifestyle', i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
                <ImageUpload
                  value={g.url}
                  onChange={(url) => updateGalleryItem('lifestyle', i, 'url', url)}
                  folder="stories"
                  label="Photo or Video"
                  accept="image/*,video/*"
                />
                <Field label="Caption">
                  <Input value={g.caption} onChange={(v) => updateGalleryItem('lifestyle', i, 'caption', v)} />
                </Field>
                <Field label="Alt Text">
                  <Input value={g.alt} onChange={(v) => updateGalleryItem('lifestyle', i, 'alt', v)} />
                </Field>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addGalleryItem('lifestyle')}
            className="px-4 py-2 border border-dashed rounded-lg text-sm font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition w-full"
          >
            + Add Lifestyle Photo
          </button>
        </Section>

        <Section title="RELUXE Journey Gallery">
          <p className="text-xs text-neutral-400 -mt-2 mb-3">Treatment photos, before &amp; after, in-clinic images and videos.</p>
          <div className="grid grid-cols-2 gap-4">
            {journeyGallery.map((g, i) => (
              <div key={i} className="border border-neutral-100 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-400">Journey {i + 1}</span>
                  <button type="button" onClick={() => removeGalleryItem('journey', i)} className="text-xs text-red-500 hover:text-red-700">Remove</button>
                </div>
                <ImageUpload
                  value={g.url}
                  onChange={(url) => updateGalleryItem('journey', i, 'url', url)}
                  folder="stories"
                  label="Photo or Video"
                  accept="image/*,video/*"
                />
                <Field label="Caption">
                  <Input value={g.caption} onChange={(v) => updateGalleryItem('journey', i, 'caption', v)} />
                </Field>
                <Field label="Alt Text">
                  <Input value={g.alt} onChange={(v) => updateGalleryItem('journey', i, 'alt', v)} />
                </Field>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addGalleryItem('journey')}
            className="px-4 py-2 border border-dashed rounded-lg text-sm font-medium text-neutral-500 hover:border-neutral-400 hover:text-neutral-700 transition w-full"
          >
            + Add Journey Photo or Video
          </button>
        </Section>

        {/* ─── CTA ─── */}
        <Section title="Call to Action">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Button Text">
              <Input value={story.cta_text} onChange={(v) => updateField('cta_text', v)} />
            </Field>
            <Field label="Button Link">
              <Input value={story.cta_link} onChange={(v) => updateField('cta_link', v)} placeholder="/start/not-sure" />
            </Field>
          </div>
        </Section>

        {/* ─── SEO ─── */}
        <Section title="SEO">
          <Field label="Meta Description">
            <TextArea value={story.meta_description} onChange={(v) => updateField('meta_description', v)} rows={3} />
          </Field>
          <ImageUpload
            value={story.og_image}
            onChange={(url) => updateField('og_image', url)}
            folder="stories"
            label="OG Image"
          />
        </Section>

        {/* ─── Save ─── */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800 disabled:opacity-50 transition"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          {message && (
            <span className={`text-sm ${message.startsWith('Error') ? 'text-red-500' : 'text-emerald-600'}`}>
              {message}
            </span>
          )}
        </div>
      </form>
    </AdminLayout>
  )
}

AdminStoryEdit.getLayout = (page) => page
