const { useState } = React;

const FONT = "'Courier New', monospace";
const MONO = "'Courier New', monospace";

// ── MOTOR TREE DATA ──────────────────────────────────────────────
const MOTOR = [
  {
    id: 1, step: "1", title: "INFORMACIÓN GENERAL", color: "#9B5DE5", icon: "🎮",
    nodes: [
      { label: "Nombre + Descripción" },
      { label: "Tipo", children: ["👤 Individual","👥 Equipos → ¿cuántos?","🤝 Cooperativo"] },
      { label: "Nº jugadores", children: ["Mínimo","Máximo","Fijo o variable"] },
      { label: "Acceso", children: ["🌐 Pública","🔒 Privada","🔑 Código (default)","🔗 Link"] },
    ]
  },
  {
    id: 2, step: "2", title: "ESTRUCTURA DE PARTIDA", color: "#00F5FF", icon: "🏗️",
    nodes: [
      { label: "Rondas", children: ["Sin rondas → continua","Con rondas: 1-N / ∞","Cierre: Manual / Timer / Auto","Reinicio: Nada / Pts ronda / Turnos / Herr."] },
      { label: "Turnos", children: ["Sin turnos → Simultáneo / Mixto","Con turnos: Fijo / Aleatorio / Rotativo / Por puntaje","Saltar turno · Turnos extra · Límite/ronda"] },
      { label: "👑 Token primer jugador", children: ["Off","On → aparece en marcador, se puede pasar"] },
      { label: "⏱ Temporizador", children: ["Off","On → Por turno / ronda / partida","Alertas visual + sonora","Al expirar: Nada / Saltar / 0pts / Penalización / Auto"] },
    ]
  },
  {
    id: 3, step: "3", title: "CONDICIÓN DE VICTORIA", color: "#FFD447", icon: "🏆",
    nodes: [
      { label: "Por puntos", children: ["Más puntos / Llegar a X / Exacto X","Validación: Al instante / Fin de ronda"] },
      { label: "Por victorias", children: ["Más rondas / Meta N / Última ronda decisiva"] },
      { label: "Por vidas", children: ["Último con vida / Más rondas / Más vidas"] },
      { label: "Por eliminación", children: ["Último jugador / Último equipo / Eliminar todos"] },
      { label: "Por objetivo/evento", children: ["Misión / Recurso / Condición / Evento único"] },
      { label: "Por tiempo", children: ["Mejor posicionado al agotar tiempo"] },
      { label: "Manual", children: ["Host decide cuándo / Host define ganador"] },
      { label: "+ Condiciones custom", children: ["Lista libre: Full, Corrida, Flush...","Desempate: Compartir / Herramienta / Host"] },
    ]
  },
  {
    id: 4, step: "4", title: "CONDICIÓN DE DERROTA", color: "#FF3B5C", icon: "💀",
    nodes: [
      { label: "Sin derrota explícita → solo pierde quien no gana" },
      { label: "Con derrota explícita", children: [
        "Por puntos: bajar de X / último / no mínimo / muy atrás",
        "Por victorias: menos / no alcanzar / N derrotas seguidas",
        "Por vidas: 0 / daño acumulado / muerte instantánea",
        "Por eliminación: último ronda / regla / manual",
        "Por tiempo: timeout / no actuar / exceso penalizaciones",
        "Por objetivo fallido",
        "Por evento externo: dado / ruleta / moneda / IA / host",
      ]},
      { label: "Momento evaluación", children: ["Inmediato / Fin turno / Fin ronda / Fase / Fin partida"] },
      { label: "Consecuencia", children: ["Eliminado / Espectador / Pierde turno / Pierde pts / Debilitado / Solo registro"] },
    ]
  },
  {
    id: 5, step: "5", title: "SISTEMA DE PROGRESO", color: "#00FF9D", icon: "📊",
    nodes: [
      { label: "¿Qué se registra?", children: ["🏅 Puntos · 🏆 Victorias · ❤️ Vidas","📦 Recursos · 🪙 Monedas · 🎯 Objetivos · 🔢 Custom"] },
      { label: "Tipo de captura", children: ["Manual / Automática / Con herramienta","Con cámara ★ / Con IA ★ / Mixta"] },
      { label: "Naturaleza del valor", children: ["Solo positivos / Pos+neg / Enteros / Decimales"] },
      { label: "Acumulación", children: ["Global · Por ronda (historial+total) · Reinicia c/ronda · Siempre conserva"] },
      { label: "Modificadores", children: ["⬆️ Bonus · ⬇️ Penalización · ✖️ Multiplicador","🦹 Robo · 🛡️ Escudo · 🚫 Bloqueo · 2️⃣ Doble siguiente"] },
      { label: "Visibilidad", children: ["Pública / Solo host / Solo jugador / Oculta hasta fin ronda"] },
    ]
  },
  {
    id: 6, step: "6", title: "SISTEMA DE ELIMINACIÓN", color: "#FF6B35", icon: "⚔️",
    nodes: [
      { label: "Sin eliminación → todos juegan hasta el final" },
      { label: "Con eliminación", children: [
        "¿Cuándo? Ronda 1 / 2 / 3 / N",
        "¿Cómo? Último lugar / Menor puntaje / 0 vidas / Condición / Manual",
        "¿Empate? Nadie / Todos / Herramienta / Host / IA",
        "¿Qué pasa? Sale / Espectador / Mantiene score / Sigue parcial",
      ]},
    ]
  },
  {
    id: 7, step: "7", title: "HERRAMIENTAS INTEGRADAS", color: "#A855F7", icon: "🧰",
    nodes: [
      { label: "Sin herramientas en app → solo físicas" },
      { label: "Con herramientas", children: [
        "Modo: Libre (informal) / Formal (afectan marcador)",
        "Registro: No / Manual / Auto / Mixto",
        "🪙 Moneda: Libre / Desempate / Orden / Eventos",
        "🎲 Dados: d4–d20 + custom (d3 a d100)",
        "🎡 Ruleta: Fijos / Custom / Pesos",
        "✊ PPS: Todos / Solo jugadores activos",
        "🔢 Contador manual (métrica secundaria)",
        "🤖 Juez IA ★",
      ]},
      { label: "¿Qué afectan? Puntaje / Turno / Eliminación / Eventos / Reglas" },
    ]
  },
  {
    id: 8, step: "8", title: "ROLES Y PERMISOS", color: "#4A90FF", icon: "👥",
    nodes: [
      { label: "Roles", children: ["👑 Host (siempre)","🎮 Jugador (siempre)","👁 Espectador · ⚖️ Juez · 📝 Anotador"] },
      { label: "Permisos", children: [
        "¿Quién captura puntajes? Host / Jugador / Todos / Juez",
        "¿Quién usa herramientas? Todos / Host / Jugador / Juez",
        "¿Quién cierra ronda? Host / Todos / Juez",
        "¿Quién pausa? Host / Todos",
        "¿Quién corrige errores? Host / Juez / Todos",
      ]},
      { label: "Visibilidad", children: [
        "Host ve: Todo / Parcial / Solo marcador",
        "Jugador ve: Todo / Parcial / Solo suyo",
        "Espectador ve: Marcador / Todo (read-only) / Nada",
      ]},
    ]
  },
  {
    id: 9, step: "9", title: "FINALIZACIÓN", color: "#06D6A0", icon: "🏁",
    nodes: [
      { label: "¿Cómo termina?", children: ["Victoria · Fin rondas · Tiempo agotado · Última eliminación · Manual"] },
      { label: "¿Qué pasa al terminar?", children: ["Pantalla final · Guarda historial","Exporta: JSON / CSV / Imagen / Reporte"] },
      { label: "¿Hay revancha?", children: [
        "Mantener: Jugadores / Sala / Configuración",
        "Reiniciar: Score / Todo",
      ]},
    ]
  },
];

