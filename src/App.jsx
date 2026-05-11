import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, Brain, Info, AlertTriangle, CheckCircle, 
  FileText, ChevronRight, ActivitySquare, UploadCloud, 
  FileUp, AlertCircle, RefreshCw, FileJson, BarChartHorizontal,
  Focus, MessageSquare, ClipboardList, X, Save
} from 'lucide-react';

const DotItem = ({ label, value, valColor }) => (
  <div className="flex justify-between items-start text-[13px] mb-2">
    <div className="flex items-start gap-2 mt-0.5">
      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${valColor === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
      <span className="text-slate-700 font-medium leading-tight">{label}</span>
    </div>
    <span className={`font-bold whitespace-nowrap ml-2 ${valColor === 'rose' ? 'text-rose-600' : 'text-emerald-700'}`}>{value}</span>
  </div>
);

// Estilos para los bloques del formulario según el nivel (Obligatorio, Recomendado, Opcional)
const FormSection = ({ title, level, children, icon: Icon }) => {
  const colors = {
    obligatorio: "border-rose-200",
    recomendado: "border-amber-200",
    opcional: "border-emerald-200"
  };
  const bgColors = {
    obligatorio: "bg-rose-50",
    recomendado: "bg-amber-50 text-amber-900",
    opcional: "bg-emerald-50 text-emerald-900"
  };
  const textColors = {
    obligatorio: "text-rose-900",
    recomendado: "text-amber-900",
    opcional: "text-emerald-900"
  };
  const badgeColors = {
    obligatorio: "text-rose-700",
    recomendado: "text-amber-700",
    opcional: "text-emerald-700"
  };

  return (
    <div className={`border ${colors[level]} rounded-xl overflow-hidden mb-6 bg-white shadow-sm`}>
      <div className={`${bgColors[level]} px-4 py-3 flex justify-between items-center border-b ${colors[level]}`}>
        <h3 className={`font-bold flex items-center gap-2 ${textColors[level]}`}>
          {Icon && <Icon className="w-4 h-4" />}
          {title}
        </h3>
        <span className={`text-[10px] font-black uppercase tracking-wider ${badgeColors[level]}`}>
          {level}
        </span>
      </div>
      <div className="p-5">
        {children}
      </div>
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

export default function App() {
  // Estado principal de inputs del modelo
  const [inputs, setInputs] = useState(null);
  
  // Estado para el modal del formulario
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    peso: '', semanas: '', pc_nacer: '', grupo: '', educacion: '',
    pc_40: '', oxigeno: '', horas_canguro: '',
    griffiths_aud: '', griffiths_mot: '', griffiths_gen: '',
    hospitalizacion: '', fototerapia: '', leucomalacia: '',
    ingreso: '', lactancia: '',
    peso_3m: '', talla_3m: '', talla_40s: '', peso_12m: '', talla_12m: '', loco_12m: ''
  });

  const [activeTab, setActiveTab] = useState('global');
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ type: 'idle', message: '', fileName: '' });
  
  const [evidenciaViewOverride, setEvidenciaViewOverride] = useState(null);
  const fileInputRef = useRef(null);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = () => {
    // Convertir el formulario a JSON para el modelo
    const parsedData = { ...formData };
    // Convertir números donde aplique
    ['peso', 'semanas', 'oxigeno', 'horas_canguro', 'griffiths_gen', 'leucomalacia'].forEach(key => {
      if (parsedData[key]) parsedData[key] = parseFloat(parsedData[key]);
    });
    
    setInputs(parsedData);
    setIsFormOpen(false);
  };

  const calcularPrediccion = async () => {
    if (!inputs || !inputs.peso) {
      setResults(null);
      return;
    }

    setIsCalculating(true);
    setEvidenciaViewOverride(null);
    
    setTimeout(() => {
      let riesgoBase = 20; 
      let shapData = [];

      // Evaluación con los nuevos datos del formulario
      if (inputs.peso < 1000) {
        riesgoBase += 30;
        shapData.push({ nombre: 'Extremo Bajo Peso (<1000g)', valor: 30, tipo: 'riesgo' });
      } else if (inputs.peso < 1500) {
        riesgoBase += 15;
        shapData.push({ nombre: 'Muy Bajo Peso (<1500g)', valor: 15, tipo: 'riesgo' });
      } else {
        riesgoBase -= 15;
        shapData.push({ nombre: 'Peso protector (>1500g)', valor: -15, tipo: 'protector' });
      }

      // Oxígeno como proxy de severidad pulmonar
      if (inputs.oxigeno > 20) {
        riesgoBase += 20;
        shapData.push({ nombre: 'Oxigenoterapia prolongada (>20d)', valor: 20, tipo: 'riesgo' });
      }

      // Leucomalacia
      if (inputs.leucomalacia && inputs.leucomalacia !== '0') {
        riesgoBase += 25;
        shapData.push({ nombre: 'Leucomalacia Periventricular', valor: 25, tipo: 'riesgo' });
      }

      // Posición canguro como protector
      if (inputs.grupo === 'KMC' || inputs.horas_canguro > 0) {
        riesgoBase -= 18;
        shapData.push({ nombre: 'Intervención Madre Canguro', valor: -18, tipo: 'protector' });
      } else if (inputs.grupo === 'TC') {
        riesgoBase += 10;
        shapData.push({ nombre: 'Cuidado Tradicional (TC)', valor: 10, tipo: 'riesgo' });
      }

      const riesgoFinal = Math.max(5, Math.min(riesgoBase, 95));
      
      setResults({
        global: {
          nivel: riesgoFinal > 45 ? 'Alto Riesgo' : 'Bajo Riesgo',
          probabilidad: riesgoFinal,
          color: riesgoFinal > 45 ? 'text-rose-600' : 'text-emerald-600',
          bgColor: riesgoFinal > 45 ? 'bg-rose-100' : 'bg-emerald-100',
          icon: riesgoFinal > 45 ? <AlertTriangle className="w-10 h-10 text-rose-600" /> : <CheckCircle className="w-10 h-10 text-emerald-600" />
        },
        cognitivo: {
          wasi: {
            bajo: riesgoFinal,
            medio: Math.max(0, 100 - riesgoFinal - 15),
            alto: 15
          },
          tap: {
            alerta: Math.min(riesgoFinal + 12, 98),
            normal: Math.max(100 - (riesgoFinal + 12), 2)
          },
          cvlt: {
            alerta: Math.min(riesgoFinal + 5, 95),
            normal: Math.max(100 - (riesgoFinal + 5), 5)
          }
        },
        shap: shapData.sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
      });
      setIsCalculating(false);
    }, 1200);
  };

  useEffect(() => {
    calcularPrediccion();
  }, [inputs]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        let data = {};
        if (file.name.endsWith('.json')) data = JSON.parse(content);
        setFormData(prev => ({ ...prev, ...data }));
        setInputs(data);
        setUploadStatus({ type: 'success', message: 'Datos cargados.', fileName: file.name });
      } catch (err) {
        setUploadStatus({ type: 'error', message: 'Error en formato.', fileName: file.name });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadExample = () => {
    const example = {
      peso: 880, semanas: 26, pc_nacer: 235, grupo: 'TC', educacion: 'Secundaria',
      pc_40: 34.2, oxigeno: 22, horas_canguro: 0,
      griffiths_aud: 91, griffiths_mot: 4, griffiths_gen: 98,
      hospitalizacion: 48, fototerapia: 'Sí', leucomalacia: '1 - Leve',
      ingreso: '< 1 SMMLV', lactancia: 'Mixta',
      peso_3m: 5300, talla_3m: 570, talla_40s: 465, peso_12m: 8400, talla_12m: 72, loco_12m: 108
    };
    setFormData(example);
    setInputs(example);
    setUploadStatus({ type: 'success', message: 'Ejemplo cargado.', fileName: 'caso_clinico_riesgo.json' });
  };

  const renderShapBar = (item, maxAbs) => {
    const width = (Math.abs(item.valor) / maxAbs) * 100;
    const isRisk = item.tipo === 'riesgo';
    return (
      <div key={item.nombre} className="flex items-center mb-3">
        <div className="w-5/12 text-right pr-4 text-xs font-semibold text-slate-600 truncate">
          {item.nombre}
        </div>
        <div className="w-7/12 flex items-center">
          <div className="w-full flex">
            <div className="w-1/2 flex justify-end pr-[1px] border-r border-slate-400">
              {!isRisk && (
                <div className="bg-emerald-400 h-4 rounded-l-sm transition-all duration-500" style={{ width: `${width}%` }}></div>
              )}
            </div>
            <div className="w-1/2 flex justify-start pl-[1px]">
              {isRisk && (
                <div className="bg-rose-400 h-4 rounded-r-sm transition-all duration-500" style={{ width: `${width}%` }}></div>
              )}
            </div>
          </div>
          <span className={`text-xs font-bold ml-3 w-8 flex-shrink-0 ${isRisk ? 'text-rose-600' : 'text-emerald-600'}`}>
            {isRisk ? '+' : ''}{item.valor}
          </span>
        </div>
      </div>
    );
  };

  const predictedView = results?.global?.nivel === 'Alto Riesgo' ? 'go2' : 'go1';
  const currentEvidenciaView = evidenciaViewOverride || predictedView;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex flex-col relative">
      
      {/* MODAL DEL FORMULARIO CLÍNICO */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-white px-6 py-4 border-b border-slate-200 flex justify-between items-center shadow-sm z-10">
              <div>
                <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-blue-600" /> Formulario de Historia Clínica
                </h2>
                <div className="flex gap-4 mt-1">
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">Obligatorio</span>
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">Recomendado</span>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">Opcional</span>
                </div>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-grow overflow-y-auto p-6 bg-slate-50">
              <div className="max-w-3xl mx-auto">
                
                <FormSection title="Nacimiento" level="obligatorio" icon={Activity}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormGroup label="Peso al nacer" unit="g" required helper="Rango prematuros: 400-3.500 g">
                      <input type="number" name="peso" value={formData.peso} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="EG Ballard" unit="sem" required helper="Semanas completas: 24-36">
                      <input type="number" name="semanas" value={formData.semanas} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="PC al nacer" unit="mm" required helper="En mm. Mediana: 280-340 mm">
                      <input type="number" name="pc_nacer" value={formData.pc_nacer} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup label="Grupo" required>
                      <select name="grupo" value={formData.grupo} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none bg-white">
                        <option value="">Seleccionar...</option>
                        <option value="KMC">KMC — posición canguro</option>
                        <option value="TC">TC — cuidado tradicional</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Educación materna" required>
                      <select name="educacion" value={formData.educacion} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none bg-white">
                        <option value="">Seleccionar...</option>
                        <option value="Primaria">Primaria o menos</option>
                        <option value="Secundaria">Secundaria</option>
                        <option value="Universitaria">Universitaria</option>
                      </select>
                    </FormGroup>
                  </div>
                </FormSection>

                <FormSection title="40 semanas de edad corregida" level="obligatorio">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormGroup label="PC a las 40 sem EC" unit="cm" required helper="En cm. Rango: 30-40 cm">
                      <input type="number" name="pc_40" value={formData.pc_40} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="Días oxigenoterapia" unit="días" required helper="Total días con O₂ en período neonatal">
                      <input type="number" name="oxigeno" value={formData.oxigeno} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="Horas posición canguro" unit="h" helper="Total acumulado período neonatal">
                      <input type="number" name="horas_canguro" value={formData.horas_canguro} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                  </div>
                </FormSection>

                <FormSection title="Griffiths — 6 meses EC" level="obligatorio" icon={Brain}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormGroup label="Cociente auditivo" required helper="Normal: 75-117 · Riesgo: <75">
                      <input type="number" name="griffiths_aud" value={formData.griffiths_aud} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="Raw score motor" helper="Subescala motora cruda. Rango: 1-6">
                      <input type="number" name="griffiths_mot" value={formData.griffiths_mot} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="Cociente general" helper="Griffiths general. Normal: 78-115">
                      <input type="number" name="griffiths_gen" value={formData.griffiths_gen} onChange={handleFormChange} className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-rose-200 outline-none" />
                    </FormGroup>
                  </div>
                </FormSection>

                <FormSection title="Período neonatal" level="recomendado">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormGroup label="Días hospitalización" unit="días">
                      <input type="number" name="hospitalizacion" value={formData.hospitalizacion} onChange={handleFormChange} className="w-full border border-amber-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="¿Recibió fototerapia?">
                      <select name="fototerapia" value={formData.fototerapia} onChange={handleFormChange} className="w-full border border-amber-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none bg-white">
                        <option value="">Seleccionar...</option>
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Leucomalacia periventricular">
                      <select name="leucomalacia" value={formData.leucomalacia} onChange={handleFormChange} className="w-full border border-amber-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none bg-white">
                        <option value="0">0 — Ausente (o no explorada)</option>
                        <option value="1">1 — Leve</option>
                        <option value="2">2 — Moderada</option>
                        <option value="3">3 — Severa</option>
                      </select>
                    </FormGroup>
                  </div>
                </FormSection>

                <FormSection title="Contexto socioeconómico" level="recomendado">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormGroup label="Ingreso per cápita" unit="COP/mes" helper="Ingreso hogar ÷ personas">
                      <select name="ingreso" value={formData.ingreso} onChange={handleFormChange} className="w-full border border-amber-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none bg-white">
                        <option value="">Seleccionar...</option>
                        <option value="< 1 SMMLV">&lt; 1 SMMLV</option>
                        <option value="1-2 SMMLV">1-2 SMMLV</option>
                        <option value="> 2 SMMLV">&gt; 2 SMMLV</option>
                      </select>
                    </FormGroup>
                    <FormGroup label="Lactancia materna">
                      <select name="lactancia" value={formData.lactancia} onChange={handleFormChange} className="w-full border border-amber-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-amber-200 outline-none bg-white">
                        <option value="">Seleccionar...</option>
                        <option value="Exclusiva">Exclusiva</option>
                        <option value="Mixta">Mixta</option>
                        <option value="Fórmula">Fórmula artificial</option>
                      </select>
                    </FormGroup>
                  </div>
                </FormSection>

                <FormSection title="Crecimiento 3 y 12 meses EC" level="opcional">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <FormGroup label="Peso 3m EC" unit="g" helper="Mediana cohorte: 5.300 g">
                      <input type="number" name="peso_3m" value={formData.peso_3m} onChange={handleFormChange} className="w-full border border-emerald-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="Talla 3m EC" unit="mm">
                      <input type="number" name="talla_3m" value={formData.talla_3m} onChange={handleFormChange} className="w-full border border-emerald-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="Talla 40 sem EC" unit="mm" helper="Rango p5-p95: 430-510 mm">
                      <input type="number" name="talla_40s" value={formData.talla_40s} onChange={handleFormChange} className="w-full border border-emerald-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                    </FormGroup>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormGroup label="Peso 12m EC" unit="g">
                      <input type="number" name="peso_12m" value={formData.peso_12m} onChange={handleFormChange} className="w-full border border-emerald-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="Talla 12m EC" unit="cm">
                      <input type="number" name="talla_12m" value={formData.talla_12m} onChange={handleFormChange} className="w-full border border-emerald-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                    </FormGroup>
                    <FormGroup label="Locomoción Griffiths 12m" helper="Normal: 83-125">
                      <input type="number" name="loco_12m" value={formData.loco_12m} onChange={handleFormChange} className="w-full border border-emerald-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-200 outline-none" />
                    </FormGroup>
                  </div>
                </FormSection>

              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-white px-6 py-4 border-t border-slate-200 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgb(0,0,0,0.05)] z-10">
              <button onClick={() => setIsFormOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
                Cancelar
              </button>
              <button onClick={handleFormSubmit} className="px-6 py-2.5 text-sm font-black text-white bg-blue-700 hover:bg-blue-800 rounded-xl transition-colors flex items-center gap-2 shadow-md">
                <Save className="w-4 h-4" /> Guardar y Calcular Riesgo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PRINCIPAL */}
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
        <div className="bg-white px-6 py-2 rounded-full border border-slate-200 shadow-sm flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${results ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></div>
          <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">Motor: Modelo M7 Activo</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 w-full flex-grow">
        
        {/* PANEL IZQUIERDO: CONTROLES */}
        <div className="xl:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-700" />
              <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider">Datos del Paciente</h2>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Botón Principal para abrir Formulario */}
              <button 
                onClick={() => setIsFormOpen(true)}
                className="w-full py-4 bg-blue-50 border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-100 rounded-2xl flex flex-col items-center justify-center transition-all group"
              >
                <ClipboardList className="w-10 h-10 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-black text-blue-900">Llenar Formulario Clínico</span>
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">Ingreso manual estructurado</span>
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase tracking-widest">O importar JSON</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => fileInputRef.current.click()} className="flex-1 py-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-2 transition-colors">
                  <UploadCloud className="w-4 h-4" /> Subir Archivo
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".json,.txt" className="hidden" />
              </div>

              {/* Resumen de variables si existen */}
              {inputs && inputs.peso && (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mt-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em] flex justify-between">
                    <span>Objeto JSON Generado</span>
                    <button onClick={() => setIsFormOpen(true)} className="text-blue-600 hover:underline">Editar</button>
                  </h3>
                  <div className="space-y-2.5 overflow-hidden">
                    <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Peso nacer:</span><span className="font-black text-slate-900">{inputs.peso} g</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Semanas EG:</span><span className="font-black text-slate-900">{inputs.semanas}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Grupo:</span><span className="font-black text-slate-900">{inputs.grupo || '-'}</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Días Oxígeno:</span><span className="font-black text-slate-900">{inputs.oxigeno || '-'} d</span></div>
                    <div className="flex justify-between text-xs"><span className="text-slate-500 font-bold">Griffiths Gen:</span><span className="font-black text-slate-900">{inputs.griffiths_gen || '-'}</span></div>
                    {/* Indicador de más variables */}
                    <div className="pt-2 mt-2 border-t border-slate-200 text-center text-[10px] text-slate-400 font-bold italic">
                      + {Object.keys(inputs).length - 5} variables listas para Inferencia
                    </div>
                  </div>
                </div>
              )}

              {(!inputs || !inputs.peso) && (
                <button 
                  onClick={handleLoadExample}
                  className="w-full py-3.5 mt-2 bg-slate-800 text-white text-xs font-black rounded-2xl shadow-md hover:bg-slate-900 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Activity className="w-4 h-4"/> Cargar Caso de Prueba
                </button>
              )}
            </div>
          </div>
        </div>

        {/* PANEL DERECHO: RESULTADOS */}
        <div className="xl:col-span-9 flex flex-col h-full">
          <div className="flex p-1.5 bg-slate-200 rounded-2xl mb-6 self-start overflow-x-auto w-full md:w-auto">
            {['global', 'cognitivo', 'evidencia'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-blue-700 shadow-xl' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {tab === 'global' ? 'Riesgo Global' : tab === 'cognitivo' ? 'Perfil Cognitivo' : 'Validación Científica'}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 p-8 md:p-10 relative flex-grow flex flex-col">
            {!results && !isCalculating ? (
              <div className="flex-grow flex flex-col items-center justify-center opacity-20 grayscale">
                <ActivitySquare className="w-24 h-24 mb-4" />
                <p className="font-black uppercase tracking-widest text-sm">Esperando Datos Clínicos</p>
                <p className="text-xs font-medium mt-2">Utilice el formulario de la izquierda para comenzar</p>
              </div>
            ) : isCalculating ? (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-xl z-10 flex flex-col items-center justify-center rounded-[2.5rem]">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-700 mb-6"></div>
                <p className="font-black text-slate-700 uppercase tracking-widest text-xs">Ejecutando Pipeline XGBoost...</p>
              </div>
            ) : (
              <div className="animate-in fade-in zoom-in-95 duration-500 flex-grow flex flex-col">
                
                {activeTab === 'global' && (
                  <div className="flex-grow">
                    <div className="grid md:grid-cols-2 gap-12 items-center mb-10 pb-10 border-b border-slate-100">
                      <div className="flex flex-col items-center">
                        <div className={`w-44 h-44 rounded-full border-[10px] flex flex-col items-center justify-center shadow-xl mb-6 ${results.global.bgColor} ${results.global.color.replace('text-', 'border-')}`}>
                          {results.global.icon}
                          <span className={`text-xl font-black mt-2 tracking-tighter ${results.global.color}`}>{results.global.nivel}</span>
                        </div>
                        <div className="text-center bg-slate-50 p-4 rounded-2xl w-full border border-slate-100">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Probabilidad de Riesgo</p>
                          <p className="text-4xl font-black text-slate-900 tracking-tighter">{results.global.probabilidad}%</p>
                          <div className="mt-3 bg-blue-50 text-blue-800 text-[11px] font-medium p-2.5 rounded-xl border border-blue-100 leading-tight">
                            Calibrado — {results.global.probabilidad} de cada 100 pacientes con este perfil pertenecen al grupo GO-2 Bajo.
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Evaluación Neurocognitiva</h2>
                        <div className={`p-6 rounded-3xl border-2 ${results.global.nivel === 'Alto Riesgo' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                          <p className={`text-sm font-bold leading-relaxed ${results.global.nivel === 'Alto Riesgo' ? 'text-rose-900' : 'text-emerald-900'}`}>
                            {results.global.nivel === 'Alto Riesgo' 
                              ? 'El perfil neonatal y las variables de crecimiento se asocian con un riesgo significativo de déficit cognitivo a los 20 años.' 
                              : 'El perfil estructurado se asocia a trayectorias protectoras y a un desarrollo cognitivo típico a largo plazo.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <BarChartHorizontal className="w-6 h-6 text-blue-700" />
                        <h3 className="font-black text-slate-800 uppercase text-xs tracking-[0.2em]">Explicabilidad del Caso (SHAP)</h3>
                      </div>
                      <div className="bg-slate-50 p-6 md:p-8 rounded-[2rem] border border-slate-200">
                        <div className="space-y-1">
                          {results.shap.map(item => renderShapBar(item, Math.max(...results.shap.map(s => Math.abs(s.valor)))))}
                        </div>
                        <div className="mt-6 pt-5 border-t border-slate-200 flex justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-500">
                          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-emerald-400 rounded-sm"></div> Protector</span>
                          <span className="flex items-center gap-2"><div className="w-3 h-3 bg-rose-400 rounded-sm"></div> Factor Riesgo</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'cognitivo' && (
                  <div className="flex flex-col h-full py-4 flex-grow">
                    <div className="text-center mb-10">
                      <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Desglose del Perfil Cognitivo</h2>
                      <p className="text-slate-500 text-sm font-medium">Proyección probabilística basada en las 19 dimensiones del fenotipo GO-i a los 20 años.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 flex-grow">
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-6 text-blue-900 border-b border-slate-100 pb-4">
                          <Brain className="w-6 h-6 text-blue-600" />
                          <h3 className="font-black text-lg leading-tight tracking-tight">Inteligencia<br/><span className="text-[10px] text-slate-400 uppercase tracking-widest">Escala WASI</span></h3>
                        </div>
                        <div className="space-y-6 mt-2">
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-slate-600"><span>Rango Alto</span><span>{results.cognitivo.wasi.alto.toFixed(1)}%</span></div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${results.cognitivo.wasi.alto}%` }}></div></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-slate-600"><span>Rango Promedio</span><span>{results.cognitivo.wasi.medio.toFixed(1)}%</span></div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-blue-400" style={{ width: `${results.cognitivo.wasi.medio}%` }}></div></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-rose-600"><span>Riesgo de Déficit</span><span>{results.cognitivo.wasi.bajo.toFixed(1)}%</span></div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500" style={{ width: `${results.cognitivo.wasi.bajo}%` }}></div></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-6 text-indigo-900 border-b border-slate-100 pb-4">
                          <Focus className="w-6 h-6 text-indigo-600" />
                          <h3 className="font-black text-lg leading-tight tracking-tight">Atención / Ejecutiva<br/><span className="text-[10px] text-slate-400 uppercase tracking-widest">Batería TAP</span></h3>
                        </div>
                        <div className="space-y-6 mt-2">
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-slate-600"><span>T. Reacción Esperado</span><span>{results.cognitivo.tap.normal.toFixed(1)}%</span></div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${results.cognitivo.tap.normal}%` }}></div></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-rose-600">
                              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> T. Reacción Lento</span>
                              <span>{results.cognitivo.tap.alerta.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500" style={{ width: `${results.cognitivo.tap.alerta}%` }}></div></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
                        <div className="flex items-center gap-3 mb-6 text-violet-900 border-b border-slate-100 pb-4">
                          <MessageSquare className="w-6 h-6 text-violet-600" />
                          <h3 className="font-black text-lg leading-tight tracking-tight">Memoria Verbal<br/><span className="text-[10px] text-slate-400 uppercase tracking-widest">Escala CVLT</span></h3>
                        </div>
                        <div className="space-y-6 mt-2">
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-slate-600"><span>Retención Normal</span><span>{results.cognitivo.cvlt.normal.toFixed(1)}%</span></div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{ width: `${results.cognitivo.cvlt.normal}%` }}></div></div>
                          </div>
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-2 text-rose-600">
                              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Alerta de Retención</span>
                              <span>{results.cognitivo.cvlt.alerta.toFixed(1)}%</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-rose-500" style={{ width: `${results.cognitivo.cvlt.alerta}%` }}></div></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'evidencia' && (
                  <div className="flex flex-col h-full">
                    {currentEvidenciaView === 'go2' && (
                      <div className="animate-in slide-in-from-right-8 duration-500 flex-grow flex flex-col">
                        <div className="mb-6">
                          <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">Correlatos a los 20 años — fenotipo GO-2 Bajo</h2>
                          <p className="text-slate-500 text-sm font-medium">Hallazgos en participantes de la cohorte con perfil similar al de este paciente</p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-5 flex-grow">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-slate-500 font-black text-[11px] uppercase tracking-widest"><Brain className="w-4 h-4"/> Huella Cerebral (MRI)</div>
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex-grow flex flex-col">
                              <h4 className="text-rose-900 font-bold mb-4 text-[15px]">Tractos con menor integridad</h4>
                              <DotItem label="FA cíngulo izquierdo" value="q<0.01" valColor="rose" />
                              <DotItem label="FA corticoespinal dcho." value="q<0.05" valColor="rose" />
                              <DotItem label="FA fascículo uncinado" value="q<0.05" valColor="rose" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-slate-500 font-black text-[11px] uppercase tracking-widest"><FileText className="w-4 h-4"/> Desempeño Adulto</div>
                            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex-grow flex flex-col">
                              <h4 className="text-rose-900 font-bold mb-4 text-[15px]">Áreas significativamente menores</h4>
                              <DotItem label="ICFES global" value="-8.4 pts" valColor="rose" />
                              <DotItem label="Lectura crítica ICFES" value="-8.6 pts" valColor="rose" />
                              <DotItem label="Tiempo reacción TAP-WM" value="+39 ms" valColor="rose" />
                            </div>
                          </div>
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-slate-500 font-black text-[11px] uppercase tracking-widest"><CheckCircle className="w-4 h-4"/> Sin Diferencia Significativa</div>
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex-grow flex flex-col">
                              <h4 className="text-emerald-900 font-bold mb-4 text-[15px]">Perfil metabólico equivalente</h4>
                              <DotItem label="IMC a los 20 años" value="ns" valColor="emerald" />
                              <DotItem label="Presión arterial" value="ns" valColor="emerald" />
                              <DotItem label="Glicemia / perfil lipídico" value="ns" valColor="emerald" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentEvidenciaView === 'go1' && (
                      <div className="animate-in slide-in-from-left-8 duration-500 flex-grow flex flex-col">
                         <div className="mb-8">
                          <h2 className="text-2xl font-black text-slate-900 tracking-tighter mb-1">Correlatos a los 20 años — fenotipo GO-1 Alto</h2>
                          <p className="text-slate-500 text-sm font-medium">Hallazgos en participantes con perfil similar al de este paciente</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6 flex-grow">
                          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 md:p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-6 text-emerald-900 font-black text-lg"><Brain className="w-6 h-6 text-emerald-600"/> Integridad cerebral dentro de rangos normales</div>
                            <DotItem label="FA cíngulo izquierdo" value="GO-1: 0.412" valColor="emerald" />
                            <DotItem label="FA corticoespinal dcho." value="GO-1: 0.558" valColor="emerald" />
                          </div>
                          <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 md:p-8 flex flex-col">
                            <div className="flex items-center gap-3 mb-6 text-emerald-900 font-black text-lg"><FileText className="w-6 h-6 text-emerald-600"/> Desempeño académico y auditivo equivalente a pares</div>
                            <DotItem label="ICFES global" value="53.2 pts" valColor="emerald" />
                            <DotItem label="WASI FSIQ" value="= 91.7" valColor="emerald" />
                            <DotItem label="Umbral auditivo" value="18.2 dB" valColor="emerald" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex flex-col md:flex-row justify-between items-center border-t border-slate-200 pt-5 gap-4">
                      <span className="text-[11px] text-slate-400 font-semibold tracking-wide">KMC-400-20y · n=491 · Fundación Canguro / Uniandes 2026</span>
                      <button 
                        onClick={() => setEvidenciaViewOverride(currentEvidenciaView === 'go2' ? 'go1' : 'go2')}
                        className="text-xs font-black text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
                      >
                        Ver hallazgos en {currentEvidenciaView === 'go2' ? 'GO-1 Alto' : 'GO-2 Bajo'} <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="max-w-7xl mx-auto w-full mt-6 text-center text-xs text-slate-400 font-medium border-t border-slate-200 pt-5 pb-2">
        <p className="flex items-center justify-center gap-2">
          <Info className="w-4 h-4" />
          Herramienta de apoyo clínico. No reemplaza el juicio del profesional de salud. Modelo M7 · KMC-400-20y · n=383 · AUC=0.678
        </p>
      </footer>
    </div>
  );
}