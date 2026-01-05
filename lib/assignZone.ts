import { Db } from 'mongodb'
import { getZoneFromState, normalizeZoneName } from './zone'

export async function assignZoneHeadToZone(db: Db, zoneRaw: string) {
  if (!zoneRaw) return { ok: false, updated: 0 }
  const zone = normalizeZoneName(zoneRaw)
  if (!zone) return { ok: false, updated: 0 }

  const users = db.collection('users')
  const zones = db.collection('zones')

  let zoneHeadId: string | null = null
  let zoneHeadName: string | null = null

  // prefer zone document head
  const zdoc = await zones.findOne({ name: zone })
  if (zdoc && zdoc.headUserId) {
    zoneHeadId = String(zdoc.headUserId)
    zoneHeadName = zdoc.headName || null
  } else {
    // fallback: scan zone head users and canonicalize
    const zhs = await users.find({ role: 'ZONE_HEAD' }).toArray()
    for (const zh of zhs) {
      const zhRaw = getZoneFromState(zh.state) || zh.zone || null
      const zhZone = zhRaw ? normalizeZoneName(zhRaw) : null
      if (zhZone === zone) {
        zoneHeadId = String(zh._id)
        zoneHeadName = zh.fullName || zh.email
        if (zh.zone !== zone) await users.updateOne({ _id: zh._id }, { $set: { zone } })
        break
      }
    }
  }

  // update all CAs whose canonical zone matches
  const cursor = users.find({ role: 'CA' })
  let updated = 0
  while (await cursor.hasNext()) {
    const u: any = await cursor.next()
    const uZoneRaw = getZoneFromState(u.state) || u.zone || null
    const uZone = uZoneRaw ? normalizeZoneName(uZoneRaw) : (u.zone ? normalizeZoneName(u.zone) : null)
    if (uZone === zone) {
      const set: any = { zone, updatedAt: new Date() }
      if (zoneHeadId) set.zoneHeadId = zoneHeadId
      if (zoneHeadName) set.zoneHeadName = zoneHeadName
      await users.updateOne({ _id: u._id }, { $set: set })
      updated += 1
    }
  }

  return { ok: true, updated, zoneHeadId, zoneHeadName }
}

export async function assignZonesForAll(db: Db) {
  const users = db.collection('users')
  const zonesSet = new Set<string>()
  const cursor = users.find({ role: 'CA' })
  while (await cursor.hasNext()) {
    const u: any = await cursor.next()
    const zoneRaw = getZoneFromState(u.state) || u.zone || null
    const zone = zoneRaw ? normalizeZoneName(zoneRaw) : null
    if (zone) zonesSet.add(zone)
  }

  let total = 0
  for (const zone of Array.from(zonesSet)) {
    const res = await assignZoneHeadToZone(db, zone)
    total += (res && res.updated) || 0
  }
  return { ok: true, updated: total }
}
