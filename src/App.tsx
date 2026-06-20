import React, { useState, useEffect, useMemo } from "react";
import {
  Home, Building2, Store, Search, Heart, MapPin, Bed, Bath, Car, Maximize2,
  SlidersHorizontal, X, Plus, User, LogIn, CheckCircle2, ShieldCheck, Flag, Share2,
  Moon, Sun, ArrowLeft, Calculator, Bell, Eye, Columns, MessageCircle, Trash2, Pencil,
  Zap, Droplet, Lock, Waves, Dumbbell, ArrowUpDown, ChevronRight, Sparkles, Wallet,
  BellRing, Camera, DollarSign, Sofa, Wind, Building, Trees, Check, Map as MapIcon,
  TrendingUp, LogOut, ChevronDown
} from "lucide-react";

// ---------- almacenamiento ----------
const sget = async (k, def) => { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : def; } catch { return def; } };
const sset = async (k, v) => { try { await window.storage.set(k, JSON.stringify(v)); } catch (e) { console.error(e); } };

const FX = 60;
const fmt = (n) => new Intl.NumberFormat("es-DO").format(n);
const toRD = (p) => (p.moneda === "US$" ? p.precio * FX : p.precio);

// ---------- amenidades / cercanías (Baní) ----------
const AMENIDADES = [
  { k: "planta", label: "Planta / Inversor", icon: Zap },
  { k: "cisterna", label: "Cisterna / Tinaco", icon: Droplet },
  { k: "pozo", label: "Pozo tubular", icon: Droplet },
  { k: "seguridad", label: "Seguridad / Verja", icon: Lock },
  { k: "parqueo_techado", label: "Parqueo techado", icon: Car },
  { k: "piscina", label: "Piscina", icon: Waves },
  { k: "patio", label: "Patio / Solar", icon: Trees },
  { k: "ac", label: "Aire acondicionado", icon: Wind },
  { k: "amueblado", label: "Amueblado", icon: Sofa },
  { k: "balcon", label: "Balcón / Galería", icon: Building },
];
const amenLabel = (k) => AMENIDADES.find((a) => a.k === k)?.label || k;
const amenIcon = (k) => AMENIDADES.find((a) => a.k === k)?.icon || Check;
const CERCANIAS = ["Parque Central", "Carretera Sánchez", "Supermercado", "Hospital Regla", "Escuelas / Liceos", "Universidad (UASD)", "Playa Los Almendros", "Las Salinas"];

const TIPOS = [{ k: "casa", label: "Casa", icon: Home }, { k: "apto", label: "Apartamento", icon: Building2 }, { k: "local", label: "Local", icon: Store }];
const tipoLabel = (k) => TIPOS.find((t) => t.k === k)?.label || k;
const tipoIcon = (k) => TIPOS.find((t) => t.k === k)?.icon || Home;

// ---------- geografía de Peravia (lat/lng reales aprox.) ----------
const SECTORES = {
  "Baní Centro": { lat: 18.2796, lng: -70.3314, mun: "Baní" },
  "Fundación": { lat: 18.288, lng: -70.318, mun: "Baní" },
  "El Llano": { lat: 18.305, lng: -70.345, mun: "Baní" },
  "Catalina": { lat: 18.293, lng: -70.362, mun: "Baní" },
  "Las Tablas": { lat: 18.268, lng: -70.305, mun: "Baní" },
  "Villa Sombrero": { lat: 18.246, lng: -70.300, mun: "Baní" },
  "Sabana Buey": { lat: 18.215, lng: -70.392, mun: "Baní" },
  "Paya": { lat: 18.318, lng: -70.272, mun: "Baní" },
  "Sabana Alta": { lat: 18.312, lng: -70.330, mun: "Baní" },
  "Las Salinas": { lat: 18.213, lng: -70.545, mun: "Baní" },
  "Nizao": { lat: 18.273, lng: -70.218, mun: "Nizao" },
  "Matanzas": { lat: 18.258, lng: -70.402, mun: "Matanzas" },
};
const SECTOR_KEYS = Object.keys(SECTORES);
const munOf = (s) => SECTORES[s]?.mun || "Peravia";

const BBOX = { lngMin: -70.58, lngMax: -70.18, latMin: 18.17, latMax: 18.37 };
const proj = (lat, lng) => ({
  x: ((lng - BBOX.lngMin) / (BBOX.lngMax - BBOX.lngMin)) * 100,
  y: ((BBOX.latMax - lat) / (BBOX.latMax - BBOX.latMin)) * 100,
});
const projOf = (p) => {
  const s = SECTORES[p.sector] || { lat: 18.28, lng: -70.33 };
  const a = (p.id.charCodeAt(p.id.length - 1) % 10 - 5) * 0.0016;
  const b = (p.id.charCodeAt(0) % 10 - 5) * 0.0016;
  return proj(s.lat + a, s.lng + b);
};

const GRAD = ["from-blue-500 to-indigo-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-rose-500 to-pink-600", "from-violet-500 to-purple-600", "from-cyan-500 to-blue-600", "from-fuchsia-500 to-rose-600", "from-lime-500 to-emerald-600"];

// ---------- datos de ejemplo (Baní / Peravia) ----------
const SEED = [
  { id: "s1", tipo: "apto", titulo: "Apartamento nuevo en Baní Centro", precio: 24000, moneda: "RD$", sector: "Baní Centro", hab: 2, banos: 2, parqueos: 1, m2: 90, amueblado: "semi", descripcion: "Apartamento en segundo nivel a pasos del Parque Central. Listo para mudarse, zona tranquila y comercial.", amen: ["planta", "cisterna", "seguridad", "ac", "balcon"], cerca: ["Parque Central", "Supermercado", "Hospital Regla"], verificado: true, prop: "Inmobiliaria Peravia", wa: "18095551234", fecha: Date.now() - 86400000 * 1, g: 0 },
  { id: "s2", tipo: "casa", titulo: "Casa familiar con patio en El Llano", precio: 38000, moneda: "RD$", sector: "El Llano", hab: 3, banos: 2, parqueos: 2, m2: 240, amueblado: "sin", descripcion: "Cómoda casa con buen patio para los niños, en sector residencial de Baní. Marquesina techada.", amen: ["planta", "cisterna", "pozo", "patio", "parqueo_techado"], cerca: ["Escuelas / Liceos", "Carretera Sánchez"], verificado: true, prop: "Familia Pérez", wa: "18295552345", fecha: Date.now() - 86400000 * 3, g: 1 },
  { id: "s3", tipo: "local", titulo: "Local comercial en calle Mella", precio: 45000, moneda: "RD$", sector: "Baní Centro", hab: 0, banos: 1, parqueos: 2, m2: 110, amueblado: "sin", descripcion: "Local en zona de alto tráfico peatonal en el centro de Baní. Ideal para tienda, farmacia o banco.", amen: ["planta", "cisterna", "seguridad", "ac"], cerca: ["Parque Central", "Supermercado"], verificado: false, prop: "Gestiones Baní", wa: "18095553456", fecha: Date.now() - 86400000 * 2, g: 2 },
  { id: "s4", tipo: "apto", titulo: "Estudio económico en Villa Sombrero", precio: 11000, moneda: "RD$", sector: "Villa Sombrero", hab: 1, banos: 1, parqueos: 1, m2: 45, amueblado: "semi", descripcion: "Estudio ideal para soltero o pareja joven. Cerca de la carretera, fácil acceso a transporte.", amen: ["cisterna", "patio"], cerca: ["Carretera Sánchez"], verificado: false, prop: "Juan A.", wa: "18495554567", fecha: Date.now() - 86400000 * 5, g: 3 },
  { id: "s5", tipo: "casa", titulo: "Villa frente al mar en Las Salinas", precio: 750, moneda: "US$", sector: "Las Salinas", hab: 3, banos: 3, parqueos: 3, m2: 280, amueblado: "full", descripcion: "Espectacular villa amueblada con vista a la bahía de Las Calderas. Perfecta para vivir o rentar a turistas.", amen: ["planta", "cisterna", "piscina", "seguridad", "ac", "amueblado", "balcon", "patio"], cerca: ["Las Salinas", "Playa Los Almendros"], verificado: true, prop: "Costa Salinas", wa: "18095555678", fecha: Date.now() - 86400000 * 4, g: 4 },
  { id: "s6", tipo: "casa", titulo: "Casa en Catalina, sector tranquilo", precio: 28000, moneda: "RD$", sector: "Catalina", hab: 3, banos: 2, parqueos: 2, m2: 200, amueblado: "sin", descripcion: "Casa de una planta en sector residencial de Baní. Buena distribución y solar amplio.", amen: ["cisterna", "pozo", "patio", "parqueo_techado"], cerca: ["Escuelas / Liceos", "Supermercado"], verificado: true, prop: "María R.", wa: "18295556789", fecha: Date.now() - 86400000 * 6, g: 5 },
  { id: "s7", tipo: "apto", titulo: "Apartamento en Fundación", precio: 18000, moneda: "RD$", sector: "Fundación", hab: 2, banos: 1, parqueos: 1, m2: 75, amueblado: "sin", descripcion: "Apartamento cómodo en primer nivel, cerca del centro de Baní y de la universidad.", amen: ["cisterna", "seguridad", "balcon"], cerca: ["Universidad (UASD)", "Parque Central"], verificado: false, prop: "Pedro G.", wa: "18095557890", fecha: Date.now() - 86400000 * 2, g: 6 },
  { id: "s8", tipo: "casa", titulo: "Casa de playa en Las Salinas", precio: 600, moneda: "US$", sector: "Las Salinas", hab: 2, banos: 2, parqueos: 2, m2: 160, amueblado: "full", descripcion: "Acogedora casa amueblada a minutos de la playa. Ideal para fines de semana o renta vacacional.", amen: ["cisterna", "patio", "ac", "amueblado", "balcon"], cerca: ["Las Salinas", "Playa Los Almendros"], verificado: true, prop: "Mar y Sol", wa: "18495558901", fecha: Date.now() - 86400000 * 7, g: 7 },
  { id: "s9", tipo: "local", titulo: "Local comercial en Nizao", precio: 22000, moneda: "RD$", sector: "Nizao", hab: 0, banos: 1, parqueos: 2, m2: 80, amueblado: "sin", descripcion: "Local en la entrada de Nizao sobre la carretera principal. Excelente visibilidad.", amen: ["cisterna", "seguridad"], cerca: ["Carretera Sánchez"], verificado: false, prop: "Inversiones Nizao", wa: "18095559012", fecha: Date.now() - 86400000 * 8, g: 0 },
  { id: "s10", tipo: "casa", titulo: "Casa amplia en Sabana Buey", precio: 20000, moneda: "RD$", sector: "Sabana Buey", hab: 3, banos: 2, parqueos: 3, m2: 260, amueblado: "sin", descripcion: "Casa de campo con mucho terreno, ideal para familia que busca tranquilidad cerca de Baní.", amen: ["cisterna", "pozo", "patio", "planta"], cerca: ["Escuelas / Liceos"], verificado: false, prop: "Ramón D.", wa: "18295550123", fecha: Date.now() - 86400000 * 9, g: 1 },
];

