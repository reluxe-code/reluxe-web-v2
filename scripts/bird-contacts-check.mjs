import fs from 'fs'

const envContent = fs.readFileSync('.env.local', 'utf8')
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) process.env[match[1].trim()] = match[2].trim()
})

const WORKSPACE_ID = process.env.BIRD_WORKSPACE_ID
const ACCESS_KEY = process.env.BIRD_ACCESS_KEY

const res = await fetch(
  `https://api.bird.com/workspaces/${WORKSPACE_ID}/contacts?limit=3`,
  { headers: { Authorization: `AccessKey ${ACCESS_KEY}`, 'Content-Type': 'application/json' } }
)

const data = await res.json()
if (!res.ok) {
  console.log(`Error ${res.status}:`, JSON.stringify(data, null, 2))
  process.exit(1)
}

console.log(`Total contacts: ${data.total || 'unknown'}`)
const contacts = data.results || []
contacts.forEach((c, i) => {
  console.log(`\n--- Contact ${i + 1} ---`)
  console.log(JSON.stringify(c, null, 2))
})
