const { MongoClient } = require('mongodb')
const fs = require('fs')
const path = require('path')
function loadEnv() {
  if (process.env.MONGODB_URI) return
  try {
    const envPath = path.join(__dirname, '..', '.env')
    const txt = fs.readFileSync(envPath, 'utf8')
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!m) continue
      let [, k, v] = m
      v = v.replace(/^"|"$/g, '').replace(/^'|'$/g, '')
      if (!process.env[k]) process.env[k] = v
    }
  } catch (e) {}
}

async function main() {
  loadEnv()
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI
  if (!uri) {
    console.error('MONGODB_URI not set; aborting')
    process.exit(2)
  }
  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db()
  const zones = db.collection('zones')
  const users = db.collection('users')

  console.log('\nZones with headUserId:\n')
  const zc = await zones.find({ headUserId: { $exists: true, $ne: null } }).toArray()
  console.log(zc.map(z => ({ name: z.name, displayName: z.displayName, headUserId: z.headUserId, headName: z.headName, pinPrefixes: z.pinPrefixes })))

  console.log('\nZone Head users with zone set:\n')
  const zhs = await users.find({ role: 'ZONE_HEAD' }).toArray()
  console.log(zhs.map(u => ({ _id: String(u._id), email: u.email, zone: u.zone, fullName: u.fullName })))

  await client.close()
}

main().catch(e => { console.error(e); process.exit(3) })