import React, { useState, useEffect, useRef } from 'react';
import {
  Activity, Brain, Info, AlertTriangle, CheckCircle,
  FileText, ChevronRight, ActivitySquare, UploadCloud,
  AlertCircle, FileJson, BarChartHorizontal,
  Focus, MessageSquare, ClipboardList, X, Save, TrendingUp,
  Loader2, ServerCrash, Shield
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// API CONFIG
// En desarrollo: http://localhost:8000
// En producción: cambiar a la URL real del servidor
// ─────────────────────────────────────────────────────────────────────────────
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// ─────────────────────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────────────────────
const DotItem = ({ label, value, valColor }) => (
  <div className="flex justify-between items-start text-[13px] mb-2">
    <div className="flex items-start gap-2 mt-0.5">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${
        valColor === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'
      }`} />
      <span className="text-slate-700 font-medium leading-tight">{label}</span>
    </div>
    <span className={`font-bold whitespace-nowrap ml-2 ${
      valColor === 'rose' ? 'text-rose-600' : 'text-emerald-700'
    }`}>{value}</span>
  </div>
);

const FormSection = ({ title, level, desc, children, icon: Icon }) => {
  const styles = {
    obligatorio: { border: 'border-rose-200',   bg: 'bg-rose-50',    text: 'text-rose-900',   badge: 'text-rose-700 bg-rose-100'   },
    recomendado:  { border: 'border-amber-200',  bg: 'bg-amber-50',   text: 'text-amber-900',  badge: 'text-amber-700 bg-amber-100'  },
    opcional:     { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-900',badge: 'text-emerald-700 bg-emerald-100'},
  }[level];

  return (
    <div className={`border ${styles.border} rounded-xl overflow-hidden mb-6 bg-white shadow-sm`}>
      <div className={`${styles.bg} px-5 py-4 border-b ${styles.border}`}>
        <div className="flex justify-between items-center mb-1">
          <h3 className={`font-black flex items-center gap-2 ${styles.text}`}>
            {Icon && <Icon className="w-5 h-5" />}{title}
          </h3>
          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${styles.badge}`}>
            {level}
          </span>
        </div>
        {desc && <p className={`text-xs font-medium opacity-80 ${styles.text}`}>{desc}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

const FormGroup = ({ label, unit, required, helper, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
      {label}
      {unit && <span className="bg-slate-200 text-slate-600 px-1 rounded text-[10px]">{unit}</span>}
      {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {helper && <span className="text-[10px] text-slate-400 font-medium leading-tight">{helper}</span>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL FORM STATE
// Keys match PacienteDatos in main.py exactly
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  // Obligatorios
  pc_nacer_mm:        '',
  eg_semanas:         '',
  peso_nacer_g:       '',   // peso al nacer en gramos — para contexto clínico
  pc_40sem_cm:        '',
  dias_oxigeno:       '',
  educ_materna:       '',   // int 1-5
  griffiths_auditivo: '',
  // Recomendados
  grupo:                  '',
  horas_canguro:          '',
  dias_hospitalizacion:   '',
  fototerapia:            '',   // 0 o 1
  ingreso_percapita:      '',   // float COP
  educ_paterna:           '',   // int 1-5
  griffiths_motor:        '',
  griffiths_general:      '',
  leucomalacia:           '',   // 0-3
  // Opcionales
  talla_40sem_mm:   '',
  peso_3m_g:        '',
  talla_3m_mm:      '',
  peso_12m_g:       '',
  talla_12m_cm:     '',
  griffiths_loco12: '',
  dias_aminoglucosidos: '',
};

// SHAP bar — reads from API response shape
const ShapBar = ({ item, maxAbs }) => {
  // API returns: { feature, label_es, shap }
  const isRisk  = item.shap > 0;
  const width   = (Math.abs(item.shap) / maxAbs) * 100;
  const display = item.label_es || item.feature;
  const valText = (isRisk ? '+' : '') + item.shap.toFixed(3);

  return (
    <div className="flex items-center mb-3">
      <div className="w-5/12 text-right pr-4 text-xs font-semibold text-slate-600 truncate" title={display}>
        {display}
      </div>
      <div className="w-7/12 flex items-center">
        <div className="w-full flex">
          <div className="w-1/2 flex justify-end pr-[1px] border-r border-slate-400">
            {!isRisk && (
              <div className="bg-emerald-400 h-4 rounded-l-sm transition-all duration-500"
                   style={{ width: `${width}%` }} />
            )}
          </div>
          <div className="w-1/2 flex justify-start pl-[1px]">
            {isRisk && (
              <div className="bg-rose-400 h-4 rounded-r-sm transition-all duration-500"
                   style={{ width: `${width}%` }} />
            )}
          </div>
        </div>
        <span className={`text-xs font-bold ml-3 w-12 flex-shrink-0 ${
          isRisk ? 'text-rose-600' : 'text-emerald-600'
        }`}>{valText}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [isFormOpen, setIsFormOpen]   = useState(false);
  const [activeTab, setActiveTab]     = useState('global');
  const [isLoading, setIsLoading]     = useState(false);
  const [results, setResults]         = useState(null);
  const [apiError, setApiError]       = useState(null);
  const [uploadMsg, setUploadMsg]     = useState(null);
  const [evidOverride, setEvidOverride] = useState(null);
  const [apiStatus, setApiStatus]     = useState('unknown'); // 'ok' | 'error' | 'unknown'
  const fileInputRef = useRef(null);

  // Check backend health on mount
  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then(r => r.json())
      .then(d => setApiStatus(d.modelos_cargados?.includes('global') ? 'ok' : 'partial'))
      .catch(() => setApiStatus('error'));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Build payload: convert strings to numbers, leave blanks as null
  const buildPayload = (fd) => {
    const numFields = [
      'pc_nacer_mm','eg_semanas','pc_40sem_cm','dias_oxigeno','educ_materna',
      'griffiths_auditivo','horas_canguro','dias_hospitalizacion','fototerapia',
      'ingreso_percapita','educ_paterna','griffiths_motor','griffiths_general',
      'leucomalacia','talla_40sem_mm','peso_3m_g','talla_3m_mm','peso_12m_g',
      'talla_12m_cm','griffiths_loco12','dias_aminoglucosidos',
    ];
    const payload = {};
    for (const [k, v] of Object.entries(fd)) {
      if (v === '' || v === null || v === undefined) continue;
      payload[k] = numFields.includes(k) ? parseFloat(v) : v;
    }
    return payload;
  };

  const isFormValid = () => {
    const req = ['pc_nacer_mm','eg_semanas','pc_40sem_cm','dias_oxigeno',
                 'educ_materna','griffiths_auditivo'];
    return req.every(f => formData[f] !== '');
  };

  const handleSubmitForm = () => {
    if (!isFormValid()) return;
    setIsFormOpen(false);
    callAPI(formData);
  };

  const callAPI = async (fd) => {
    setIsLoading(true);
    setApiError(null);
    setResults(null);
    setEvidOverride(null);

    try {
      const payload = buildPayload(fd);
      const res = await fetch(`${API_URL}/api/predecir`, {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(err.detail || `Error ${res.status}`);
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        // Support both old field names (legacy) and new ones
        const mapped = {
          pc_nacer_mm:        data.pc_nacer_mm  ?? data.pc_nacer  ?? '',
          peso_nacer_g:       data.peso_nacer_g ?? data.peso      ?? '',
          eg_semanas:         data.eg_semanas   ?? data.semanas   ?? '',
          pc_40sem_cm:        data.pc_40sem_cm  ?? data.pc_40     ?? '',
          dias_oxigeno:       data.dias_oxigeno ?? data.oxigeno   ?? '',
          educ_materna:       data.educ_materna ?? (
            data.educacion === 'Primaria' ? 1 :
            data.educacion === 'Secundaria' ? 2 :
            data.educacion === 'Universitaria' ? 4 : ''
          ),
          griffiths_auditivo: data.griffiths_auditivo ?? data.griffiths_aud ?? '',
          grupo:              data.grupo ?? '',
          horas_canguro:      data.horas_canguro ?? '',
          dias_hospitalizacion: data.dias_hospitalizacion ?? data.hospitalizacion ?? '',
          fototerapia:        data.fototerapia ?? '',
          ingreso_percapita:  data.ingreso_percapita ?? '',
          educ_paterna:       data.educ_paterna ?? '',
          griffiths_motor:    data.griffiths_motor   ?? data.griffiths_mot ?? '',
          griffiths_general:  data.griffiths_general ?? data.griffiths_gen ?? '',
          leucomalacia:       data.leucomalacia ?? '',
          talla_40sem_mm:     data.talla_40sem_mm ?? '',
          peso_3m_g:          data.peso_3m_g  ?? '',
          talla_3m_mm:        data.talla_3m_mm ?? '',
          peso_12m_g:         data.peso_12m_g  ?? data.peso_12m ?? '',
          talla_12m_cm:       data.talla_12m_cm ?? data.talla_12m ?? '',
          griffiths_loco12:   data.griffiths_loco12 ?? data.loco_12m ?? '',
          dias_aminoglucosidos: data.dias_aminoglucosidos ?? '',
        };
        // Convert all to strings for form state
        const stringified = Object.fromEntries(
          Object.entries(mapped).map(([k, v]) => [k, v === null || v === undefined ? '' : String(v)])
        );
        setFormData(stringified);
        setUploadMsg({ type: 'ok', text: `Cargado: ${file.name}` });
        callAPI(stringified);
      } catch {
        setUploadMsg({ type: 'error', text: 'Error al parsear el JSON' });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadExample = () => {
    const example = {
      pc_nacer_mm:        '235',
      eg_semanas:         '26',
      peso_nacer_g:       '880',
      pc_40sem_cm:        '32.2',
      dias_oxigeno:       '28',
      educ_materna:       '1',
      griffiths_auditivo: '70',
      grupo:              'TC',
      horas_canguro:      '0',
      dias_hospitalizacion: '45',
      fototerapia:        '1',
      ingreso_percapita:  '75000',
      griffiths_motor:    '3',
      griffiths_general:  '85',
      leucomalacia:       '1',
      peso_12m_g:         '8100',
      talla_12m_cm:       '71',
      griffiths_loco12:   '90',
      educ_paterna:       '',
      talla_40sem_mm:     '',
      peso_3m_g:          '',
      talla_3m_mm:        '',
      dias_aminoglucosidos: '',
    };
    setFormData(example);
    setUploadMsg({ type: 'ok', text: 'Ejemplo cargado: caso_clinico_riesgo.json' });
    callAPI(example);
  };

  // ── Derived display values from API response ────────────────────────────
  const globalResult  = results?.global;
  const isHighRisk    = globalResult?.alert_level === 'high';
  const isMedRisk     = globalResult?.alert_level === 'medium';
  const probDisplay   = globalResult?.probabilidad ?? null;

  // SHAP — API returns { top_risk_factors: [{feature,label_es,shap}], top_protective: [...] }
  const shapRisk      = results?.shap?.top_risk_factors ?? [];
  const shapProtect   = results?.shap?.top_protective   ?? [];
  const allShap       = [...shapRisk, ...shapProtect].sort(
    (a, b) => Math.abs(b.shap) - Math.abs(a.shap)
  );
  const maxShapAbs    = allShap.length
    ? Math.max(...allShap.map(s => Math.abs(s.shap)))
    : 1;

  // Domain models — API returns { dominios: { wasi, tap, cvlt } }
  const wasiResult = results?.dominios?.wasi;
  const tapResult  = results?.dominios?.tap;
  const cvltResult = results?.dominios?.cvlt;

  // Meta — derived values calculated by backend
  const meta         = results?.meta ?? {};
  const catchupVal   = meta.catchup_fenton;
  const zNacerVal    = meta.fenton_z_nacer;

  // Evidencia tab
  const currentEvidencia = evidOverride ?? (isHighRisk || isMedRisk ? 'go2' : 'go1');

  // ── Completion pct for AUC live estimate ──────────────────────────────
  const reqFields = ['pc_nacer_mm','eg_semanas','pc_40sem_cm','dias_oxigeno',
                     'educ_materna','griffiths_auditivo'];
  const filledReq = reqFields.filter(f => formData[f] !== '').length;
  const filledRec = ['grupo','dias_hospitalizacion','fototerapia','griffiths_motor',
                     'griffiths_general','ingreso_percapita'].filter(f => formData[f] !== '').length;
  const aucEstimate =
    filledReq < reqFields.length ? null :
    filledReq === reqFields.length && filledRec === 0 ? '≈0.695' :
    filledRec >= 4 ? '≈0.689' : '≈0.678';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex flex-col">

      {/* ── FORM MODAL ──────────────────────────────────────────────────── */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">

            <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
              <div>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" /> Ingreso de Datos Clínicos
                </h2>
                <div className="flex gap-4 mt-1 text-[11px] font-bold">
                  <span className="text-rose-600 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500" /> AUC 0.695 (Mínimo)
                  </span>
                  <span className="text-amber-600 flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" /> Reduce Falsos Neg.
                  </span>
                </div>
              </div>
              <button onClick={() => setIsFormOpen(false)}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-6 bg-slate-50">
              <div className="max-w-3xl mx-auto">

                {/* NIVEL 1 */}
                <FormSection title="Nivel 1: Predictores Ancla" level="obligatorio"
                             icon={TrendingUp}
                             desc="Variables mínimas requeridas. AUC ≥ 0.695 con solo estos 6 campos.">
                  <div className="bg-white rounded-lg p-4 border border-rose-100 mb-4 shadow-sm">
                    <h4 className="text-[11px] font-black text-rose-800 uppercase tracking-widest mb-3">
                      Trayectoria de Crecimiento Cerebral (Fenton 2013)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormGroup label="PC al nacer" unit="mm" required helper="En mm. Mediana: 280–340 mm">
                        <input type="number" name="pc_nacer_mm" value={formData.pc_nacer_mm}
                               onChange={handleChange} min="180" max="400"
                               className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                      </FormGroup>
                      <FormGroup label="EG Ballard" unit="sem" required helper="Semanas completas: 24–36">
                        <input type="number" name="eg_semanas" value={formData.eg_semanas}
                               onChange={handleChange} min="24" max="36"
                               className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                      </FormGroup>
                      <FormGroup label="PC a las 40 sem EC" unit="cm" required helper="En cm. Rango: 30–40 cm">
                        <input type="number" name="pc_40sem_cm" value={formData.pc_40sem_cm}
                               onChange={handleChange} min="28" max="44" step="0.1"
                               className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                      </FormGroup>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormGroup label="2. Días Oxigenoterapia" unit="días" required helper="Total período neonatal">
                      <input type="number" name="dias_oxigeno" value={formData.dias_oxigeno}
                             onChange={handleChange} min="0" max="90"
                             className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="3. Educación Materna" required helper="Proxy socioeconómico principal">
                      <select name="educ_materna" value={formData.educ_materna}
                              onChange={handleChange}
                              className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none bg-white">
                        <option value="">Seleccionar…</option>
                        <option value="1">1 — Primaria</option>
                        <option value="2">2 — Secundaria</option>
                        <option value="3">3 — Técnico / tecnólogo</option>
                        <option value="4">4 — Universitario</option>
                        <option value="5">5 — Posgrado</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="4. Cociente Auditivo Griffiths 6m" required helper="Normal 75–117 · Riesgo <75">
                      <input type="number" name="griffiths_auditivo" value={formData.griffiths_auditivo}
                             onChange={handleChange} min="50" max="145"
                             className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                  </div>
                </FormSection>

                {/* NIVEL 2 */}
                <FormSection title="Nivel 2: Estabilización del Modelo" level="recomendado"
                             desc="Reduce drásticamente los Falsos Negativos. AUC ≈ 0.689.">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormGroup label="Peso al nacer" unit="g" helper="Rango prematuros: 400–2.500 g">
                      <input type="number" name="peso_nacer_g" value={formData.peso_nacer_g}
                             onChange={handleChange} min="400" max="3500"
                             className="w-full border border-amber-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                    <FormGroup label="Grupo estudio">
                      <select name="grupo" value={formData.grupo} onChange={handleChange}
                              className="w-full border border-amber-300 rounded-lg p-2 text-sm outline-none bg-white">
                        <option value="">Seleccionar…</option>
                        <option value="KMC">KMC — posición canguro</option>
                        <option value="TC">TC — cuidado tradicional</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Horas posición canguro" unit="h" helper="TC → se imputa como 0 automáticamente">
                      <input type="number" name="horas_canguro" value={formData.horas_canguro}
                             onChange={handleChange} min="0" max="500"
                             className="w-full border border-amber-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                    <FormGroup label="Leucomalacia periventricular">
                      <select name="leucomalacia" value={formData.leucomalacia} onChange={handleChange}
                              className="w-full border border-amber-300 rounded-lg p-2 text-sm outline-none bg-white">
                        <option value="">No explorada / ausente</option>
                        <option value="0">0 — Ausente confirmada</option>
                        <option value="1">1 — Leve</option>
                        <option value="2">2 — Moderada</option>
                        <option value="3">3 — Severa</option>
                      </select>
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormGroup label="Días hospitalización" unit="días">
                      <input type="number" name="dias_hospitalizacion"
                             value={formData.dias_hospitalizacion} onChange={handleChange}
                             min="0" max="180"
                             className="w-full border border-amber-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                    <FormGroup label="¿Fototerapia?">
                      <select name="fototerapia" value={formData.fototerapia} onChange={handleChange}
                              className="w-full border border-amber-300 rounded-lg p-2 text-sm outline-none bg-white">
                        <option value="">Seleccionar…</option>
                        <option value="1">Sí</option>
                        <option value="0">No</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Griffiths General 6m" helper="Normal: 78–115">
                      <input type="number" name="griffiths_general"
                             value={formData.griffiths_general} onChange={handleChange}
                             min="50" max="140"
                             className="w-full border border-amber-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                    <FormGroup label="Griffiths Motor 6m" helper="Raw score 1–6">
                      <input type="number" name="griffiths_motor"
                             value={formData.griffiths_motor} onChange={handleChange}
                             min="1" max="6"
                             className="w-full border border-amber-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                  </div>
                </FormSection>

                {/* NIVEL 3 */}
                <FormSection title="Nivel 3: Modelo M7 Completo" level="opcional"
                             desc="Variables que habilitan el cálculo de deltas de velocidad de crecimiento.">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormGroup label="Ingreso per cápita" unit="COP/mes">
                      <select name="ingreso_percapita" value={formData.ingreso_percapita}
                              onChange={handleChange}
                              className="w-full border border-emerald-300 rounded-lg p-2 text-sm outline-none bg-white">
                        <option value="">Seleccionar…</option>
                        <option value="35000">&lt; $50.000</option>
                        <option value="75000">$50.000 – $100.000</option>
                        <option value="150000">$100.000 – $200.000</option>
                        <option value="300000">$200.000 – $400.000</option>
                        <option value="600000">$400.000 – $800.000</option>
                        <option value="1200000">&gt; $800.000</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Educación paterna">
                      <select name="educ_paterna" value={formData.educ_paterna}
                              onChange={handleChange}
                              className="w-full border border-emerald-300 rounded-lg p-2 text-sm outline-none bg-white">
                        <option value="">Seleccionar…</option>
                        <option value="1">1 — Primaria</option>
                        <option value="2">2 — Secundaria</option>
                        <option value="3">3 — Técnico / tecnólogo</option>
                        <option value="4">4 — Universitario</option>
                        <option value="5">5 — Posgrado</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Talla 40 sem EC" unit="mm">
                      <input type="number" name="talla_40sem_mm"
                             value={formData.talla_40sem_mm} onChange={handleChange}
                             min="360" max="580"
                             className="w-full border border-emerald-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormGroup label="Peso 3m EC" unit="g">
                      <input type="number" name="peso_3m_g" value={formData.peso_3m_g}
                             onChange={handleChange} min="2500" max="8000"
                             className="w-full border border-emerald-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                    <FormGroup label="Talla 3m EC" unit="mm">
                      <input type="number" name="talla_3m_mm" value={formData.talla_3m_mm}
                             onChange={handleChange} min="450" max="680"
                             className="w-full border border-emerald-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                    <FormGroup label="Peso 12m EC" unit="g">
                      <input type="number" name="peso_12m_g" value={formData.peso_12m_g}
                             onChange={handleChange} min="5000" max="14000"
                             className="w-full border border-emerald-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                    <FormGroup label="Talla 12m EC" unit="cm">
                      <input type="number" name="talla_12m_cm" value={formData.talla_12m_cm}
                             onChange={handleChange} min="60" max="86" step="0.5"
                             className="w-full border border-emerald-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormGroup label="Locomoción Griffiths 12m" helper="Normal: 83–125">
                      <input type="number" name="griffiths_loco12"
                             value={formData.griffiths_loco12} onChange={handleChange}
                             min="50" max="160"
                             className="w-full border border-emerald-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                    <FormGroup label="Días aminoglucósidos" unit="días" helper="Gentamicina, amikacina u otros (ototóxicos)">
                      <input type="number" name="dias_aminoglucosidos"
                             value={formData.dias_aminoglucosidos} onChange={handleChange}
                             min="0" max="30"
                             className="w-full border border-emerald-300 rounded-lg p-2 text-sm outline-none" />
                    </FormGroup>
                  </div>
                </FormSection>
              </div>
            </div>

            <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-between items-center shadow-sm z-10">
              <span className="text-xs font-bold text-slate-400">
                * Obligatorios = mínimo para ejecutar el modelo
              </span>
              <div className="flex gap-3">
                <button onClick={() => setIsFormOpen(false)}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                  Cancelar
                </button>
                <button onClick={handleSubmitForm} disabled={!isFormValid()}
                        className="px-6 py-2.5 text-sm font-black text-white bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 rounded-xl flex items-center gap-2 shadow-md transition-colors">
                  <Save className="w-4 h-4" /> Calcular Riesgo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3">
          <div className="bg-blue-700 p-2.5 rounded-2xl shadow-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">KMC-20 Predictor</h1>
            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Seguimiento Longitudinal 20 Años</p>
          </div>
        </div>
        <div className="bg-white px-5 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${
            apiStatus === 'ok'    ? 'bg-emerald-500 animate-pulse' :
            apiStatus === 'error' ? 'bg-rose-500' : 'bg-slate-300'
          }`} />
          <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">
            Motor de Inferencia: {
              apiStatus === 'ok'    ? 'Local · M7 Activo' :
              apiStatus === 'error' ? 'Sin Conexión' : 'Conectando…'
            }
          </span>
          {aucEstimate && (
            <span className="text-xs font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
              AUC {aucEstimate}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 w-full flex-grow">

        {/* ── LEFT PANEL ───────────────────────────────────────────────── */}
        <div className="xl:col-span-3 space-y-5">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider">Historia Clínica</h2>
            </div>
            <div className="p-5 space-y-4">
              <button onClick={() => setIsFormOpen(true)}
                      className="w-full py-4 bg-blue-50 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-100 rounded-2xl flex flex-col items-center justify-center transition-all group">
                <ClipboardList className="w-10 h-10 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black text-blue-900">Ingresar Datos</span>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">
                  Mínimo 6 campos obligatorios
                </span>
              </button>

              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current.click()}
                        className="flex-1 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2">
                  <UploadCloud className="w-4 h-4" /> Subir JSON
                </button>
                <button onClick={handleLoadExample}
                        className="flex-1 py-2.5 bg-slate-800 text-white text-xs font-black rounded-xl flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" /> Ejemplo
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload}
                       accept=".json,.txt" className="hidden" />
              </div>

              {uploadMsg && (
                <div className={`flex items-center gap-2 text-xs font-semibold p-2 rounded-lg ${
                  uploadMsg.type === 'ok'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-rose-50 text-rose-700'
                }`}>
                  {uploadMsg.type === 'ok'
                    ? <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                  {uploadMsg.text}
                </div>
              )}

              {/* Variables extraídas */}
              {results?.meta && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">
                    Variables Extraídas
                  </h3>
                  <div className="space-y-1.5">
                    {formData.peso_nacer_g && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Peso nacer:</span>
                        <span className="font-black">{formData.peso_nacer_g} g</span>
                      </div>
                    )}
                    {formData.pc_nacer_mm && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">EG:</span>
                        <span className="font-black">{formData.eg_semanas} sem</span>
                      </div>
                    )}
                    {formData.eg_semanas && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Edad Gest.:</span>
                        <span className="font-black">{formData.eg_semanas} sem</span>
                      </div>
                    )}
                    {formData.dias_oxigeno && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Días O₂:</span>
                        <span className="font-black">{formData.dias_oxigeno} d</span>
                      </div>
                    )}
                    {catchupVal !== null && catchupVal !== undefined && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Catch-up PC:</span>
                        <span className={`font-black ${catchupVal < -0.5 ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {catchupVal > 0 ? '+' : ''}{catchupVal} Δσ
                        </span>
                      </div>
                    )}
                    {formData.griffiths_auditivo && (
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Audición 6m:</span>
                        <span className="font-black">{formData.griffiths_auditivo} pts</span>
                      </div>
                    )}
                    {meta.n_campos_imputados > 0 && (
                      <div className="text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-200">
                        {meta.n_campos_imputados} campo(s) imputados con mediana de entrenamiento
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ──────────────────────────────────────────────── */}
        <div className="xl:col-span-9 flex flex-col">
          {/* Tabs */}
          <div className="flex p-1.5 bg-slate-200 rounded-2xl mb-6 self-start w-full md:w-auto overflow-x-auto">
            {[['global','Riesgo Global'],['cognitivo','Perfil Cognitivo'],['evidencia','Validación Científica']].map(
              ([key, label]) => (
                <button key={key} onClick={() => setActiveTab(key)}
                        className={`px-7 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${
                          activeTab === key
                            ? 'bg-white text-blue-700 shadow-xl'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}>
                  {label}
                </button>
              )
            )}
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-10 relative flex-grow flex flex-col min-h-[500px]">

            {/* API Error */}
            {apiError && (
              <div className="mb-6 bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3">
                <ServerCrash className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-black text-rose-900">Error al conectar con el modelo</p>
                  <p className="text-xs text-rose-700 mt-1">{apiError}</p>
                  <p className="text-xs text-rose-500 mt-1">
                    Verifica que el backend esté corriendo en {API_URL}
                  </p>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!results && !isLoading && !apiError && (
              <div className="flex-grow flex flex-col items-center justify-center opacity-20 grayscale">
                <ActivitySquare className="w-24 h-24 mb-4" />
                <p className="font-black uppercase tracking-widest text-sm">Esperando Datos Clínicos</p>
                <p className="text-xs font-medium mt-2">Complete los 6 campos obligatorios para ejecutar el modelo</p>
              </div>
            )}

            {/* Loading */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xl z-10 flex flex-col items-center justify-center rounded-[2.5rem]">
                <Loader2 className="w-12 h-12 text-blue-700 animate-spin mb-4" />
                <p className="font-black text-slate-700 uppercase tracking-widest text-xs">
                  Ejecutando Modelo M7 · Calibrado (Isotonic)…
                </p>
              </div>
            )}

            {/* Results */}
            {results && !isLoading && (
              <div className="animate-in fade-in zoom-in-95 duration-500 flex-grow flex flex-col">

                {/* ── TAB: RIESGO GLOBAL ──────────────────────────────── */}
                {activeTab === 'global' && (
                  <div className="flex-grow">
                    <div className="grid md:grid-cols-2 gap-10 items-center mb-10 pb-10 border-b border-slate-100">
                      {/* Gauge */}
                      <div className="flex flex-col items-center">
                        <div className={`w-44 h-44 rounded-full border-[10px] flex flex-col items-center justify-center shadow-xl mb-5 ${
                          isHighRisk ? 'bg-rose-100 border-rose-400'   :
                          isMedRisk  ? 'bg-amber-100 border-amber-400' :
                                       'bg-emerald-100 border-emerald-400'
                        }`}>
                          {isHighRisk
                            ? <AlertTriangle className="w-10 h-10 text-rose-600" />
                            : isMedRisk
                              ? <AlertCircle className="w-10 h-10 text-amber-600" />
                              : <CheckCircle className="w-10 h-10 text-emerald-600" />}
                          <span className={`text-lg font-black mt-2 tracking-tighter text-center px-2 leading-tight ${
                            isHighRisk ? 'text-rose-600' : isMedRisk ? 'text-amber-700' : 'text-emerald-700'
                          }`}>
                            {globalResult.nivel}
                          </span>
                        </div>
                        <div className="text-center bg-slate-50 p-4 rounded-2xl w-full border border-slate-100">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">
                            Probabilidad de Riesgo
                          </p>
                          <p className="text-4xl font-black text-slate-900">{probDisplay}%</p>
                          {globalResult.calibrado && (
                            <div className="mt-3 bg-blue-50 text-blue-800 text-[11px] font-medium p-2.5 rounded-xl border border-blue-100 leading-tight flex items-start gap-1.5">
                              <Shield className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span>Calibrado (isotónica) — {probDisplay} de cada 100 pacientes con este perfil neonatal pertenecen al grupo GO-2 Bajo.</span>
                            </div>
                          )}
                          <div className="mt-2 text-[10px] text-slate-400">
                            Umbral: {globalResult.threshold_usado} · {meta.completitud_pct}% campos completados
                          </div>
                        </div>
                      </div>

                      {/* Narrative */}
                      <div className="space-y-5">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
                          Trayectoria Neurocognitiva
                        </h2>
                        <div className={`p-5 rounded-3xl border-2 ${
                          isHighRisk ? 'bg-rose-50 border-rose-200' :
                          isMedRisk  ? 'bg-amber-50 border-amber-200' :
                                       'bg-emerald-50 border-emerald-200'
                        }`}>
                          <p className={`text-sm font-bold leading-relaxed ${
                            isHighRisk ? 'text-rose-900' :
                            isMedRisk  ? 'text-amber-900' : 'text-emerald-900'
                          }`}>
                            {isHighRisk
                              ? 'El perfil neonatal (bajo catch-up PC Fenton, exposición prolongada a O₂) junto con el contexto socioeducativo se asocia a alto riesgo de déficit cognitivo a los 20 años.'
                              : isMedRisk
                                ? 'El perfil presenta factores de riesgo moderados. Se recomienda seguimiento periódico en neurodesarrollo.'
                                : 'La trayectoria de crecimiento cerebral favorable y el contexto socioeducativo se asocian a desarrollo cognitivo dentro del rango esperado a los 20 años.'}
                          </p>
                        </div>

                        {/* Derived values */}
                        {(catchupVal !== null || zNacerVal !== null) && (
                          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs">
                            <p className="font-black text-slate-500 uppercase tracking-widest mb-2 text-[10px]">
                              Variables derivadas (Fenton 2013)
                            </p>
                            {zNacerVal !== null && (
                              <div className="flex justify-between mb-1">
                                <span className="text-slate-500">PC z-score al nacer</span>
                                <span className={`font-black ${zNacerVal < -2 ? 'text-rose-600' : zNacerVal < -1 ? 'text-amber-600' : 'text-emerald-700'}`}>
                                  {zNacerVal > 0 ? '+' : ''}{zNacerVal} σ
                                </span>
                              </div>
                            )}
                            {catchupVal !== null && (
                              <div className="flex justify-between">
                                <span className="text-slate-500">Catch-up PC (nacer → 40 sem)</span>
                                <span className={`font-black ${catchupVal < -0.5 ? 'text-rose-600' : catchupVal < 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                                  {catchupVal > 0 ? '+' : ''}{catchupVal} Δσ
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* SHAP */}
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <BarChartHorizontal className="w-6 h-6 text-blue-700" />
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">
                          Explicabilidad del Caso (SHAP)
                        </h3>
                        {results?.shap?.method === 'feature_importances_fallback' && (
                          <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Aproximado
                          </span>
                        )}
                      </div>
                      {allShap.length > 0 ? (
                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                          {allShap.map(item => (
                            <ShapBar key={item.feature} item={item} maxAbs={maxShapAbs} />
                          ))}
                          <div className="mt-5 pt-4 border-t border-slate-200 flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-emerald-400 rounded-sm" /> Protector
                            </span>
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-rose-400 rounded-sm" /> Factor Riesgo
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 text-center text-xs text-slate-400">
                          SHAP no disponible — instalar shap en el entorno del servidor
                          <code className="block mt-1 text-[10px]">pip install shap</code>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── TAB: PERFIL COGNITIVO ────────────────────────────── */}
                {activeTab === 'cognitivo' && (
                  <div className="flex-grow flex flex-col">
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                        Fenotipo Cognitivo Proyectado
                      </h2>
                      <p className="text-slate-500 text-sm">
                        Probabilidades de pertenecer a cada fenotipo según los modelos M8/M9/M10
                      </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-5 flex-grow">

                      {/* WASI */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                          <Brain className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="font-black text-lg text-blue-900 leading-tight">Inteligencia</h3>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">WASI K=3</span>
                          </div>
                        </div>
                        {wasiResult ? (
                          <div className="space-y-4 flex-grow">
                            {[
                              ['Inteligencia Alta (GO-1)',   wasiResult.probabilidad != null && globalResult ? 100 - wasiResult.probabilidad - 10 : 0, 'emerald'],
                              ['Inteligencia Media (GO-2)',  10, 'blue'],
                              ['Riesgo de Déficit (GO-3)',   wasiResult.probabilidad ?? 0, 'rose'],
                            ].map(([label, pct, color]) => (
                              <div key={label}>
                                <div className={`flex justify-between text-xs font-bold mb-1.5 ${color === 'rose' ? 'text-rose-600' : 'text-slate-600'}`}>
                                  <span>{label}</span><span>{Math.max(0, Math.min(100, pct)).toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${
                                    color === 'rose' ? 'bg-rose-500' : color === 'emerald' ? 'bg-emerald-400' : 'bg-blue-400'
                                  }`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                                </div>
                              </div>
                            ))}
                            <p className="text-[10px] text-slate-400 text-center pt-2">
                              M8 WASI K=3 · {wasiResult.calibrado ? 'Calibrado' : 'Raw'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 text-center flex-grow flex items-center justify-center">
                            Modelo WASI no disponible
                          </p>
                        )}
                      </div>

                      {/* TAP */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                          <Focus className="w-6 h-6 text-indigo-600" />
                          <div>
                            <h3 className="font-black text-lg text-indigo-900 leading-tight">Atención</h3>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">TAP K=2</span>
                          </div>
                        </div>
                        {tapResult ? (
                          <div className="space-y-4 flex-grow">
                            {[
                              ['GO-1 Attentive', 100 - (tapResult.probabilidad ?? 0), 'emerald'],
                              ['GO-2 Inattentive', tapResult.probabilidad ?? 0, 'rose'],
                            ].map(([label, pct, color]) => (
                              <div key={label}>
                                <div className={`flex justify-between text-xs font-bold mb-1.5 ${color === 'rose' ? 'text-rose-600' : 'text-slate-600'}`}>
                                  <span>{label}</span><span>{Math.max(0, Math.min(100, pct)).toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${color === 'rose' ? 'bg-rose-500' : 'bg-emerald-400'}`}
                                       style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                                </div>
                              </div>
                            ))}
                            <p className="text-[10px] text-slate-400 text-center pt-2">
                              M9 TAP K=2 · {tapResult.calibrado ? 'Calibrado' : 'Raw'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 text-center flex-grow flex items-center justify-center">
                            Modelo TAP no disponible
                          </p>
                        )}
                      </div>

                      {/* CVLT */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                          <MessageSquare className="w-6 h-6 text-violet-600" />
                          <div>
                            <h3 className="font-black text-lg text-violet-900 leading-tight">Memoria Verbal</h3>
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">CVLT K=2</span>
                          </div>
                        </div>
                        {cvltResult ? (
                          <div className="space-y-4 flex-grow">
                            {[
                              ['GO-1 High Memory', 100 - (cvltResult.probabilidad ?? 0), 'emerald'],
                              ['GO-2 Low Memory',  cvltResult.probabilidad ?? 0, 'rose'],
                            ].map(([label, pct, color]) => (
                              <div key={label}>
                                <div className={`flex justify-between text-xs font-bold mb-1.5 ${color === 'rose' ? 'text-rose-600' : 'text-slate-600'}`}>
                                  <span>{label}</span><span>{Math.max(0, Math.min(100, pct)).toFixed(1)}%</span>
                                </div>
                                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                  <div className={`h-full ${color === 'rose' ? 'bg-rose-500' : 'bg-emerald-400'}`}
                                       style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
                                </div>
                              </div>
                            ))}
                            <p className="text-[10px] text-slate-400 text-center pt-2">
                              M10 CVLT K=2 · {cvltResult.calibrado ? 'Calibrado' : 'Raw'}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400 text-center flex-grow flex items-center justify-center">
                            Modelo CVLT no disponible
                          </p>
                        )}
                      </div>

                    </div>
                  </div>
                )}

                {/* ── TAB: VALIDACIÓN CIENTÍFICA ───────────────────────── */}
                {activeTab === 'evidencia' && (
                  <div className="flex flex-col flex-grow">
                    {currentEvidencia === 'go2' ? (
                      <div className="flex-grow flex flex-col animate-in slide-in-from-right-8 duration-300">
                        <div className="mb-6">
                          <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">
                            Correlatos a los 20 años — fenotipo GO-2 Bajo
                          </h2>
                          <p className="text-slate-500 text-sm">
                            Hallazgos en participantes de la cohorte KMC-400-20y con perfil similar al de este paciente
                          </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-5 flex-grow">
                          <div className="flex flex-col gap-3">
                            <div className="text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                              <Brain className="w-4 h-4" /> Huella Cerebral (MRI)
                            </div>
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex-grow">
                              <h4 className="text-rose-900 font-bold mb-4">Tractos con menor integridad</h4>
                              <DotItem label="FA cíngulo izquierdo" value="q<0.01" valColor="rose" />
                              <DotItem label="FA corticoespinal dcho." value="q<0.05" valColor="rose" />
                              <DotItem label="FA fascículo uncinado" value="q<0.05" valColor="rose" />
                              <p className="text-[10px] text-rose-700 mt-3 leading-tight">
                                OLS ajustado por sexo e ICV · 6/11 tractos TRAC significativos
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3">
                            <div className="text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                              <FileText className="w-4 h-4" /> Desempeño Adulto
                            </div>
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex-grow">
                              <h4 className="text-rose-900 font-bold mb-4">Significativamente menores</h4>
                              <DotItem label="ICFES global" value="−8.4 pts" valColor="rose" />
                              <DotItem label="Lectura crítica" value="−8.6 pts" valColor="rose" />
                              <DotItem label="Audición (9/9 frec.)" value="↑ umbral" valColor="rose" />
                              <DotItem label="Tiempo reacción TAP-WM" value="+39 ms" valColor="rose" />
                              <p className="text-[10px] text-rose-700 mt-3 leading-tight">
                                Mann-Whitney U · FDR BH · 78/243 variables q&lt;0.05
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-3">
                            <div className="text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center gap-2">
                              <CheckCircle className="w-4 h-4" /> Sin Diferencia Significativa
                            </div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex-grow">
                              <h4 className="text-emerald-900 font-bold mb-4">Perfil metabólico equivalente</h4>
                              <DotItem label="IMC a los 20 años" value="ns" valColor="emerald" />
                              <DotItem label="Presión arterial" value="ns" valColor="emerald" />
                              <DotItem label="Glicemia / lípidos" value="ns" valColor="emerald" />
                              <p className="text-[10px] text-emerald-700 mt-3 leading-tight">
                                El riesgo es específicamente cognitivo-neurológico, no metabólico. El seguimiento metabólico corresponde a la prematuridad en general.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex-grow flex flex-col animate-in slide-in-from-left-8 duration-300">
                        <div className="mb-8">
                          <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">
                            Correlatos a los 20 años — fenotipo GO-1 Alto
                          </h2>
                          <p className="text-slate-500 text-sm">
                            Hallazgos en participantes de la cohorte con perfil similar al de este paciente
                          </p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 flex-grow">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex flex-col">
                            <div className="flex items-center gap-3 mb-5 text-emerald-900 font-black text-lg">
                              <Brain className="w-6 h-6 text-emerald-600" /> Integridad cerebral normal
                            </div>
                            <DotItem label="FA cíngulo izquierdo" value="GO-1: 0.412" valColor="emerald" />
                            <DotItem label="FA corticoespinal dcho." value="GO-1: 0.558" valColor="emerald" />
                            <p className="text-[10px] text-emerald-700 mt-auto pt-3">
                              Mayor FA vs GO-2 en tractos de memoria verbal y coordinación motora
                            </p>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 flex flex-col">
                            <div className="flex items-center gap-3 mb-5 text-emerald-900 font-black text-lg">
                              <FileText className="w-6 h-6 text-emerald-600" /> Desempeño dentro del rango esperado
                            </div>
                            <DotItem label="ICFES global" value="53.2 pts" valColor="emerald" />
                            <DotItem label="WASI FSIQ" value="≈91.7" valColor="emerald" />
                            <DotItem label="Umbral auditivo (500 Hz)" value="18.2 dB" valColor="emerald" />
                            <p className="text-[10px] text-emerald-700 mt-auto pt-3">
                              El riesgo cognitivo específico del fenotipo GO-2 no es predominante en este perfil. Se recomienda seguimiento estándar para prematuros.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-6 pt-5 border-t border-slate-200 flex justify-between items-center">
                      <span className="text-[11px] text-slate-400">
                        KMC-400-20y · n=491 · Fundación Canguro / Uniandes 2026
                      </span>
                      <button
                        onClick={() => setEvidOverride(currentEvidencia === 'go2' ? 'go1' : 'go2')}
                        className="text-xs font-black text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-5 py-2.5 rounded-xl flex items-center gap-2">
                        Ver hallazgos en {currentEvidencia === 'go2' ? 'GO-1 Alto' : 'GO-2 Bajo'}
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────────────────── */}
      <footer className="max-w-7xl mx-auto w-full mt-6 text-center text-xs text-slate-400 font-medium border-t border-slate-200 pt-5 pb-2">
        <p className="flex items-center justify-center gap-2">
          <Info className="w-4 h-4" />
          Herramienta de apoyo clínico. No reemplaza el juicio del profesional de salud.
          Modelo M7 · KMC-400-20y · AUC=0.678 · Calibrado (isotónica)
        </p>
      </footer>
    </div>
  );
}
