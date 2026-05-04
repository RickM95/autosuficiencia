import { resources } from "./resourcesData"

export function matchResources(userData, lang = "ES") {
  const { location = "HN", income = 0, tier = "survival", householdSize = 1, surplus = 0, categories = [], evaluation = {} } = userData
  const { employmentStatus = "", hasDebt = false, stressLevel = "low", goals = [] } = evaluation

  const isDeficit = surplus < 0
  const isUnemployed = employmentStatus === "unemployed" || employmentStatus === "desempleado"
  const isHighStress = stressLevel === "high" || stressLevel === "alto"
  const isLargeFamily = householdSize >= 4
  const foodCat = categories.find(c => c.name === "food" || c.name === "Food")
  const isFoodHigh = foodCat && foodCat.status === "high"

  const filtered = resources.filter(r =>
    r.availability.includes(location) || r.availability === "INT"
  )

  const scored = filtered.map(r => {
    let score = 0

    if (isDeficit) {
      if (r.category === "food") score += 10
      if (r.category === "financial") score += 9
      if (r.category === "housing") score += 8
      if (r.category === "utilities") score += 7
    }
    if (isFoodHigh && r.category === "food") score += 8
    if (isUnemployed && (r.category === "income" || r.category === "education")) score += 9
    if (hasDebt && r.category === "financial") score += 8
    if (isHighStress && r.category === "mental") score += 10
    if (isLargeFamily && (r.category === "food" || r.category === "housing")) score += 5
    if (tier === "survival" && r.tags.includes("emergency")) score += 6
    if (tier === "survival" && r.tags.includes("immediate")) score += 5
    if (tier === "lower-middle" && r.tags.includes("long-term")) score += 3
    if (goals.some(g => g.toLowerCase().includes("educat") || g.toLowerCase().includes("estudi")) && r.category === "education") score += 4

    return { ...r, score }
  })

  scored.sort((a, b) => b.score - a.score)
  const top = scored.filter(r => r.score > 0).slice(0, 10)
  if (top.length < 6) {
    const extras = scored.filter(r => r.score === 0).slice(0, 6 - top.length)
    top.push(...extras)
  }

  let priorityMsg = ""
  if (lang === "ES") {
    if (isDeficit || tier === "survival") {
      priorityMsg = "Segun tu situacion, estos recursos pueden ayudarte a reducir la presion inmediata."
    } else if (isHighStress) {
      priorityMsg = "Tu bienestar es tan importante como tu economia. Estos recursos pueden ayudarte."
    } else {
      priorityMsg = "Estos recursos pueden ayudarte a mejorar y hacer crecer tu estabilidad financiera."
    }
  } else {
    if (isDeficit || tier === "survival") {
      priorityMsg = "Based on your situation, these resources can help reduce immediate pressure."
    } else if (isHighStress) {
      priorityMsg = "Your wellbeing matters as much as your finances. These resources can help."
    } else {
      priorityMsg = "These resources can help you improve and grow your financial stability."
    }
  }

  const tagLabel = (r, lang) => {
    if (r.tags.includes("emergency")) return lang === "ES" ? "Apoyo de Emergencia" : "Emergency Support"
    if (r.tags.includes("immediate")) return lang === "ES" ? "Ayuda Inmediata" : "Immediate Help"
    return lang === "ES" ? "Crecimiento a Largo Plazo" : "Long-Term Growth"
  }

  return {
    priorityMessage: priorityMsg,
    resources: top.map(r => ({
      id: r.id,
      name: lang === "ES" ? r.nameEs : r.name,
      category: r.category,
      description: lang === "ES" ? r.descEs : r.descEn,
      reason: lang === "ES" ? r.reasonEs : r.reasonEn,
      access: { website: r.website, phone: r.phone, address: r.address },
      tag: tagLabel(r, lang),
      cost: r.cost
    }))
  }
}
