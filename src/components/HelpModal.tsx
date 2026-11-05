import React, { useState } from 'react';
import {
  HelpCircle,
  MapPin,
  Film,
  Tv,
  Camera,
  Sliders,
  MousePointerClick,
  Eye,
  Sparkles,
  CheckCircle2,
  Image as ImageIcon,
  X
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectMode: (mode: 'STAGING' | 'DIRECTOR' | 'MULTIVIEW') => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onSelectMode }) => {
  const [activeTab, setActiveTab] = useState<'WORKFLOW' | 'EQUIPMENT' | 'REFERENCES'>('WORKFLOW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-neutral-200 font-sans">
        {/* TOP HEADER */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                GUÍA DE USO • CINESTAGE 3D MULTICAM & RIG PREVIZ
              </h2>
              <p className="text-xs text-neutral-400">
                Aprende a posicionar tus cámaras y rigs en el escenario 3D y visualizar el POV de cada una en tiempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="px-6 pt-3 bg-neutral-950/60 border-b border-neutral-800 flex items-center gap-2 shrink-0 text-xs font-bold">
          <button
            onClick={() => setActiveTab('WORKFLOW')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'WORKFLOW'
                ? 'border-cyan-400 text-cyan-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <MousePointerClick className="w-4 h-4" />
            <span>1. Cómo Usar la Aplicación (Flujo de 3 Pasos)</span>
          </button>
          <button
            onClick={() => setActiveTab('EQUIPMENT')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'EQUIPMENT'
                ? 'border-cyan-400 text-cyan-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>2. Cámaras, Rigs y Controles 3D</span>
          </button>
          <button
            onClick={() => setActiveTab('REFERENCES')}
            className={`px-4 py-2.5 rounded-t-xl border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'REFERENCES'
                ? 'border-cyan-400 text-cyan-400 bg-neutral-900'
                : 'border-transparent text-neutral-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>3. Fotos de Referencia del Escenario</span>
          </button>
        </div>

        {/* MODAL CONTENT BODY */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs leading-relaxed">
          {activeTab === 'WORKFLOW' && (
            <div className="space-y-5">
              {/* Intro Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-neutral-900 to-indigo-950/60 border border-cyan-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm text-white mb-1">
                    Objetivo Principal: Pre-visualización Cinematográfica y Broadcast
                  </h4>
                  <p className="text-neutral-300">
                    La aplicación está diseñada en <strong>3 modos de trabajo secuenciales</strong>: primero colocas tus cámaras y soportes (rigs) en cualquier punto del escenario 3D, luego entras al <strong>Modo Director</strong> para operar el movimiento del rig viendo exactamente lo que capta el lente (POV), o pasas al <strong>Multiview Wall</strong> para monitorear todas las cámaras a la vez.
                  </p>
                </div>
              </div>

              {/* 3 Step Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* STEP 1 */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-[11px]">
                        PASO 1
                      </span>
                      <MapPin className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">1. 3D Stage Setup (Colocar Cámaras)</h3>
                    <ul className="space-y-1.5 text-neutral-300 list-disc pl-4">
                      <li>
                        <strong>Clic para Posicionar:</strong> Con <em>"Click-to-Place: ON"</em>, haz clic en cualquier parte del escenario 3D (tarima principal, pasarela/catwalk, escalera central, segundo nivel de banda, foso o backstage) y la cámara se colocará automáticamente a la altura correcta del piso.
                      </li>
                      <li>
                        <strong>Personaliza el Equipo:</strong> Elige el cuerpo de cámara (Sony FX6, Burano, Venice 2 o FR7), el tipo de rig (Trípode, Slider, Dolly, Grúa, CableCam o Gimbal) y la óptica (18mm a 250mm).
                      </li>
                      <li>
                        <strong>Vista Previa PIP:</strong> En la esquina superior derecha verás en vivo qué encuadre tiene esa cámara mientras la mueves.
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      onSelectMode('STAGING');
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Ir a 1. 3D Stage Setup
                  </button>
                </div>

                {/* STEP 2 */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 font-mono font-bold text-[11px]">
                        PASO 2
                      </span>
                      <Film className="w-5 h-5 text-red-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">2. Director Mode (Operar Rig y POV)</h3>
                    <ul className="space-y-1.5 text-neutral-300 list-disc pl-4">
                      <li>
                        <strong>Visor Óptico en Vivo (POV):</strong> Observa la imagen exacta de la cámara con HUD profesional (máscaras 16:9 / 2.39:1, áreas seguras, distancia focal, apertura T-stop y luz Tally).
                      </li>
                      <li>
                        <strong>Control Total del Rig:</strong> Mueve el Pan/Tilt, gira y eleva el brazo de la grúa TechnoJib, activa el recorrido automático <em>Ping-Pong</em> del Slider o Dolly, controla la altura de la CableCam o el zoom óptico.
                      </li>
                      <li>
                        <strong>Vista Dividida 50/50:</strong> Observa simultáneamente el POV de la cámara a la izquierda y el movimiento físico del rig en el escenario 3D a la derecha.
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      onSelectMode('DIRECTOR');
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-gradient-to-r from-red-600 to-indigo-600 hover:from-red-500 hover:to-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Ir a 2. Director Mode
                  </button>
                </div>

                {/* STEP 3 */}
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono font-bold text-[11px]">
                        PASO 3
                      </span>
                      <Tv className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-sm font-bold text-white">3. Multiview Wall (Monitoreo Total)</h3>
                    <ul className="space-y-1.5 text-neutral-300 list-disc pl-4">
                      <li>
                        <strong>Muro de Producción en Vivo:</strong> Visualiza la señal óptica 3D en tiempo real de todas las cámaras que colocaste en el escenario al mismo tiempo.
                      </li>
                      <li>
                        <strong>Switcher de Tallies:</strong> Cambia cualquier cámara a <strong>PGM (Al Aire - Rojo)</strong> o <strong>PRV (Previo - Verde)</strong> como en una unidad móvil de televisión (OB Van).
                      </li>
                      <li>
                        <strong>Salto Rápido:</strong> Haz clic sobre el monitor de cualquier cámara en el Multiviewer para abrirla inmediatamente en el Modo Director.
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => {
                      onSelectMode('MULTIVIEW');
                      onClose();
                    }}
                    className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                  >
                    Ir a 3. Multiview Wall
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'EQUIPMENT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-sm text-cyan-400">Controles del Ratón en la Vista 3D</h4>
                  <ul className="space-y-1.5 text-neutral-300">
                    <li>• <strong>Clic Izquierdo + Arrastrar:</strong> Orbitar 360° alrededor del escenario 3D.</li>
                    <li>• <strong>Clic Derecho + Arrastrar:</strong> Desplazar (Pan) la cámara del escenario.</li>
                    <li>• <strong>Rueda del Ratón (Scroll):</strong> Acercar o alejar la vista 3D.</li>
                    <li>• <strong>Clic Rápido sobre el Escenario:</strong> Mueve la cámara activa a ese punto exacto (ajustando automáticamente la altura si haces clic en la tarima, pasarela o segundo piso).</li>
                    <li>• <strong>Clic sobre un Rig 3D:</strong> Selecciona esa cámara inmediatamente.</li>
                  </ul>
                </div>

                <div className="bg-neutral-950/80 border border-neutral-800 rounded-xl p-4 space-y-2">
                  <h4 className="font-bold text-sm text-indigo-400">Tipos de Rigs y Movimientos Soportados</h4>
                  <ul className="space-y-1.5 text-neutral-300">
                    <li>• <strong>TRIPOD (Pedestal de Estudio):</strong> Ajuste de altura, Pan (-180° a 180°) y Tilt (-80° a 80°).</li>
                    <li>• <strong>SLIDER (Riel Motorizado):</strong> Largo de riel (1m–4m), ángulo de orientación y modo automático <em>Ping-Pong</em>.</li>
                    <li>• <strong>DOLLY (Rieles de Piso):</strong> Recorrido recto o curvo alrededor de la pasarela con modo automático.</li>
                    <li>• <strong>CRANE (Grúa TechnoJib):</strong> Giro de base 360°, elevación de pluma, extensión telescópica (4m–12m) y cabezal remoto.</li>
                    <li>• <strong>CABLE (Skycam Aérea):</strong> Desplazamiento aéreo sobre el escenario y descenso por cabrestante (winch).</li>
                    <li>• <strong>GIMBAL (Steadicam / Ronin):</strong> Operador en movimiento con simulación de balanceo humano orgánico.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'REFERENCES' && (
            <div className="space-y-3">
              <p className="text-neutral-300">
                El escenario arquitectónico 3D (con su anillo circular de luces superior, triple pantalla LED trasera, torres IMAG verticales con blinders ámbar, pasarela central, escalera iluminada, torres laterales con escaleras amarillas y área de backstage con flight cases) fue modelado en 3D tomando como referencia estas 4 láminas del folder <code className="text-cyan-400">Stage/</code>:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { title: 'Vista Frontal del Estadio', src: '/stage/stadium-spectacle.png' },
                  { title: '6 Vistas del Escenario (Frente, Lados, Escenario y Backstage)', src: '/stage/six-views.png' },
                  { title: '5 Vistas Dinámicas de Producción', src: '/stage/dynamic-five.png' },
                  { title: '3 Vistas de Estructura y Backstage', src: '/stage/three-views.png' }
                ].map(item => (
                  <div key={item.src} className="bg-neutral-950 border border-neutral-800 rounded-xl p-2 flex flex-col gap-1.5">
                    <img src={item.src} alt={item.title} className="w-full h-36 object-cover rounded-lg" />
                    <span className="text-[11px] font-bold text-neutral-200 px-1">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-neutral-400 font-mono">
            Tip: Puedes abrir esta ayuda en cualquier momento desde el botón "? Ayuda / Guía" en la barra superior.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer"
          >
            Entendido, Empezar
          </button>
        </div>
      </div>
    </div>
  );
};
