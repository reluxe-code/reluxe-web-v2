// components/SeoJsonLd.js
export default function SeoJsonLd({ data }) {
  const json = Array.isArray(data) ? data : [data]
  return json.map((obj, i) => (
    <script
      key={i}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(obj) }}
    />
  ))
}