export default function App() {
  const [loaded, setLoaded] = useState(false);
  const [dark, setDark] = useState(false);
  const [screen, setScreen] = useState("entry"); // entry | app
  const [tab, setTab] = useState("explorar"); // explorar | mapa | favoritos | publicar | cuenta
  const [overlay, setOverlay] = useState(null); // {type, p?, editing?}
  const [sheet, setSheet] = useState(null); // {type, label?, cb?}
  const [toast, setToast] = useState(null);

  const [user, setUser] = useState(null);
  const [stored, setStored] = useState([]);
  const [favs, setFavs] = useState([]);
  const [recent, setRecent] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [cmp, setCmp] = useState([]);
  const [filters, setFilters] = useState({ q: "", tipo: "", sector: "", min: "", max: "", hab: "", amen: [], soloVerif: false });

  useEffect(() => { (async () => {
    setStored(await sget("ardb:props", [])); setFavs(await sget("ardb:favs", []));
    setUser(await sget("ardb:user", null)); setRecent(await sget("ardb:recent", []));
    setAlerts(await sget("ardb:alerts", [])); setDark(await sget("ardb:dark", false));
    setLoaded(true);
  })(); }, []);

  const allProps = useMemo(() => [...stored, ...SEED], [stored]);
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  const toggleDark = () => { const d = !dark; setDark(d); sset("ardb:dark", d); };

  const T = dark
    ? { bg: "bg-slate-950", card: "bg-slate-900", card2: "bg-slate-800", text: "text-slate-100", sub: "text-slate-400", border: "border-slate-800", input: "bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500", hover: "active:bg-slate-800", chip: "bg-slate-800 text-slate-300" }
    : { bg: "bg-slate-50", card: "bg-white", card2: "bg-slate-100", text: "text-slate-900", sub: "text-slate-500", border: "border-slate-200", input: "bg-white border-slate-300 text-slate-900 placeholder-slate-400", hover: "active:bg-slate-100", chip: "bg-slate-100 text-slate-600" };

  // ---- auth ----
  const gate = (label, cb) => { if (user) cb(); else setSheet({ type: "auth", label, cb }); };
  const login = (type) => {
    const u = type === "google" ? { name: "Usuario Google", email: "usuario@gmail.com", type } : { name: "Invitado", email: "invitado@alquilard.do", type };
    setUser(u); sset("ardb:user", u);
    const cb = sheet?.cb; setSheet(null); showToast(`¡Hola, ${u.name}! 👋`);
    if (cb) setTimeout(cb, 80);
  };
  const logout = () => { setUser(null); sset("ardb:user", null); showToast("Sesión cerrada"); };

  const toggleFav = (id) => gate("guardar en favoritos", () => {
    const nf = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    setFavs(nf); sset("ardb:favs", nf);
    showToast(favs.includes(id) ? "Quitado de favoritos" : "❤️ Guardado en favoritos");
  });
  const openDetail = (p) => {
    setOverlay({ type: "detail", p });
    const nr = [p.id, ...recent.filter((r) => r !== p.id)].slice(0, 8);
    setRecent(nr); sset("ardb:recent", nr);
  };
  const contact = (p) => gate("contactar al propietario", () => {
    window.open(`https://wa.me/${p.wa}?text=${encodeURIComponent(`Hola, vi tu publicación "${p.titulo}" en AlquilaRD (Baní) y me interesa. ¿Sigue disponible?`)}`, "_blank");
  });
  const share = (p) => window.open(`https://wa.me/?text=${encodeURIComponent(`🏠 ${p.titulo}\n📍 ${p.sector}, ${munOf(p.sector)}, Peravia\n💵 ${p.moneda}${fmt(p.precio)}/mes\nEn AlquilaRD`)}`, "_blank");
  const report = () => showToast("🚩 Publicación reportada. ¡Gracias por cuidar la comunidad!");
  const toggleCmp = (id) => { if (cmp.includes(id)) setCmp(cmp.filter((c) => c !== id)); else if (cmp.length >= 3) showToast("Máximo 3 para comparar"); else setCmp([...cmp, id]); };
  const saveAlert = () => gate("crear una alerta", () => { const na = [...alerts, { id: Date.now(), filters: { ...filters } }]; setAlerts(na); sset("ardb:alerts", na); showToast("🔔 Alerta creada"); });
  const delAlert = (id) => { const na = alerts.filter((a) => a.id !== id); setAlerts(na); sset("ardb:alerts", na); };
  const saveProp = (p) => {
    let np;
    if (overlay?.editing) np = stored.map((s) => (s.id === overlay.editing.id ? { ...p, id: overlay.editing.id } : s));
    else np = [{ ...p, id: "u" + Date.now(), fecha: Date.now(), prop: user.name, verificado: false, g: Math.floor(Math.random() * 8) }, ...stored];
    setStored(np); sset("ardb:props", np); setOverlay(null); setTab("publicar");
    showToast(overlay?.editing ? "✅ Actualizada" : "🎉 ¡Publicada! En revisión.");
  };
  const delProp = (id) => { const np = stored.filter((s) => s.id !== id); setStored(np); sset("ardb:props", np); showToast("Eliminada"); };

  const filtered = useMemo(() => allProps.filter((p) => {
    const f = filters;
    if (f.q && !`${p.titulo} ${p.sector} ${munOf(p.sector)}`.toLowerCase().includes(f.q.toLowerCase())) return false;
    if (f.tipo && p.tipo !== f.tipo) return false;
    if (f.sector && p.sector !== f.sector) return false;
    if (f.hab && p.hab < +f.hab) return false;
    if (f.soloVerif && !p.verificado) return false;
    if (f.min && toRD(p) < +f.min) return false;
    if (f.max && toRD(p) > +f.max) return false;
    if (f.amen.length && !f.amen.every((a) => p.amen.includes(a))) return false;
    return true;
  }).sort((a, b) => b.fecha - a.fecha), [allProps, filters]);

  const fCount = filters.amen.length + (filters.tipo ? 1 : 0) + (filters.sector ? 1 : 0) + (filters.soloVerif ? 1 : 0) + (filters.min ? 1 : 0) + (filters.max ? 1 : 0) + (filters.hab ? 1 : 0);

  if (!loaded) return <div className="flex items-center justify-center h-96 text-slate-400">Cargando…</div>;

  // ============ ENTRADA ============
  if (screen === "entry") {
    return (
      <div className={`min-h-screen ${T.bg} ${T.text}`}>
        <div className="relative overflow-hidden min-h-screen flex flex-col">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="relative flex-1 flex flex-col justify-between px-5 pt-5 pb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center"><Home size={20} /></div>
                <span className="text-xl font-bold tracking-tight">Alquila<span className="text-amber-300">RD</span></span>
              </div>
              <button onClick={toggleDark} className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            </div>
            <div className="text-center text-white py-6">
              <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-sm mb-4"><MapPin size={14} /> Baní · Provincia Peravia 🇩🇴</span>
              <h1 className="text-3xl font-extrabold tracking-tight leading-tight mb-3">Encuentra dónde<br />alquilar en Baní</h1>
              <p className="text-white/80">Casas, apartamentos y locales en toda la provincia, con la info que necesitas.</p>
            </div>
            <div className="space-y-3 mb-4">
              <button onClick={() => { setScreen("app"); setTab("explorar"); }} className="w-full text-left bg-white rounded-2xl p-5 shadow-xl active:scale-[0.98] transition-transform flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Search size={24} /></div>
                <div className="flex-1"><h3 className="font-bold text-slate-900">Estoy buscando para alquilar</h3><p className="text-sm text-slate-500">Explora lo disponible en Peravia</p></div>
                <ChevronRight size={20} className="text-slate-400 shrink-0" />
              </button>
              <button onClick={() => { setScreen("app"); setTab("publicar"); }} className="w-full text-left bg-white rounded-2xl p-5 shadow-xl active:scale-[0.98] transition-transform flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><Building2 size={24} /></div>
                <div className="flex-1"><h3 className="font-bold text-slate-900">Quiero poner en alquiler</h3><p className="text-sm text-slate-500">Publica y administra tu propiedad</p></div>
                <ChevronRight size={20} className="text-slate-400 shrink-0" />
              </button>
            </div>
            <p className="text-center text-white/60 text-xs">+{allProps.length} propiedades en Baní y alrededores</p>
          </div>
        </div>
        {toast && <Toast msg={toast} />}
      </div>
    );
  }

  const favProps = allProps.filter((p) => favs.includes(p.id));
  const recentProps = recent.map((id) => allProps.find((p) => p.id === id)).filter(Boolean);

  // ============ APP ============
  return (
    <div className={`min-h-screen ${T.bg} ${T.text} max-w-md mx-auto relative`}>
      {/* Header */}
      <div className={`sticky top-0 z-20 ${T.card} border-b ${T.border}`}>
        <div className="h-14 px-4 flex items-center justify-between">
          <button onClick={() => setScreen("entry")} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white"><Home size={16} /></div>
            <div className="text-left leading-none">
              <div className="font-bold text-sm">Alquila<span className="text-blue-500">RD</span></div>
              <div className={`text-[10px] ${T.sub} flex items-center gap-0.5 mt-0.5`}><MapPin size={9} /> Baní, Peravia</div>
            </div>
          </button>
          <button onClick={toggleDark} className={`w-9 h-9 rounded-lg ${T.card2} flex items-center justify-center`}>{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
        </div>
      </div>

      {/* Contenido */}
      <div className="pb-24">
        {tab === "explorar" && (
          <div className="px-4 pt-4">
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={17} className={`absolute left-3 top-1/2 -translate-y-1/2 ${T.sub}`} />
                <input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} placeholder="Buscar sector o título…" className={`w-full pl-9 pr-3 py-2.5 rounded-xl border ${T.input} text-sm outline-none`} />
              </div>
              <button onClick={() => setSheet({ type: "filters" })} className={`relative w-11 shrink-0 rounded-xl border ${T.border} ${T.card} flex items-center justify-center ${T.hover}`}>
                <SlidersHorizontal size={18} />
                {fCount > 0 && <span className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{fCount}</span>}
              </button>
            </div>
            {/* chips tipo rápidos */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-1 px-1">
              <Chip on={!filters.tipo} onClick={() => setFilters({ ...filters, tipo: "" })} T={T}>Todos</Chip>
              {TIPOS.map((t) => <Chip key={t.k} on={filters.tipo === t.k} onClick={() => setFilters({ ...filters, tipo: t.k })} T={T}><t.icon size={13} /> {t.label}</Chip>)}
            </div>

            {recentProps.length > 0 && !filters.q && (
              <div className="mb-4">
                <div className={`flex items-center gap-1.5 text-xs font-semibold mb-2 ${T.sub}`}><Eye size={14} /> Vistas recientemente</div>
                <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-1 px-1">
                  {recentProps.map((p) => (
                    <button key={p.id} onClick={() => openDetail(p)} className={`shrink-0 w-36 text-left ${T.card} border ${T.border} rounded-xl overflow-hidden`}>
                      <div className={`h-16 bg-gradient-to-br ${GRAD[p.g]} flex items-center justify-center text-white/70`}>{React.createElement(tipoIcon(p.tipo), { size: 22 })}</div>
                      <div className="p-2"><div className="text-[11px] font-bold truncate">{p.titulo}</div><div className={`text-[11px] ${T.sub}`}>{p.moneda}{fmt(p.precio)}</div></div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mb-3">
              <span className={`text-sm font-semibold`}>{filtered.length} disponibles</span>
              {cmp.length > 0 && <button onClick={() => setOverlay({ type: "compare" })} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-medium"><Columns size={14} /> Comparar ({cmp.length})</button>}
            </div>
            {filtered.length === 0 ? <Empty T={T} icon={Search} title="Sin resultados" sub="Ajusta los filtros o amplía tu búsqueda." />
              : <div className="space-y-3.5">{filtered.map((p) => <Card key={p.id} {...{ T, p, favs, toggleFav, openDetail, cmp, toggleCmp }} />)}</div>}
          </div>
        )}

        {tab === "mapa" && <MapaTab {...{ T, dark, props: filtered, openDetail, favs, toggleFav, setSheet, fCount }} />}

        {tab === "favoritos" && (
          <div className="px-4 pt-4">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><Heart size={19} className="text-rose-500" /> Mis favoritos</h2>
            {favProps.length === 0 ? <Empty T={T} icon={Heart} title="Aún no tienes favoritos" sub="Toca el corazón en una propiedad para guardarla." />
              : <div className="space-y-3.5">{favProps.map((p) => <Card key={p.id} {...{ T, p, favs, toggleFav, openDetail, cmp, toggleCmp }} />)}</div>}
          </div>
        )}

        {tab === "publicar" && <PublicarTab {...{ T, user, stored, setOverlay, delProp, setSheet, setTab }} />}

        {tab === "cuenta" && <CuentaTab {...{ T, dark, user, login, logout, alerts, delAlert, toggleDark, setSheet }} />}
      </div>

      {/* Bottom nav */}
      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto z-20 ${T.card} border-t ${T.border} px-2 pb-1.5 pt-1`}>
        <div className="flex items-center justify-around">
          {[["explorar", "Explorar", Search], ["mapa", "Mapa", MapIcon], ["favoritos", "Favoritos", Heart], ["publicar", "Publicar", Plus], ["cuenta", "Cuenta", User]].map(([k, l, Ic]) => {
            const on = tab === k;
            return (
              <button key={k} onClick={() => setTab(k)} className="flex flex-col items-center gap-0.5 py-1.5 px-1 flex-1 relative">
                <div className={`relative ${on ? "text-blue-600" : T.sub}`}>
                  <Ic size={22} fill={k === "favoritos" && on ? "currentColor" : "none"} />
                  {k === "favoritos" && favs.length > 0 && <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center">{favs.length}</span>}
                </div>
                <span className={`text-[10px] font-medium ${on ? "text-blue-600" : T.sub}`}>{l}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overlays */}
      {overlay?.type === "detail" && <DetailOverlay {...{ T, dark, p: overlay.p, close: () => setOverlay(null), favs, toggleFav, contact, share, report }} />}
      {overlay?.type === "compare" && <CompareOverlay {...{ T, props: allProps.filter((p) => cmp.includes(p.id)), close: () => setOverlay(null), toggleCmp, contact }} />}
      {overlay?.type === "form" && <FormOverlay {...{ T, save: saveProp, editing: overlay.editing, close: () => setOverlay(null) }} />}

      {/* Sheets */}
      {sheet?.type === "filters" && <FiltersSheet {...{ T, filters, setFilters, saveAlert, close: () => setSheet(null) }} />}
      {sheet?.type === "calc" && <CalcSheet {...{ T, close: () => setSheet(null) }} />}
      {sheet?.type === "auth" && <AuthSheet {...{ T, label: sheet.label, login, close: () => setSheet(null) }} />}

      {toast && <Toast msg={toast} />}
    </div>
  );
}

// ============ MAPA DE PERAVIA ============
function MapaTab({ T, dark, props, openDetail, favs, toggleFav, setSheet, fCount }) {
  const [active, setActive] = useState(null);
  const land = dark ? "#1e3a2e" : "#dcfce7";
  const land2 = dark ? "#14532d" : "#bbf7d0";
  const sea = dark ? "#0c4a6e" : "#7dd3fc";
  const road = dark ? "#fbbf24" : "#f59e0b";
  const txt = dark ? "#94a3b8" : "#475569";
  return (
    <div className="px-4 pt-4">
      <div className="flex items-center justify-between mb-3">
        <div><h2 className="text-lg font-bold flex items-center gap-2"><MapIcon size={19} className="text-blue-600" /> Mapa de Peravia</h2><p className={`text-xs ${T.sub}`}>{props.length} propiedades ubicadas</p></div>
        <button onClick={() => setSheet({ type: "filters" })} className={`relative px-3 py-2 rounded-xl border ${T.border} ${T.card} text-sm font-medium flex items-center gap-1.5`}><SlidersHorizontal size={15} /> Filtros{fCount > 0 && <span className="bg-blue-600 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">{fCount}</span>}</button>
      </div>
      <div className={`rounded-2xl overflow-hidden border ${T.border} relative`} style={{ height: "62vh", minHeight: 360, maxHeight: 520 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
          <rect x="0" y="0" width="100" height="100" fill={sea} />
          {/* tierra (provincia) */}
          <path d="M0,0 L100,0 L100,76 C88,78 76,82 62,80 C52,79 46,86 38,84 C30,82 26,88 20,86 C16,85 14,75 9,77 C5,79 7,72 0,73 Z" fill={land} />
          {/* relieve norte */}
          <path d="M0,0 L100,0 L100,30 C80,24 60,34 40,28 C24,23 12,33 0,27 Z" fill={land2} opacity="0.6" />
          {/* península Las Salinas / Bahía de Las Calderas */}
          <path d="M3,76 C8,74 13,77 15,82 C12,85 6,86 4,83 Z" fill={land} />
          {/* carretera Sánchez */}
          <path d="M6,62 Q35,54 62,49 T96,46" fill="none" stroke={road} strokeWidth="1.4" strokeLinecap="round" strokeDasharray="0" opacity="0.9" />
          {/* etiquetas zonas */}
          <text x="50" y="90" fill={dark ? "#7dd3fc" : "#0369a1"} fontSize="3.2" fontWeight="700" textAnchor="middle">MAR CARIBE</text>
          <text x="9" y="91" fill={dark ? "#7dd3fc" : "#0369a1"} fontSize="2.3" textAnchor="middle">Bahía Las Calderas</text>
          <text x="50" y="5" fill={txt} fontSize="2.6" textAnchor="middle" opacity="0.7">Sierra · Norte de Peravia</text>
        </svg>
        {/* pins */}
        {props.map((p) => {
          const pos = projOf(p);
          return (
            <button key={p.id} onClick={() => setActive(active?.id === p.id ? null : p)} style={{ left: `${pos.x}%`, top: `${pos.y}%` }} className="absolute -translate-x-1/2 -translate-y-full z-10">
              <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold shadow-md ${active?.id === p.id ? "bg-blue-600 text-white scale-110" : "bg-white text-slate-900"}`}>
                {React.createElement(tipoIcon(p.tipo), { size: 10 })}{p.moneda === "US$" ? "$" : "RD$"}{p.precio >= 1000 ? Math.round(p.precio / 1000) + "k" : p.precio}
              </div>
              <div className={`w-1.5 h-1.5 rotate-45 mx-auto -mt-0.5 ${active?.id === p.id ? "bg-blue-600" : "bg-white"}`} />
            </button>
          );
        })}
        {/* etiquetas de sectores principales */}
        {["Baní Centro", "Nizao", "Matanzas", "Las Salinas"].map((s) => {
          const pos = proj(SECTORES[s].lat, SECTORES[s].lng);
          return <span key={s} style={{ left: `${pos.x}%`, top: `${pos.y + 4}%` }} className={`absolute -translate-x-1/2 text-[9px] font-semibold pointer-events-none ${dark ? "text-slate-300" : "text-slate-600"}`}>{s}</span>;
        })}

        {active && (
          <div className={`absolute bottom-3 left-3 right-3 ${T.card} rounded-xl shadow-2xl border ${T.border} overflow-hidden z-30 flex`}>
            <div className={`w-24 bg-gradient-to-br ${GRAD[active.g]} flex items-center justify-center text-white/70 shrink-0`}>{React.createElement(tipoIcon(active.tipo), { size: 28 })}</div>
            <div className="p-2.5 flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="font-extrabold text-sm">{active.moneda}{fmt(active.precio)}<span className={`text-[11px] font-normal ${T.sub}`}>/mes</span></div>
                <button onClick={() => setActive(null)} className={T.sub}><X size={15} /></button>
              </div>
              <div className="text-xs font-semibold line-clamp-1">{active.titulo}</div>
              <div className={`text-[11px] ${T.sub} flex items-center gap-0.5 mb-1.5`}><MapPin size={10} /> {active.sector}</div>
              <button onClick={() => openDetail(active)} className="w-full py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium">Ver detalle</button>
            </div>
          </div>
        )}
      </div>
      <div className={`mt-2 text-[11px] ${T.sub} flex items-center gap-1.5`}><MapPin size={12} /> Toca un pin para ver la propiedad. Ubicaciones aproximadas por sector.</div>
    </div>
  );
}

// ============ PUBLICAR ============
function PublicarTab({ T, user, stored, setOverlay, delProp, setSheet, setTab }) {
  if (!user) return (
    <div className="px-6 pt-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4"><Building2 size={30} /></div>
      <h2 className="text-xl font-bold mb-2">Inicia sesión para publicar</h2>
      <p className={`${T.sub} mb-5 text-sm`}>Crea una cuenta para publicar y administrar tus propiedades en Baní.</p>
      <button onClick={() => setSheet({ type: "auth", label: "publicar propiedades", cb: () => setTab("publicar") })} className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold">Iniciar sesión</button>
    </div>
  );
  const stats = { activas: stored.length, vistas: stored.length * 41 + 86, consultas: stored.length * 5 + 9 };
  return (
    <div className="px-4 pt-4">
      <h1 className="text-xl font-bold mb-0.5">Hola, {user.name.split(" ")[0]} 👋</h1>
      <p className={`${T.sub} text-sm mb-4`}>Administra tus propiedades</p>
      <button onClick={() => setOverlay({ type: "form" })} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-semibold mb-5"><Plus size={19} /> Publicar nueva propiedad</button>
      <div className="grid grid-cols-3 gap-2.5 mb-5">
        {[[Building2, stats.activas, "Activas", "from-blue-500 to-indigo-600"], [Eye, stats.vistas, "Vistas", "from-emerald-500 to-teal-600"], [MessageCircle, stats.consultas, "Consultas", "from-amber-500 to-orange-600"]].map(([Ic, v, l, g], i) => (
          <div key={i} className={`${T.card} border ${T.border} rounded-2xl p-3`}>
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} text-white flex items-center justify-center mb-2`}>{React.createElement(Ic, { size: 16 })}</div>
            <div className="text-xl font-extrabold leading-none">{v}</div><div className={`text-[11px] ${T.sub} mt-0.5`}>{l}</div>
          </div>
        ))}
      </div>
      <h3 className="font-bold mb-2.5 text-sm">Mis propiedades ({stored.length})</h3>
      {stored.length === 0 ? <Empty T={T} icon={Building2} title="Aún no has publicado" sub="Publica tu primera propiedad y recibe consultas." />
        : <div className="space-y-2.5 mb-5">
          {stored.map((p) => (
            <div key={p.id} className={`${T.card} border ${T.border} rounded-2xl p-2.5 flex items-center gap-3`}>
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${GRAD[p.g]} flex items-center justify-center text-white/70 shrink-0`}>{React.createElement(tipoIcon(p.tipo), { size: 22 })}</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{p.titulo}</div>
                <div className={`text-xs ${T.sub} flex items-center gap-1`}>{p.moneda}{fmt(p.precio)} · <MapPin size={11} />{p.sector}</div>
                <div className="mt-1">{p.verificado ? <span className="text-[10px] text-emerald-500 flex items-center gap-0.5"><ShieldCheck size={11} /> Verificado</span> : <span className="text-[10px] text-amber-500 flex items-center gap-0.5"><Flag size={10} /> En revisión</span>}</div>
              </div>
              <div className="flex flex-col gap-1.5">
                <button onClick={() => setOverlay({ type: "form", editing: p })} className={`w-9 h-9 rounded-lg ${T.card2} flex items-center justify-center`}><Pencil size={15} /></button>
                <button onClick={() => delProp(p.id)} className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center"><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>}
      <div className={`${T.card} border ${T.border} rounded-2xl p-4`}>
        <h3 className="font-bold mb-2.5 text-sm flex items-center gap-2"><TrendingUp size={16} className="text-emerald-500" /> Tips para alquilar más rápido</h3>
        <div className={`space-y-2 text-xs ${T.sub}`}>
          {["Fotos claras y bien iluminadas de cada espacio.", "Verifica tu cuenta para ganar la insignia de confianza.", "Detalla lo clave en Baní: planta, cisterna/pozo y seguridad.", "Responde rápido por WhatsApp."].map((c, i) => <div key={i} className="flex gap-2"><CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" /> {c}</div>)}
        </div>
      </div>
    </div>
  );
}

// ============ CUENTA ============
function CuentaTab({ T, dark, user, login, logout, alerts, delAlert, toggleDark, setSheet }) {
  return (
    <div className="px-4 pt-4">
      <h2 className="text-lg font-bold mb-4">Mi cuenta</h2>
      <div className={`${T.card} border ${T.border} rounded-2xl p-4 mb-4`}>
        {user ? (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-lg font-bold">{user.name[0]}</div>
            <div className="flex-1"><div className="font-bold">{user.name}</div><div className={`text-xs ${T.sub}`}>{user.email}</div></div>
            <button onClick={logout} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg ${T.card2} text-sm`}><LogOut size={15} /> Salir</button>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3"><User size={22} /></div>
            <p className={`text-sm ${T.sub} mb-3`}>Inicia sesión para guardar favoritos, publicar y crear alertas.</p>
            <button onClick={() => setSheet({ type: "auth", label: "acceder a tu cuenta" })} className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold flex items-center gap-2 mx-auto"><LogIn size={16} /> Iniciar sesión</button>
          </div>
        )}
      </div>

      <div className={`${T.card} border ${T.border} rounded-2xl divide-y ${dark ? "divide-slate-800" : "divide-slate-100"} mb-4`}>
        <button onClick={() => setSheet({ type: "calc" })} className={`w-full flex items-center gap-3 p-3.5 ${T.hover}`}>
          <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center"><Calculator size={17} /></div>
          <span className="flex-1 text-left text-sm font-medium">Calculadora ¿Me alcanza?</span><ChevronRight size={17} className={T.sub} />
        </button>
        <div className="w-full flex items-center gap-3 p-3.5">
          <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">{dark ? <Moon size={17} /> : <Sun size={17} />}</div>
          <span className="flex-1 text-left text-sm font-medium">Modo oscuro</span>
          <button onClick={toggleDark} className={`w-11 h-6 rounded-full transition relative ${dark ? "bg-blue-600" : "bg-slate-300"}`}><span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${dark ? "left-5.5" : "left-0.5"}`} style={{ left: dark ? 22 : 2 }} /></button>
        </div>
      </div>

      <h3 className={`text-xs font-semibold mb-2 ${T.sub} flex items-center gap-1.5`}><Bell size={14} /> MIS ALERTAS</h3>
      {alerts.length === 0 ? <p className={`text-sm ${T.sub} mb-4`}>No tienes alertas. Créalas desde los filtros de búsqueda.</p>
        : <div className="space-y-2 mb-4">
          {alerts.map((a) => (
            <div key={a.id} className={`${T.card} border ${T.border} rounded-xl p-3 flex items-center gap-2`}>
              <BellRing size={16} className="text-amber-500 shrink-0" />
              <span className="text-sm flex-1">{a.filters.tipo ? tipoLabel(a.filters.tipo) : "Cualquier tipo"}{a.filters.sector ? ` · ${a.filters.sector}` : ""}{a.filters.max ? ` · hasta RD$${fmt(a.filters.max)}` : ""}</span>
              <button onClick={() => delAlert(a.id)} className="text-rose-500"><X size={16} /></button>
            </div>
          ))}
        </div>}

      <div className={`${T.card} border ${T.border} rounded-2xl p-4 text-center`}>
        <div className="font-bold text-sm mb-1">AlquilaRD · Baní 🇩🇴</div>
        <p className={`text-xs ${T.sub}`}>Hecho para la Provincia Peravia. Tasa de referencia: US$1 ≈ RD${FX}.</p>
      </div>
    </div>
  );
}

// ============ CARD ============
function Card({ T, p, favs, toggleFav, openDetail, cmp, toggleCmp }) {
  const Ic = tipoIcon(p.tipo);
  const isFav = favs.includes(p.id);
  const inCmp = cmp?.includes(p.id);
  return (
    <div className={`${T.card} border ${T.border} rounded-2xl overflow-hidden`}>
      <div className="relative" onClick={() => openDetail(p)} role="button">
        <div className={`h-40 bg-gradient-to-br ${GRAD[p.g]} flex items-center justify-center text-white/70 relative`}>
          <Ic size={44} />
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 70% 20%, white 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" }} />
        </div>
        <span className="absolute top-3 left-3 bg-black/40 backdrop-blur text-white text-[11px] px-2.5 py-1 rounded-full font-medium">{tipoLabel(p.tipo)}</span>
        {p.verificado && <span className="absolute bottom-3 left-3 bg-emerald-500 text-white text-[11px] px-2 py-1 rounded-full font-medium flex items-center gap-1"><ShieldCheck size={12} /> Verificado</span>}
        <button onClick={(e) => { e.stopPropagation(); toggleFav(p.id); }} className={`absolute top-2.5 right-2.5 w-9 h-9 rounded-full backdrop-blur flex items-center justify-center ${isFav ? "bg-rose-500 text-white" : "bg-black/30 text-white"}`}><Heart size={17} fill={isFav ? "currentColor" : "none"} /></button>
      </div>
      <div className="p-3.5" onClick={() => openDetail(p)} role="button">
        <div className="flex items-baseline gap-1 mb-0.5"><span className="text-xl font-extrabold">{p.moneda}{fmt(p.precio)}</span><span className={`text-sm ${T.sub}`}>/mes</span></div>
        <h3 className="font-bold leading-tight mb-1 line-clamp-1">{p.titulo}</h3>
        <p className={`text-sm ${T.sub} flex items-center gap-1 mb-3`}><MapPin size={13} /> {p.sector}, {munOf(p.sector)}</p>
        <div className={`flex items-center gap-3.5 text-sm ${T.sub}`}>
          {p.hab > 0 && <span className="flex items-center gap-1"><Bed size={15} /> {p.hab}</span>}
          <span className="flex items-center gap-1"><Bath size={15} /> {p.banos}</span>
          <span className="flex items-center gap-1"><Car size={15} /> {p.parqueos}</span>
          <span className="flex items-center gap-1"><Maximize2 size={15} /> {p.m2}m²</span>
        </div>
      </div>
      <div className={`px-3.5 pb-3 flex gap-2 border-t ${T.border} pt-2.5`}>
        <button onClick={() => toggleCmp(p.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border ${inCmp ? "bg-violet-600 border-violet-600 text-white" : `${T.border} ${T.sub}`}`}><Columns size={13} /> {inCmp ? "Comparando" : "Comparar"}</button>
        <button onClick={() => openDetail(p)} className="flex-1 flex items-center justify-center py-2 rounded-lg text-xs font-medium bg-blue-600 text-white">Ver detalle</button>
      </div>
    </div>
  );
}

// ============ DETALLE (overlay) ============
function DetailOverlay({ T, dark, p, close, favs, toggleFav, contact, share, report }) {
  const Ic = tipoIcon(p.tipo);
  const isFav = favs.includes(p.id);
  const [img, setImg] = useState(0);
  const pos = proj(SECTORES[p.sector]?.lat || 18.28, SECTORES[p.sector]?.lng || -70.33);
  return (
    <div className={`fixed inset-0 z-40 max-w-md mx-auto ${T.bg} ${T.text} overflow-y-auto`}>
      <div className="relative">
        <div className={`h-64 bg-gradient-to-br ${GRAD[(p.g + img) % 8]} flex items-center justify-center text-white/70`}><Ic size={64} /></div>
        <button onClick={close} className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center"><ArrowLeft size={20} /></button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button onClick={() => share(p)} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur text-white flex items-center justify-center"><Share2 size={18} /></button>
          <button onClick={() => toggleFav(p.id)} className={`w-10 h-10 rounded-full backdrop-blur flex items-center justify-center ${isFav ? "bg-rose-500 text-white" : "bg-black/40 text-white"}`}><Heart size={18} fill={isFav ? "currentColor" : "none"} /></button>
        </div>
        {p.verificado && <span className="absolute bottom-4 left-4 bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-full font-medium flex items-center gap-1.5"><ShieldCheck size={14} /> Propietario Verificado</span>}
      </div>
      <div className="px-4 -mt-1">
        <div className="flex gap-1.5 py-3">
          {[0, 1, 2, 3].map((i) => <button key={i} onClick={() => setImg(i)} className={`flex-1 h-12 rounded-lg bg-gradient-to-br ${GRAD[(p.g + i) % 8]} flex items-center justify-center text-white/60 ${img === i ? "ring-2 ring-blue-500" : "opacity-60"}`}><Camera size={15} /></button>)}
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-extrabold">{p.moneda}{fmt(p.precio)}</span><span className={T.sub}>/mes</span>
          {p.moneda === "US$" && <span className={`text-sm ${T.sub}`}>≈ RD${fmt(p.precio * FX)}</span>}
        </div>
        <h1 className="text-xl font-bold mb-1">{p.titulo}</h1>
        <p className={`flex items-center gap-1.5 ${T.sub} mb-4 text-sm`}><MapPin size={15} /> {p.sector}, {munOf(p.sector)}, Peravia</p>
        <div className="grid grid-cols-4 gap-2 mb-5">
          {[[Bed, p.hab > 0 ? p.hab : "—", "Hab."], [Bath, p.banos, "Baños"], [Car, p.parqueos, "Parqueo"], [Maximize2, p.m2 + "m²", "Área"]].map(([I2, v, l], i) => (
            <div key={i} className={`${T.card2} rounded-xl p-2.5 text-center`}>{React.createElement(I2, { size: 18, className: "mx-auto mb-1 text-blue-500" })}<div className="font-bold text-sm">{v}</div><div className={`text-[10px] ${T.sub}`}>{l}</div></div>
          ))}
        </div>
        <Section T={T} title="Descripción"><p className={`${T.sub} text-sm leading-relaxed`}>{p.descripcion}</p></Section>
        <Section T={T} title="Amueblado"><span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm ${T.chip}`}><Sofa size={15} /> {p.amueblado === "full" ? "Totalmente amueblado" : p.amueblado === "semi" ? "Semi amueblado" : "Sin amueblar"}</span></Section>
        <Section T={T} title="Amenidades">
          <div className="grid grid-cols-2 gap-2.5">{p.amen.map((k) => { const I = amenIcon(k); return <div key={k} className="flex items-center gap-2 text-sm"><div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><I size={14} /></div> {amenLabel(k)}</div>; })}</div>
        </Section>
        {p.cerca?.length > 0 && <Section T={T} title="Cerca de"><div className="flex flex-wrap gap-2">{p.cerca.map((c) => <span key={c} className={`text-xs px-2.5 py-1.5 rounded-full ${T.chip} flex items-center gap-1`}><MapPin size={12} /> {c}</span>)}</div></Section>}
        <Section T={T} title="Ubicación en Peravia">
          <div className={`rounded-xl overflow-hidden border ${T.border} relative`} style={{ height: 150 }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <rect width="100" height="100" fill={dark ? "#0c4a6e" : "#7dd3fc"} />
              <path d="M0,0 L100,0 L100,76 C88,78 76,82 62,80 C52,79 46,86 38,84 C30,82 26,88 20,86 C16,85 14,75 9,77 C5,79 7,72 0,73 Z" fill={dark ? "#1e3a2e" : "#dcfce7"} />
            </svg>
            <div style={{ left: `${pos.x}%`, top: `${pos.y}%` }} className="absolute -translate-x-1/2 -translate-y-full">
              <MapPin size={30} className="text-rose-500 drop-shadow" fill="#f43f5e" />
            </div>
            <span className="absolute bottom-2 left-2 text-[11px] font-semibold" style={{ color: dark ? "#cbd5e1" : "#475569" }}>{p.sector}, Peravia</span>
          </div>
        </Section>
        <div className={`mb-5 p-3 rounded-xl flex items-center gap-3 ${T.card} border ${T.border}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shrink-0">{p.prop[0]}</div>
          <div className="flex-1"><div className="font-bold text-sm flex items-center gap-1">{p.prop} {p.verificado && <ShieldCheck size={14} className="text-emerald-500" />}</div><div className={`text-xs ${T.sub}`}>{p.verificado ? "Verificado" : "Propietario"}</div></div>
          <button onClick={report} className={`text-xs ${T.sub} flex items-center gap-1`}><Flag size={13} /> Reportar</button>
        </div>
        {!p.verificado && <div className={`mb-24 p-3 rounded-xl text-xs flex gap-2 ${dark ? "bg-amber-500/10 text-amber-300" : "bg-amber-50 text-amber-700"}`}><Flag size={14} className="shrink-0 mt-0.5" /> No verificada. Confirma la info antes de pagar o dar depósitos.</div>}
        {p.verificado && <div className="mb-24" />}
      </div>
      {/* barra inferior fija */}
      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto ${T.card} border-t ${T.border} p-3 flex gap-2 z-10`}>
        <button onClick={() => toggleFav(p.id)} className={`w-12 shrink-0 rounded-xl border ${T.border} flex items-center justify-center ${isFav ? "text-rose-500" : T.sub}`}><Heart size={20} fill={isFav ? "currentColor" : "none"} /></button>
        <button onClick={() => contact(p)} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-600 active:bg-green-700 text-white font-semibold"><MessageCircle size={19} /> Contactar por WhatsApp</button>
      </div>
    </div>
  );
}

// ============ COMPARAR (overlay) ============
function CompareOverlay({ T, props, close, toggleCmp, contact }) {
  const rows = [["Precio", (p) => `${p.moneda}${fmt(p.precio)}`], ["En RD$", (p) => `RD$${fmt(toRD(p))}`], ["Tipo", (p) => tipoLabel(p.tipo)], ["Sector", (p) => p.sector], ["Hab.", (p) => p.hab || "—"], ["Baños", (p) => p.banos], ["Parqueo", (p) => p.parqueos], ["Área", (p) => p.m2 + "m²"], ["Amueblado", (p) => p.amueblado === "full" ? "Full" : p.amueblado === "semi" ? "Semi" : "No"], ["Verificado", (p) => p.verificado ? "✅" : "—"], ["Amenidades", (p) => p.amen.length]];
  return (
    <div className={`fixed inset-0 z-40 max-w-md mx-auto ${T.bg} ${T.text} overflow-y-auto`}>
      <div className={`sticky top-0 ${T.card} border-b ${T.border} h-14 px-4 flex items-center gap-3`}>
        <button onClick={close}><ArrowLeft size={22} /></button><span className="font-bold flex items-center gap-2"><Columns size={18} /> Comparar</span>
      </div>
      {props.length === 0 ? <div className="p-6"><Empty T={T} icon={Columns} title="Nada que comparar" sub="Selecciona propiedades con el botón Comparar." /></div>
        : <div className="p-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead><tr><th className="w-20"></th>{props.map((p) => (
              <th key={p.id} className="p-1.5 min-w-[120px]">
                <div className={`h-16 rounded-lg bg-gradient-to-br ${GRAD[p.g]} flex items-center justify-center text-white/70 mb-1.5`}>{React.createElement(tipoIcon(p.tipo), { size: 22 })}</div>
                <div className="text-xs font-bold line-clamp-2 leading-tight">{p.titulo}</div>
                <button onClick={() => toggleCmp(p.id)} className="text-[11px] text-rose-500 mt-1 flex items-center gap-0.5 mx-auto"><X size={11} /> Quitar</button>
              </th>))}</tr></thead>
            <tbody>{rows.map(([l, fn], i) => (<tr key={i}><td className={`p-1.5 text-xs font-semibold ${T.sub}`}>{l}</td>{props.map((p) => <td key={p.id} className={`p-1.5 text-center border ${T.border} ${i % 2 ? T.card2 : ""}`}>{fn(p)}</td>)}</tr>))}
              <tr><td></td>{props.map((p) => <td key={p.id} className="p-1.5 text-center"><button onClick={() => contact(p)} className="text-[11px] px-2.5 py-1.5 rounded-lg bg-green-600 text-white inline-flex items-center gap-1"><MessageCircle size={12} /> Contactar</button></td>)}</tr>
            </tbody>
          </table>
        </div>}
    </div>
  );
}

// ============ FORM (overlay) ============
function FormOverlay({ T, save, editing, close }) {
  const [f, setF] = useState(editing || { tipo: "apto", titulo: "", precio: "", moneda: "RD$", sector: "Baní Centro", hab: "", banos: "", parqueos: "", m2: "", amueblado: "sin", descripcion: "", amen: [], cerca: [], wa: "" });
  const [err, setErr] = useState("");
  const upd = (k, v) => setF({ ...f, [k]: v });
  const toggleA = (k) => upd("amen", f.amen.includes(k) ? f.amen.filter((a) => a !== k) : [...f.amen, k]);
  const toggleC = (k) => upd("cerca", f.cerca.includes(k) ? f.cerca.filter((a) => a !== k) : [...f.cerca, k]);
  const submit = () => { if (!f.titulo || !f.precio || !f.banos || !f.m2 || !f.wa) { setErr("Completa los campos con *"); return; } save({ ...f, precio: +f.precio, hab: +f.hab || 0, banos: +f.banos, parqueos: +f.parqueos || 0, m2: +f.m2 }); };
  return (
    <div className={`fixed inset-0 z-40 max-w-md mx-auto ${T.bg} ${T.text} overflow-y-auto`}>
      <div className={`sticky top-0 ${T.card} border-b ${T.border} h-14 px-4 flex items-center gap-3 z-10`}>
        <button onClick={close}><X size={22} /></button><span className="font-bold">{editing ? "Editar propiedad" : "Publicar propiedad"}</span>
      </div>
      <div className="p-4 space-y-4 pb-28">
        <div><label className="text-sm font-semibold mb-2 block">Tipo *</label>
          <div className="grid grid-cols-3 gap-2">{TIPOS.map((t) => <button key={t.k} onClick={() => upd("tipo", t.k)} className={`flex flex-col items-center gap-1 py-3 rounded-xl border ${f.tipo === t.k ? "bg-emerald-600 border-emerald-600 text-white" : `${T.card2} ${T.border} ${T.sub}`}`}><t.icon size={20} /><span className="text-xs font-medium">{t.label}</span></button>)}</div>
        </div>
        <Field T={T} label="Título *"><input value={f.titulo} onChange={(e) => upd("titulo", e.target.value)} placeholder="Ej: Casa con patio en El Llano" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field T={T} label="Precio *"><input type="number" value={f.precio} onChange={(e) => upd("precio", e.target.value)} placeholder="0" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`} /></Field>
          <Field T={T} label="Moneda"><select value={f.moneda} onChange={(e) => upd("moneda", e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`}><option>RD$</option><option>US$</option></select></Field>
        </div>
        <Field T={T} label="Sector / Zona (Peravia)"><select value={f.sector} onChange={(e) => upd("sector", e.target.value)} className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`}>{SECTOR_KEYS.map((s) => <option key={s}>{s}</option>)}</select></Field>
        <Field T={T} label="WhatsApp * (ej: 18095551234)"><input value={f.wa} onChange={(e) => upd("wa", e.target.value)} placeholder="18095551234" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field T={T} label="Habitaciones"><input type="number" value={f.hab} onChange={(e) => upd("hab", e.target.value)} placeholder="0" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`} /></Field>
          <Field T={T} label="Baños *"><input type="number" value={f.banos} onChange={(e) => upd("banos", e.target.value)} placeholder="0" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`} /></Field>
          <Field T={T} label="Parqueos"><input type="number" value={f.parqueos} onChange={(e) => upd("parqueos", e.target.value)} placeholder="0" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`} /></Field>
          <Field T={T} label="Área m² *"><input type="number" value={f.m2} onChange={(e) => upd("m2", e.target.value)} placeholder="0" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`} /></Field>
        </div>
        <Field T={T} label="¿Amueblado?">
          <div className="flex gap-2">{[["sin", "No"], ["semi", "Semi"], ["full", "Full"]].map(([k, l]) => <button key={k} onClick={() => upd("amueblado", k)} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${f.amueblado === k ? "bg-emerald-600 border-emerald-600 text-white" : `${T.card2} ${T.border} ${T.sub}`}`}>{l}</button>)}</div>
        </Field>
        <Field T={T} label="Descripción"><textarea value={f.descripcion} onChange={(e) => upd("descripcion", e.target.value)} rows={3} placeholder="Describe la propiedad…" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm resize-none`} /></Field>
        <div><label className="text-sm font-semibold mb-2 block">Amenidades</label><div className="flex flex-wrap gap-2">{AMENIDADES.map((a) => { const on = f.amen.includes(a.k); return <button key={a.k} onClick={() => toggleA(a.k)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${on ? "bg-emerald-600 border-emerald-600 text-white" : `${T.card2} ${T.border} ${T.sub}`}`}><a.icon size={13} /> {a.label}</button>; })}</div></div>
        <div><label className="text-sm font-semibold mb-2 block">Cerca de</label><div className="flex flex-wrap gap-2">{CERCANIAS.map((c) => { const on = f.cerca.includes(c); return <button key={c} onClick={() => toggleC(c)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border ${on ? "bg-blue-600 border-blue-600 text-white" : `${T.card2} ${T.border} ${T.sub}`}`}><MapPin size={12} /> {c}</button>; })}</div></div>
        {err && <div className="text-sm text-rose-500 flex items-center gap-1.5"><Flag size={15} /> {err}</div>}
      </div>
      <div className={`fixed bottom-0 left-0 right-0 max-w-md mx-auto ${T.card} border-t ${T.border} p-3`}>
        <button onClick={submit} className="w-full py-3 rounded-xl bg-emerald-600 active:bg-emerald-700 text-white font-semibold">{editing ? "Guardar cambios" : "Publicar propiedad"}</button>
      </div>
    </div>
  );
}

// ============ FILTROS (bottom sheet) ============
function FiltersSheet({ T, filters, setFilters, saveAlert, close }) {
  const [f, setF] = useState(filters);
  const toggleA = (k) => setF({ ...f, amen: f.amen.includes(k) ? f.amen.filter((a) => a !== k) : [...f.amen, k] });
  const apply = () => { setFilters(f); close(); };
  const clear = () => setF({ q: f.q, tipo: "", sector: "", min: "", max: "", hab: "", amen: [], soloVerif: false });
  return (
    <Sheet T={T} close={close} title="Filtros">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field T={T} label="Tipo"><select value={f.tipo} onChange={(e) => setF({ ...f, tipo: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`}><option value="">Todos</option>{TIPOS.map((t) => <option key={t.k} value={t.k}>{t.label}</option>)}</select></Field>
          <Field T={T} label="Sector"><select value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })} className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`}><option value="">Todos</option>{SECTOR_KEYS.map((s) => <option key={s} value={s}>{s}</option>)}</select></Field>
          <Field T={T} label="Precio mín (RD$)"><input type="number" value={f.min} onChange={(e) => setF({ ...f, min: e.target.value })} placeholder="0" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`} /></Field>
          <Field T={T} label="Precio máx (RD$)"><input type="number" value={f.max} onChange={(e) => setF({ ...f, max: e.target.value })} placeholder="∞" className={`w-full px-3 py-2.5 rounded-xl border ${T.input} text-sm`} /></Field>
        </div>
        <Field T={T} label="Habitaciones (mín)"><div className="flex gap-2">{["", "1", "2", "3", "4"].map((n) => <button key={n} onClick={() => setF({ ...f, hab: n })} className={`flex-1 py-2 rounded-lg text-sm font-medium border ${f.hab === n ? "bg-blue-600 border-blue-600 text-white" : `${T.card2} ${T.border} ${T.sub}`}`}>{n === "" ? "Todas" : n + "+"}</button>)}</div></Field>
        <label className="flex items-center gap-2.5 cursor-pointer"><input type="checkbox" checked={f.soloVerif} onChange={(e) => setF({ ...f, soloVerif: e.target.checked })} className="w-5 h-5 accent-blue-600" /><span className="text-sm flex items-center gap-1"><ShieldCheck size={16} className="text-emerald-500" /> Solo propietarios verificados</span></label>
        <div><label className="text-sm font-semibold mb-2 block">Amenidades</label><div className="flex flex-wrap gap-2">{AMENIDADES.map((a) => { const on = f.amen.includes(a.k); return <button key={a.k} onClick={() => toggleA(a.k)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${on ? "bg-blue-600 border-blue-600 text-white" : `${T.card2} ${T.border} ${T.sub}`}`}><a.icon size={13} /> {a.label}</button>; })}</div></div>
      </div>
      <div className="flex gap-2 mt-5">
        <button onClick={clear} className={`px-4 py-3 rounded-xl border ${T.border} ${T.sub} text-sm font-medium`}>Limpiar</button>
        <button onClick={() => { setFilters(f); saveAlert(); }} className="px-4 py-3 rounded-xl bg-amber-500 text-white text-sm font-medium flex items-center gap-1.5"><BellRing size={15} /> Alerta</button>
        <button onClick={apply} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-semibold">Ver resultados</button>
      </div>
    </Sheet>
  );
}

// ============ CALC (bottom sheet) ============
function CalcSheet({ T, close }) {
  const [ing, setIng] = useState("");
  const max = ing ? Math.round(+ing * 0.3) : 0;
  return (
    <Sheet T={T} close={close} title="¿Me alcanza?">
      <p className={`text-sm ${T.sub} mb-4`}>Tu alquiler no debería pasar del 30% de tus ingresos mensuales.</p>
      <Field T={T} label="Tus ingresos mensuales (RD$)"><div className="relative"><DollarSign size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${T.sub}`} /><input type="number" value={ing} onChange={(e) => setIng(e.target.value)} placeholder="Ej: 50000" className={`w-full pl-9 pr-3 py-3 rounded-xl border ${T.input} text-sm`} /></div></Field>
      {max > 0 && (
        <div className="mt-4 space-y-3">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white"><div className="text-xs opacity-80 mb-1">Alquiler recomendado máximo</div><div className="text-3xl font-extrabold">RD${fmt(max)}<span className="text-base font-normal opacity-80">/mes</span></div></div>
          <div className={`p-3 rounded-xl ${T.card2} text-sm`}><div className="font-semibold mb-1.5 flex items-center gap-1.5"><Wallet size={15} /> Para mudarte necesitarías:</div>
            <div className={`space-y-1 ${T.sub} text-xs`}>
              <div className="flex justify-between"><span>1er mes</span><span className="font-medium">RD${fmt(max)}</span></div>
              <div className="flex justify-between"><span>Depósito (1 mes)</span><span className="font-medium">RD${fmt(max)}</span></div>
              <div className={`flex justify-between pt-1.5 border-t ${T.border} font-bold ${T.text}`}><span>Total inicial</span><span>RD${fmt(max * 2)}</span></div>
            </div>
          </div>
        </div>
      )}
    </Sheet>
  );
}

// ============ AUTH (bottom sheet) ============
function AuthSheet({ T, label, login, close }) {
  return (
    <Sheet T={T} close={close} title="Inicia sesión">
      <div className="text-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3"><Home size={26} /></div>
        <p className={`text-sm ${T.sub}`}>Necesitas una cuenta para {label}.</p>
      </div>
      <button onClick={() => login("google")} className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl border ${T.border} font-medium mb-2.5`}>
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#4285F4" d="M45 24c0-1.6-.1-3.1-.4-4.6H24v9.1h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1C42.7 36.9 45 31 45 24z" /><path fill="#34A853" d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.1 15.4 46 24 46z" /><path fill="#FBBC05" d="M11.8 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-3 .7-4.3v-5.7H4.5C3 17.1 2 20.4 2 24s1 6.9 2.5 9.7l7.3-5.4z" /><path fill="#EA4335" d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.4 2 8.1 6.9 4.5 14.3l7.3 5.7c1.7-5.2 6.5-9.3 12.2-9.3z" /></svg>
        Continuar con Google
      </button>
      <button onClick={() => login("guest")} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-slate-900 text-white font-medium"><User size={17} /> Continuar como invitado</button>
      <p className={`text-xs ${T.sub} text-center mt-4`}>Demo: el inicio de sesión es simulado.</p>
    </Sheet>
  );
}

// ============ AUX ============
function Sheet({ T, close, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center max-w-md mx-auto" onClick={close}>
      <div className="absolute inset-0 bg-black/50" />
      <div className={`relative w-full ${T.card} rounded-t-3xl max-h-[88vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 pt-2 pb-1 flex justify-center" style={{ background: "inherit" }}><div className="w-10 h-1 rounded-full bg-slate-300" /></div>
        <div className="px-5 pb-6 pt-2">
          <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">{title}</h3><button onClick={close} className={`w-8 h-8 rounded-lg ${T.card2} flex items-center justify-center`}><X size={18} /></button></div>
          {children}
        </div>
      </div>
    </div>
  );
}
function Chip({ on, onClick, T, children }) {
  return <button onClick={onClick} className={`shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition ${on ? "bg-blue-600 border-blue-600 text-white" : `${T.card} ${T.border} ${T.sub}`}`}>{children}</button>;
}
function Field({ T, label, children }) { return <div><label className={`text-sm font-semibold mb-1.5 block ${T.text}`}>{label}</label>{children}</div>; }
function Section({ T, title, children }) { return <div className={`mb-5 pb-5 border-b ${T.border} last:border-0`}><h3 className="font-bold mb-2.5">{title}</h3>{children}</div>; }
function Empty({ T, icon: Ic, title, sub }) { return <div className="text-center py-14"><div className={`w-16 h-16 rounded-2xl ${T.card2} flex items-center justify-center mx-auto mb-4 ${T.sub}`}><Ic size={28} /></div><h3 className="font-bold mb-1">{title}</h3><p className={`${T.sub} text-sm max-w-xs mx-auto`}>{sub}</p></div>; }
function Toast({ msg }) { return <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl text-sm font-medium max-w-[90%] text-center">{msg}</div>; }