// ── CUBILETE FLOW ────────────────────────────────────────────────
const CUBILETE = {
  title: "🎲 CUBILETE — Flujo de prueba completo",
  description: "Juego de dados mexicano. 2-6 jugadores. Se lanzan 5 dados con cubilete. Gana quien forme la mejor jugada. Las jugadas de menor a mayor: Par, Dos pares, Tercia, Full, Póker, Quintilla. Se juega por rondas, el perdedor de cada ronda paga una ficha. Sin fichas = eliminado.",
  config: [
    { step: "1. Información general", color: "#9B5DE5", items: [
      { field: "Nombre", value: "Cubilete" },
      { field: "Descripción", value: "Dados con cubilete · El que más fichas pierda, paga" },
      { field: "Tipo", value: "👤 Individual", note: "Cada jugador por su cuenta" },
      { field: "Jugadores", value: "2 – 6", note: "Fijo o variable" },
      { field: "Acceso", value: "🔑 Por código", note: "Default" },
    ]},
    { step: "2. Estructura", color: "#00F5FF", items: [
      { field: "Rondas", value: "∞ Infinito", note: "La partida termina cuando todos menos uno queden sin fichas" },
      { field: "Cierre de ronda", value: "Manual", note: "El host cierra cuando todos los jugadores lanzaron" },
      { field: "Reinicio entre rondas", value: "Nada", note: "Las fichas (vidas) persisten entre rondas" },
      { field: "Turnos", value: "✅ Fijo", note: "Cada jugador lanza en su turno, orden del reloj" },
      { field: "Saltar turno", value: "No" },
      { field: "Token primer jugador", value: "✅ On", note: "Rotativo — quien perdió la ronda anterior va primero" },
      { field: "Temporizador", value: "Off", note: "No hay límite de tiempo por turno en Cubilete estándar" },
    ]},
    { step: "3. Condición de victoria", color: "#FFD447", items: [
      { field: "Modo", value: "Por vidas / supervivencia", note: "Gana el último con fichas" },
      { field: "Sub-modo", value: "Último con vida", note: "El resto se va quedando sin fichas" },
      { field: "Desempate", value: "Host decide", note: "Si dos quedan sin fichas en misma ronda, el host lo arbitra" },
      { field: "Condiciones custom", value: "Quintilla, Póker, Full, Tercia, Dos pares, Par", note: "Para registrar cómo ganó cada ronda" },
    ]},
    { step: "4. Condición de derrota", color: "#FF3B5C", items: [
      { field: "Con derrota explícita", value: "✅ Sí" },
      { field: "Tipo", value: "Por vidas → 0 vidas", note: "El jugador pierde cuando sus fichas llegan a 0" },
      { field: "Momento", value: "Fin de ronda", note: "Se evalúa al cerrar cada ronda" },
      { field: "Consecuencia", value: "Eliminación total", note: "Sale de la partida — paga la cuenta real 😂" },
    ]},
    { step: "5. Sistema de progreso", color: "#00FF9D", items: [
      { field: "¿Qué se registra?", value: "❤️ Vidas (fichas)", note: "Cada jugador empieza con N fichas (ej: 5)" },
      { field: "Tipo de captura", value: "Manual", note: "El host o cada jugador registra quién perdió la ronda" },
      { field: "Naturaleza del valor", value: "Solo positivos (enteros)", note: "Las fichas no pueden ser negativas" },
      { field: "Acumulación", value: "Global / Siempre conserva", note: "Las fichas se acumulan y bajan a lo largo de toda la partida" },
      { field: "Modificadores", value: "⬇️ Penalización", note: "El perdedor de ronda pierde 1 ficha. Algunos juegos: ×2 si perdiste con par" },
      { field: "Visibilidad", value: "Pública", note: "Todos ven cuántas fichas tiene cada quien" },
    ]},
    { step: "6. Eliminación", color: "#FF6B35", items: [
      { field: "¿Hay eliminación?", value: "✅ Sí" },
      { field: "¿Cuándo inicia?", value: "Ronda 1", note: "Desde el principio — en cubilete siempre hay riesgo" },
      { field: "¿Cómo se elimina?", value: "0 vidas (fichas)", note: "El jugador sin fichas queda eliminado" },
      { field: "¿Empate?", value: "Host decide", note: "Si dos quedan a 0 en la misma ronda" },
      { field: "¿Qué pasa al eliminado?", value: "Sale de la partida", note: "Queda como espectador o se va a pagar jaja" },
    ]},
    { step: "7. Herramientas", color: "#A855F7", items: [
      { field: "¿Herramientas en app?", value: "Complemento libre / informal", note: "Los dados son físicos (cubilete de verdad). La app solo lleva el marcador" },
      { field: "Herramientas activas", value: "🔢 Contador manual", note: "Para registrar fichas. Los dados reales se usan físicamente" },
      { field: "Modo", value: "Informal", note: "No afectan el marcador — los dados físicos son lo que cuenta" },
      { field: "Registro", value: "Manual", note: "El host confirma quién perdió y cuántas fichas" },
    ]},
    { step: "8. Roles y permisos", color: "#4A90FF", items: [
      { field: "Roles activos", value: "Host + Jugadores", note: "No se necesita juez ni anotador separado" },
      { field: "Captura puntajes", value: "Solo el host", note: "El host registra quién pierde fichas cada ronda" },
      { field: "Cierre de ronda", value: "Solo el host" },
      { field: "Jugador ve", value: "Todos ven todo", note: "Fichas de todos visibles — parte del juego" },
      { field: "Espectador ve", value: "Marcador en vivo" },
    ]},
    { step: "9. Finalización", color: "#06D6A0", items: [
      { field: "¿Cómo termina?", value: "Última eliminación", note: "Cuando queda un solo jugador con fichas" },
      { field: "Pantalla final", value: "✅ Sí", note: "Animada con el ganador y el historial de fichas" },
      { field: "Guarda historial", value: "✅ Sí" },
      { field: "Exporta", value: "Imagen resumen", note: "Para compartir quién ganó y quién pagó" },
      { field: "Revancha", value: "Mantener jugadores + sala + config · Reiniciar fichas", note: "La revancha más usada en Cubilete" },
    ]},
  ],
  gaps: [
    { title: "✅ Todo cubierto", items: [
      "Registro de vidas/fichas (Progreso → Vidas)",
      "Eliminación por 0 fichas (Eliminación → 0 vidas)",
      "Turnos fijos con token rotativo (Estructura)",
      "Condiciones custom por jugada (Full, Quintilla...)",
      "Penalización por ronda perdida (Modificadores)",
      "Revancha manteniendo jugadores",
    ]},
    { title: "⚠️ Pendiente de runtime", items: [
      "Fichas iniciales configurables (ej: empezar con 5)",
      "La app no lanza los dados — son físicos, intencional",
      "El modificador ×2 por perder con par requiere lógica custom en runtime",
    ]},
    { title: "💡 Observaciones del motor", items: [
      "Flujo lógico: el motor cubre Cubilete sin hacks",
      "La separación Victoria (último con vidas) + Derrota (0 fichas) + Eliminación (sale) funciona correctamente",
      "El token de primer jugador es útil para el turno rotativo del perdedor",
      "Las condiciones custom (Full, Quintilla) permiten registrar la jugada ganadora de cada ronda",
    ]},
  ]
};

