import { useState, useMemo, useEffect } from "react"
import { CATEGORIES, resources } from "./resourcesData"

const LOCATIONS = [
  { key: "ALL", en: "All Regions", es: "Todas las Regiones" },
  { key: "HN", en: "🇭🇳 Honduras", es: "🇭🇳 Honduras" },
  { key: "US", en: "🇺🇸 USA", es: "🇺🇸 EE.UU." },
  { key: "INT", en: "🌍 International", es: "🌍 Internacional" },
]

const TAG_LABELS = {
  emergency: { en: "Emergency Support", es: "Apoyo de Emergencia", color: "#ef4444" },
  immediate: { en: "Immediate Help", es: "Ayuda Inmediata", color: "#f59e0b" },
  "long-term": { en: "Long-Term Growth", es: "Crecimiento a Largo Plazo", color: "#10b981" },
  family: { en: "Family", es: "Familia", color: "#6366f1" },
  income: { en: "Income", es: "Ingresos", color: "#0ea5e9" },
  debt: { en: "Debt Help", es: "Ayuda con Deudas", color: "#8b5cf6" },
}

function getPrimaryTag(tags) {
  if (tags.includes("emergency")) return "emergency"
  if (tags.includes("immediate")) return "immediate"
  if (tags.includes("long-term")) return "long-term"
  return tags[0] || "immediate"
}

