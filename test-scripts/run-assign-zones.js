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

function getZoneFromState(state) {
  if (!state) return null
  const s = String(state).trim().toLowerCase()
  const north = ["jammu & kashmir","ladakh","himachal pradesh","punjab","haryana","delhi","uttarakhand","uttar pradesh","rajasthan"]
  const west = ["gujarat","maharashtra","goa","madhya pradesh"]
  const east = ["bihar","jharkhand","west bengal","odisha","assam","arunachal pradesh","meghalaya","manipur","mizoram","nagaland","tripura","sikkim"]
  const south = ["karnataka","kerala","tamil nadu","telangana","andhra pradesh"]
  if (north.includes(s)) return 'NORTH'
  if (west.includes(s)) return 'WEST'
  if (east.includes(s)) return 'EAST'
  if (south.includes(s)) return 'SOUTH'
  return null
}

async function normalizeZoneName(name) {
  if (!name) return null
  let s = String(name).trim()
  s = s.replace(/\bzone\b\.?$/i, "")
  s = s.replace(/\s+/g, " ").trim()
  if (/^\d+$/.test(s)) return s
  const lower = s.toLowerCase()
  if (['north','north zone','northern'].includes(lower)) return 'NORTH'
  if (['west','west zone','western'].includes(lower)) return 'WEST'
  if (['east','east zone','eastern'].includes(lower)) return 'EAST'
  if (['south','south zone','southern'].includes(lower)) return 'SOUTH'
  return s.toUpperCase()
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
  const users = db.collection('users')
  const zones = db.collection('zones')

  const cursor = users.find({ role: 'CA' })
  let updated = 0
  const samples = []
  while (await cursor.hasNext()) {
    const u = await cursor.next()
    if (!u) continue
    const zoneRaw = getZoneFromState(u.state) || (u.state || u.zone || null)
    let zone = null
    if (zoneRaw) zone = await normalizeZoneName(zoneRaw)
    if (!zone) zone = u.zone || 'INTERNATIONAL'

    let zoneHeadId = u.zoneHeadId || null
    let zoneHeadName = u.zoneHeadName || null

    // try by zones collection
    const zdoc = await zones.findOne({ name: zone })
    if (zdoc && zdoc.headUserId) {
      zoneHeadId = String(zdoc.headUserId)
      zoneHeadName = zdoc.headName || zoneHeadName
    }

    // fallback: find a user with role ZONE_HEAD whose canonical zone matches
    if (!zoneHeadId) {
      const zhs = await users.find({ role: 'ZONE_HEAD' }).toArray()
      for (const zh of zhs) {
        const zhRaw = getZoneFromState(zh.state) || zh.zone || null
        const zhZone = zhRaw ? await normalizeZoneName(zhRaw) : null
        if (zhZone === zone) {
          zoneHeadId = String(zh._id)
          zoneHeadName = zh.fullName || zh.email
          // ensure zone-head's zone is canonicalized in DB
          if (zh.zone !== zone) {
            await users.updateOne({ _id: zh._id }, { $set: { zone } })
          }
          break
        }
      }
    }

    const set = { zone, updatedAt: new Date() }
    if (zoneHeadId) set.zoneHeadId = zoneHeadId
    if (zoneHeadName) set.zoneHeadName = zoneHeadName

    await users.updateOne({ _id: u._id }, { $set: set })
    if (zoneHeadId) updated += 1
    if (samples.length < 5) samples.push({ email: u.email, zone, zoneHeadId, zoneHeadName })
  }

  console.log('Backfill updated count:', updated)
  console.log('Samples:', samples)
  await client.close()
}

main().catch(e => { console.error(e); process.exit(3) })