// ── COMPONENTS ───────────────────────────────────────────────────
function TreeNode({ label, children, depth = 0, color }) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = children && children.length > 0;
  return (
    <div style={{ marginLeft: depth * 14 }}>
      <div
        style={{
          display: "flex", alignItems: "flex-start", gap: 6, padding: "2px 0",
          cursor: hasChildren ? "pointer" : "default",
          userSelect: "none",
        }}
        onClick={() => hasChildren && setOpen(o => !o)}
      >
        <span style={{
          fontFamily: MONO, fontSize: "0.7rem",
          color: color || "rgba(255,255,255,.3)",
          marginTop: 2, flexShrink: 0,
          width: 14,
        }}>
          {hasChildren ? (open ? "▾" : "▸") : "·"}
        </span>
        <span style={{
          fontFamily: MONO, fontSize: "0.72rem",
          color: hasChildren ? (color || "#fff") : "rgba(255,255,255,.55)",
          lineHeight: 1.5,
        }}>
          {typeof label === "string" ? label : label}
        </span>
      </div>
      {hasChildren && open && (
        <div style={{ borderLeft: `1px solid ${color || "rgba(255,255,255,.1)"}22`, marginLeft: 6 }}>
          {children.map((c, i) => (
            <TreeNode key={i} label={c} depth={depth + 1} color={color} />
          ))}
        </div>
      )}
    </div>
  );
}