function ResourceCard({ resource, lang }) {
  const isEs = lang === "ES"
  const name = isEs ? resource.nameEs : resource.name
  const desc = isEs ? resource.descEs : resource.descEn
  const reason = isEs ? resource.reasonEs : resource.reasonEn
  const primaryTag = getPrimaryTag(resource.tags)
  const tagInfo = TAG_LABELS[primaryTag] || TAG_LABELS["immediate"]
  const tagLabel = isEs ? tagInfo.es : tagInfo.en

  const availLabels = { 
    HN: "🇭🇳 HN", 
    US: "🇺🇸 US", 
    INT: "🌍 INT", 
    "HN,US": "🇭🇳 HN / 🇺🇸 US" 
  }

  return (
    <div className="resource-card">
      <div className="resource-card-header">
        <div className="resource-card-name">{name}</div>
        <div className="resource-avail-badge">{availLabels[resource.availability]}</div>
      </div>
      <div className="resource-tag-row">
        <span className="resource-tag-pill" style={{ background: tagInfo.color + "18", color: tagInfo.color, border: `1px solid ${tagInfo.color}40` }}>
          {primaryTag === "emergency" ? "🚨" : primaryTag === "immediate" ? "⚡" : "🌱"} {tagLabel}
        </span>
      </div>
      <p className="resource-desc">{desc}</p>
      <div className="resource-why">
        <span className="resource-why-icon">💡</span>
        <span>{reason}</span>
      </div>
      <div className="resource-tools">
        <span className="resource-tools-label">🛠️ {isEs ? "Herramientas:" : "Tools:"}</span>
        <span className="resource-tools-list">{resource.tools}</span>
      </div>

      <div className="resource-pros-cons">
        <div className="resource-pc-col">
          <div className="resource-pc-title pros">✅ {isEs ? "Pros" : "Pros"}</div>
          <ul className="resource-pc-list">
            {(isEs ? resource.prosEs : resource.prosEn).map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        <div className="resource-pc-col">
          <div className="resource-pc-title cons">❌ {isEs ? "Contras" : "Cons"}</div>
          <ul className="resource-pc-list">
            {(isEs ? resource.consEs : resource.consEn).map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </div>

      <div className="resource-access">
        {resource.website && (
          <a href={resource.website} target="_blank" rel="noopener noreferrer" className="resource-link">
            🔗 {isEs ? "Visitar sitio" : "Visit site"}
          </a>
        )}
        {resource.phone && (
          <span className="resource-phone">📞 {resource.phone}</span>
        )}
        {resource.address && (
          <span className="resource-phone">📍 {resource.address}</span>
        )}
      </div>
      <div className="resource-cost-badge">✅ {isEs ? "GRATIS" : "FREE"}</div>
    </div>
  )
}

function CategorySection({ cat, items, lang, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false)
  const isEs = lang === "ES"
  const label = isEs ? cat.es : cat.en

  return (
    <div className={`resources-category${open ? " open" : ""}`}>
      <button className="resources-cat-header" onClick={() => setOpen(o => !o)}>
        <span className="resources-cat-icon">{cat.icon}</span>
        <span className="resources-cat-label">{label}</span>
        <span className="resources-cat-count">{items.length}</span>
        <span className="resources-cat-chevron">{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="resources-cat-body">
          {items.map(r => <ResourceCard key={r.id} resource={r} lang={lang} />)}
        </div>
      )}
    </div>
  )
}

export default function AdditionalResources({ lang = "ES", userContext = {} }) {
  const isEs = lang === "ES"
  const [search, setSearch] = useState("")
  
  const defaultLoc = userContext.country === "HN" || userContext.country === "US" ? userContext.country : "ALL"
  const [locFilter, setLocFilter] = useState(defaultLoc)
  const [catFilter, setCatFilter] = useState("ALL")

  useEffect(() => {
    const newLoc = userContext.country === "HN" || userContext.country === "US" ? userContext.country : "ALL"
    setLocFilter(newLoc)
  }, [userContext.country])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
      return resources.filter(r => {
        const matchLoc = locFilter === "ALL" || 
                         (locFilter === "INT" ? r.availability === "INT" : (r.availability === "INT" || r.availability.includes(locFilter)))
      const matchCat = catFilter === "ALL" || r.category === catFilter
      const matchSearch = !q ||
        r.name.toLowerCase().includes(q) ||
        r.nameEs.toLowerCase().includes(q) ||
        r.descEn.toLowerCase().includes(q) ||
        r.descEs.toLowerCase().includes(q)
      return matchLoc && matchCat && matchSearch
    })
  }, [search, locFilter, catFilter])

  const grouped = useMemo(() => {
    return CATEGORIES.map(cat => ({
      cat,
      items: filtered.filter(r => r.category === cat.key)
    })).filter(g => g.items.length > 0)
  }, [filtered])

  const totalCount = filtered.length

  return (
    <section className="resources-section no-print" id="additional-resources">
      <div className="resources-inner">
        {/* Banner */}
        <div className="resources-banner">
          <div className="resources-banner-text">
            <h2 className="resources-title">
              {isEs ? "Recursos Adicionales" : "Additional Resources"}
            </h2>
            <p className="resources-microcopy">
              {isEs
                ? "Estos recursos son completamente gratuitos y estan disenados para apoyarte. La disponibilidad puede variar segun tu ubicacion."
                : "These resources are completely free and designed to support your progress. Availability may vary by location."}
            </p>
          </div>
          <div className="resources-disclaimer">
            <span>⚠️ {isEs ? "No controlamos estos servicios. Verifica disponibilidad localmente." : "We do not control these services. Please verify availability locally."}</span>
          </div>
        </div>

        {/* Search + Filters */}
        <div className="resources-controls">
          <div className="resources-search-wrap">
            <span className="resources-search-icon">🔍</span>
            <input
              className="resources-search"
              placeholder={isEs ? "Encuentra ayuda cerca de ti..." : "Find help near you..."}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button className="resources-search-clear" onClick={() => setSearch("")}>✕</button>}
          </div>
          <div className="resources-filters">
            <div className="resources-filter-group">
              <span className="resources-filter-label">{isEs ? "Ubicacion:" : "Location:"}</span>
              {LOCATIONS.map(l => (
                <button
                  key={l.key}
                  className={`resources-filter-btn${locFilter === l.key ? " active" : ""}`}
                  onClick={() => setLocFilter(l.key)}
                >{isEs ? l.es : l.en}</button>
              ))}
            </div>
            <div className="resources-filter-group">
              <span className="resources-filter-label">{isEs ? "Categoria:" : "Category:"}</span>
              <button className={`resources-filter-btn${catFilter === "ALL" ? " active" : ""}`} onClick={() => setCatFilter("ALL")}>
                {isEs ? "Todas" : "All"}
              </button>
              {CATEGORIES.map(c => (
                <button
                  key={c.key}
                  className={`resources-filter-btn${catFilter === c.key ? " active" : ""}`}
                  onClick={() => setCatFilter(c.key)}
                >{c.icon}</button>
              ))}
            </div>
          </div>
          {(search || locFilter !== "ALL" || catFilter !== "ALL") && (
            <div className="resources-result-count">
              {isEs ? `${totalCount} recurso(s) encontrado(s)` : `${totalCount} resource(s) found`}
            </div>
          )}
        </div>

        {/* Categories */}
        {grouped.length === 0 ? (
          <div className="resources-empty">
            <span>🔎</span>
            <p>{isEs ? "No se encontraron recursos con ese filtro." : "No resources found for that filter."}</p>
          </div>
        ) : (
          <div className="resources-categories">
            {grouped.map(({ cat, items }, i) => (
              <CategorySection key={cat.key} cat={cat} items={items} lang={lang} defaultOpen={i === 0} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
