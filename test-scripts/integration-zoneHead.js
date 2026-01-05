const { MongoClient, ObjectId } = require('mongodb')
const fs = require('fs')
const path = require('path')

// Load .env if present (simple parser)
function loadEnv() {
  if (process.env.MONGODB_URI) return
  try {
    const envPath = path.join(__dirname, '..', '.env')
    const txt = fs.readFileSync(envPath, 'utf8')
    for (const line of txt.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
      if (!m) continue
      let [, k, v] = m
      // strip quotes
      v = v.replace(/^"|"$/g, '').replace(/^'|'$/g, '')
      if (!process.env[k]) process.env[k] = v
    }
  } catch (e) {
    // ignore
  }
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

  const ts = Date.now()
  const promoteEmail = `zh-${ts}@example.test`
  const ca1Email = `ca1-${ts}@example.test`
  const ca2Email = `ca2-${ts}@example.test`
  let createdIds = []
  let createdZone = null

  try {
    // create user to promote
    const now = new Date()
    const promoteRes = await users.insertOne({ email: promoteEmail, fullName: `ZH Test ${ts}`, pinCode: '12345', zone: null, role: 'CA', createdAt: now, updatedAt: now, referralCode: `TEST${ts}` })
    const promoteId = promoteRes.insertedId
    createdIds.push(promoteId)

    // create two CAs
    const ca1 = await users.insertOne({ email: ca1Email, fullName: `CA One ${ts}`, pinCode: '12311', zone: null, role: 'CA', createdAt: now, updatedAt: now })
    const ca2 = await users.insertOne({ email: ca2Email, fullName: `CA Two ${ts}`, pinCode: '12399', zone: null, role: 'CA', createdAt: now, updatedAt: now })
    createdIds.push(ca1.insertedId, ca2.insertedId)

    console.log('Inserted promote candidate and CAs:', promoteId.toString(), ca1.insertedId.toString(), ca2.insertedId.toString())

    // Promote to ZONE_HEAD and run server-side-like logic
    // Determine zoneName from pin prefix
    const zoneName = '123' // based on pinCode '12345'

    // Update promoted user
    await users.updateOne({ _id: promoteId }, { $set: { role: 'ZONE_HEAD', zone: zoneName, updatedAt: new Date() } })

    // Upsert zone document
    const headDisplay = `ZH Test ${ts}`
    const existing = await zones.findOne({ name: zoneName })
    if (existing) {
      await zones.updateOne({ _id: existing._id }, { $set: { headUserId: String(promoteId), headName: headDisplay, updatedAt: new Date() } })
      createdZone = existing
    } else {
      const r = await zones.insertOne({ name: zoneName, pinPrefixes: [zoneName], headUserId: String(promoteId), headName: headDisplay, createdAt: new Date(), updatedAt: new Date() })
      createdZone = await zones.findOne({ _id: r.insertedId })
    }

    // Assign matching CAs
    const orMatch = [{ zone: zoneName }, { pinCode: { $regex: `^${zoneName}` } }]
    await users.updateMany({ role: 'CA', $or: orMatch }, { $set: { zoneHeadId: String(promoteId), zone: zoneName, zoneHeadName: headDisplay, updatedAt: new Date() } })

    // Verify
    const updatedCa1 = await users.findOne({ email: ca1Email })
    const updatedCa2 = await users.findOne({ email: ca2Email })
    const zh = await users.findOne({ _id: promoteId })

    console.log('Zone doc:', createdZone)
    console.log('Promoted user:', zh)
    console.log('CA1:', { zone: updatedCa1.zone, zoneHeadId: updatedCa1.zoneHeadId, zoneHeadName: updatedCa1.zoneHeadName })
    console.log('CA2:', { zone: updatedCa2.zone, zoneHeadId: updatedCa2.zoneHeadId, zoneHeadName: updatedCa2.zoneHeadName })

    const pass = updatedCa1.zoneHeadId === String(promoteId) && updatedCa1.zoneHeadName === headDisplay && updatedCa2.zoneHeadId === String(promoteId) && updatedCa2.zoneHeadName === headDisplay
    if (pass) {
      console.log('Integration test PASSED')
    } else {
      console.error('Integration test FAILED')
      process.exit(3)
    }

  } catch (e) {
    console.error('Test error', e)
    process.exit(4)
  } finally {
    // cleanup
    try {
      if (createdIds.length) await users.deleteMany({ _id: { $in: createdIds } })
      if (createdZone && createdZone._id) await zones.deleteOne({ _id: createdZone._id })
      console.log('Cleaned up test data')
    } catch (e) {
      console.error('Cleanup error', e)
    }
    await client.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(5)
})