function MotorCard({ data, active, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        border: `1px solid ${active ? data.color : data.color + "33"}`,
        borderRadius: 10,
        padding: "10px 12px",
        marginBottom: 6,
        cursor: "pointer",
        background: active ? data.color + "15" : "rgba(255,255,255,.02)",
        transition: "all .2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: "1.1rem" }}>{data.icon}</span>
        <div>
          <div style={{
            fontFamily: MONO, fontSize: "0.65rem", fontWeight: "bold",
            color: active ? data.color : "rgba(255,255,255,.5)",
            letterSpacing: 1,
          }}>
            {data.step}. {data.title}
          </div>
        </div>
        <span style={{ marginLeft: "auto", color: data.color + "88", fontSize: ".8rem" }}>
          {active ? "▾" : "▸"}
        </span>
      </div>

      {active && (
        <div style={{ marginTop: 10 }}>
          {data.nodes.map((node, i) => (
            <TreeNode key={i} label={node.label} children={node.children} color={data.color} />
          ))}
        </div>
      )}
    </div>
  );
}

function CubileteRow({ item }) {
  return (
    <div style={{
      display: "flex", gap: 8, paddingBottom: 6, marginBottom: 6,
      borderBottom: "1px solid rgba(255,255,255,.05)"
    }}>
      <div style={{
        fontFamily: MONO, fontSize: "0.62rem",
        color: "rgba(255,255,255,.35)", minWidth: 110, flexShrink: 0, paddingTop: 1,
        letterSpacing: 0.5,
      }}>{item.field}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: MONO, fontSize: "0.7rem", color: "#fff", marginBottom: item.note ? 2 : 0 }}>
          {item.value}
        </div>
        {item.note && (
          <div style={{ fontFamily: MONO, fontSize: "0.6rem", color: "rgba(255,255,255,.4)", lineHeight: 1.4 }}>
            → {item.note}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────
function MotorDiagrama() {
  const [tab, setTab] = useState("motor");
  const [activeStep, setActiveStep] = useState(null);
  const [activeCubilete, setActiveCubilete] = useState(null);

  return (
    <div style={{
      background: "#070710",
      minHeight: "100vh",
      color: "#fff",
      fontFamily: MONO,
    }}>
      {/* Header */}
      <div style={{
        borderBottom: "1px solid rgba(255,255,255,.08)",
        padding: "16px 20px 12px",
        position: "sticky", top: 0, zIndex: 10,
        background: "#070710",
      }}>
        <div style={{
          fontFamily: MONO, fontSize: "0.9rem", letterSpacing: 4,
          color: "#00F5FF", marginBottom: 2,
        }}>BOARDGAMEZ OS</div>
        <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(255,255,255,.3)", letterSpacing: 3 }}>
          MOTOR DIAGRAM v1.0 · 9 SECCIONES · 80+ CAMPOS
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
          {[
            { id: "motor", label: "📐 Diagrama del motor" },
            { id: "cubilete", label: "🎲 Flujo: Cubilete" },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              style={{
                fontFamily: MONO, fontSize: "0.62rem", letterSpacing: 1,
                padding: "6px 14px", borderRadius: 6, border: "none", cursor: "pointer",
                background: tab === t.id ? "#00F5FF" : "rgba(255,255,255,.08)",
                color: tab === t.id ? "#070710" : "rgba(255,255,255,.5)",
                transition: "all .2s",
              }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "16px 20px 60px", maxWidth: 700, margin: "0 auto" }}>

        {/* ── TAB: MOTOR ── */}
        {tab === "motor" && (
          <div>
            <div style={{
              fontFamily: MONO, fontSize: "0.6rem", color: "rgba(255,255,255,.35)",
              letterSpacing: 1, marginBottom: 16, lineHeight: 1.6,
            }}>
              Toca cada sección para expandir el árbol completo de opciones.
              Las secciones que dependen de selecciones anteriores se activan condicionalmente en el wizard.
            </div>

            {/* Dependency note */}
            <div style={{
              background: "rgba(255,212,71,.06)", border: "1px solid rgba(255,212,71,.2)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              fontFamily: MONO, fontSize: "0.62rem", color: "rgba(255,212,71,.8)", lineHeight: 1.7
            }}>
              <strong>Lógica de acotación:</strong><br/>
              · Si "Sin rondas" → se ocultan opciones de cierre de ronda y reinicio<br/>
              · Si "Sin turnos" → se ocultan orden, skip, extras<br/>
              · Si victoria ≠ "Puntos" → se oculta sección de meta numérica<br/>
              · Si "Sin derrota explícita" → colapsa toda esa sección<br/>
              · Si "Sin eliminación" → colapsa sección 6<br/>
              · Si "Sin herramientas" → colapsa sección 7<br/>
              · Cooperative → colapsa condiciones individuales en victoria<br/>
              · Roles: si no hay Juez → desaparece opción "Juez" en permisos
            </div>

            {MOTOR.map(s => (
              <MotorCard
                key={s.id}
                data={s}
                active={activeStep === s.id}
                onClick={() => setActiveStep(activeStep === s.id ? null : s.id)}
              />
            ))}

            {/* Stats */}
            <div style={{
              marginTop: 16,
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8
            }}>
              {[
                { label: "Secciones", val: "9" },
                { label: "Campos config.", val: "80+" },
                { label: "Variantes aprox.", val: "∞" },
              ].map(s => (
                <div key={s.label} style={{
                  background: "rgba(255,255,255,.03)",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 8, padding: "10px 12px", textAlign: "center"
                }}>
                  <div style={{ fontFamily: MONO, fontSize: "1.4rem", color: "#00F5FF" }}>{s.val}</div>
                  <div style={{ fontFamily: MONO, fontSize: "0.55rem", color: "rgba(255,255,255,.35)", letterSpacing: 1, marginTop: 2 }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── TAB: CUBILETE ── */}
        {tab === "cubilete" && (
          <div>
            {/* Description */}
            <div style={{
              background: "rgba(255,107,53,.06)", border: "1px solid rgba(255,107,53,.2)",
              borderRadius: 10, padding: "12px 14px", marginBottom: 16,
              fontFamily: MONO, fontSize: "0.62rem", color: "rgba(255,255,255,.6)", lineHeight: 1.7
            }}>
              <div style={{ color: "#FF6B35", fontWeight: "bold", marginBottom: 4 }}>
                {CUBILETE.title}
              </div>
              {CUBILETE.description}
            </div>

            {/* Config sections */}
            {CUBILETE.config.map((section, si) => (
              <div key={si} style={{ marginBottom: 8 }}>
                <div
                  onClick={() => setActiveCubilete(activeCubilete === si ? null : si)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    border: `1px solid ${section.color}44`,
                    borderRadius: activeCubilete === si ? "10px 10px 0 0" : 10,
                    padding: "9px 14px", cursor: "pointer",
                    background: activeCubilete === si ? section.color + "15" : "rgba(255,255,255,.02)",
                    transition: "all .2s",
                  }}
                >
                  <div style={{
                    fontFamily: MONO, fontSize: "0.65rem", fontWeight: "bold",
                    color: activeCubilete === si ? section.color : "rgba(255,255,255,.5)",
                    letterSpacing: 1,
                  }}>
                    {section.step}
                  </div>
                  <span style={{ color: section.color + "88" }}>
                    {activeCubilete === si ? "▾" : "▸"}
                  </span>
                </div>

                {activeCubilete === si && (
                  <div style={{
                    border: `1px solid ${section.color}33`,
                    borderTop: "none", borderRadius: "0 0 10px 10px",
                    padding: "12px 14px",
                    background: "rgba(255,255,255,.01)",
                  }}>
                    {section.items.map((item, ii) => (
                      <CubileteRow key={ii} item={item} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Analysis */}
            <div style={{ marginTop: 20 }}>
              {CUBILETE.gaps.map((g, gi) => (
                <div key={gi} style={{
                  marginBottom: 10,
                  background: gi === 0 ? "rgba(0,255,157,.04)" : gi === 1 ? "rgba(255,212,71,.04)" : "rgba(0,245,255,.04)",
                  border: `1px solid ${gi === 0 ? "rgba(0,255,157,.2)" : gi === 1 ? "rgba(255,212,71,.2)" : "rgba(0,245,255,.2)"}`,
                  borderRadius: 10, padding: "12px 14px",
                }}>
                  <div style={{
                    fontFamily: MONO, fontSize: "0.65rem", fontWeight: "bold",
                    color: gi === 0 ? "#00FF9D" : gi === 1 ? "#FFD447" : "#00F5FF",
                    marginBottom: 8, letterSpacing: 1,
                  }}>
                    {g.title}
                  </div>
                  {g.items.map((item, ii) => (
                    <div key={ii} style={{
                      fontFamily: MONO, fontSize: "0.62rem",
                      color: "rgba(255,255,255,.55)", padding: "2px 0", lineHeight: 1.5
                    }}>
                      → {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Verdict */}
            <div style={{
              marginTop: 8,
              background: "linear-gradient(135deg,rgba(0,255,157,.08),rgba(0,245,255,.05))",
              border: "1px solid rgba(0,255,157,.3)",
              borderRadius: 10, padding: "14px 16px",
            }}>
              <div style={{
                fontFamily: MONO, fontSize: "0.7rem", color: "#00FF9D",
                fontWeight: "bold", marginBottom: 8, letterSpacing: 2,
              }}>
                VEREDICTO DEL MOTOR
              </div>
              <div style={{
                fontFamily: MONO, fontSize: "0.62rem",
                color: "rgba(255,255,255,.65)", lineHeight: 1.8,
              }}>
                ✅ El motor cubre Cubilete completamente sin hacks ni workarounds.<br/>
                ✅ La combinación Vidas + Eliminación + Victoria (último con vida) es exactamente lo que Cubilete necesita.<br/>
                ✅ Las condiciones custom (Full, Quintilla...) permiten enriquecer el registro de cada ronda.<br/>
                ✅ El token de primer jugador resuelve elegantemente el turno del perdedor.<br/>
                ✅ Herramientas en modo "informal" es la decisión correcta: los dados son físicos.<br/>
                ⚠️ Las fichas iniciales (ej: empezar con 5) requieren un campo numérico en el runtime — pendiente.<br/>
                ⚠️ El multiplicador ×2 por perder con par es una regla de variante que el motor registra como Modificador pero el runtime no lo aplica automáticamente aún.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
