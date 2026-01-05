export const NORTH = [
  "Jammu & Kashmir",
  "Ladakh",
  "Himachal Pradesh",
  "Punjab",
  "Haryana",
  "Chandigarh",
  "Delhi",
  "Uttarakhand",
  "Uttar Pradesh",
  "Rajasthan",
]

export const WEST = [
  "Gujarat",
  "Maharashtra",
  "Goa",
  "Madhya Pradesh",
]

export const EAST = [
  "Bihar",
  "Jharkhand",
  "West Bengal",
  "Odisha",
  "Assam",
  "Arunachal Pradesh",
  "Meghalaya",
  "Manipur",
  "Mizoram",
  "Nagaland",
  "Tripura",
  "Sikkim",
]

export const SOUTH = [
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Telangana",
  "Andhra Pradesh",
]

export function getZoneFromState(state?: string | null) {
  if (!state) return null
  const s = String(state).trim().toLowerCase()
  if (NORTH.map((x) => x.toLowerCase()).includes(s)) return "NORTH"
  if (WEST.map((x) => x.toLowerCase()).includes(s)) return "WEST"
  if (EAST.map((x) => x.toLowerCase()).includes(s)) return "EAST"
  if (SOUTH.map((x) => x.toLowerCase()).includes(s)) return "SOUTH"
  return null
}

export function normalizeZoneName(name?: string | null) {
  if (!name) return null
  let s = String(name).trim()
  // remove common suffix 'zone' and extra punctuation
  s = s.replace(/\bzone\b\.?$/i, "")
  // collapse whitespace and trim
  s = s.replace(/\s+/g, " ").trim()
  // if numeric prefix like '123' keep as-is (return digits only)
  if (/^\d+$/.test(s)) return s
  // if a single word like 'north' or 'NORTH', normalize to uppercase keyword
  const lower = s.toLowerCase()
  if (lower === 'north' || lower === 'north zone' || lower === 'northern') return 'NORTH'
  if (lower === 'west' || lower === 'west zone' || lower === 'western') return 'WEST'
  if (lower === 'east' || lower === 'east zone' || lower === 'eastern') return 'EAST'
  if (lower === 'south' || lower === 'south zone' || lower === 'southern') return 'SOUTH'
  // fallback: uppercase trimmed value (preserve spaces)
  return s.toUpperCase()
}