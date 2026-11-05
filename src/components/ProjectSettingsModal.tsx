import React, { useState, useRef } from 'react';
import { ProjectSettings } from '../types';
import { exportProjectToJson, importProjectFromJson, clearLocalStorage } from '../utils/projectStorage';
import {
  FileJson,
  Download,
  Upload,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  X,
  FileCode,
  HardDrive,
  Sparkles
} from 'lucide-react';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSettings: ProjectSettings;
  onLoadSettings: (loaded: ProjectSettings) => void;
  onResetDefault: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  currentSettings,
  onLoadSettings,
  onResetDefault,
  onNotify
}) => {
  const [projectName, setProjectName] = useState<string>(currentSettings.projectName || 'Concert-Production-Previz');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const settingsToExport: ProjectSettings = {
        ...currentSettings,
        projectName: projectName.trim() || 'Concert-Production-Previz',
        savedAt: new Date().toISOString()
      };
      const fileName = exportProjectToJson(settingsToExport, projectName);
      onNotify(`Configuración guardada en archivo: ${fileName}`, 'success');
      onClose();
    } catch (err: any) {
      onNotify(`Error al guardar: ${err.message}`, 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processFile = async (file: File) => {
    setImportError(null);
    try {
      const loaded = await importProjectFromJson(file);
      onLoadSettings(loaded);
      onNotify(`Configuración cargada con éxito (${loaded.rigs.length} cámaras restauradas)`, 'success');
      onClose();
    } catch (err: any) {
      setImportError(err.message || 'Error al procesar el archivo JSON');
      onNotify(`Error: ${err.message}`, 'error');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden text-neutral-200 font-sans">
        {/* HEADER */}
        <div className="px-6 py-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <FileJson className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                GUARDAR Y ABRIR CONFIGURACIÓN (ARCHIVO .JSON)
              </h2>
              <p className="text-xs text-neutral-400">
                Exporta o carga todos los parámetros de cámaras, rigs, ópticas, escenario y coordenadas
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

        {/* BODY */}
        <div className="p-6 space-y-5 text-xs">
          {/* SECTION 1: EXPORT / SAVE */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                <span>1. Guardar Configuración Actual (.JSON)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 font-mono text-[10px]">
                {currentSettings.rigs.length} Cámaras listas para exportar
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-neutral-400 font-medium text-[11px]">
                Nombre del Proyecto / Producción:
              </label>
              <input
                type="text"
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Ej: Estadio-Monumental-Concierto-2026"
                className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-neutral-900/80 border border-neutral-800/80 text-[11px] text-neutral-300 space-y-1">
              <div className="font-semibold text-neutral-200">El archivo .JSON contendrá toda la información:</div>
              <ul className="list-disc pl-4 text-neutral-400 space-y-0.5">
                <li>Ubicaciones 3D exactas `[X, Y, Z]` de cada cámara en el escenario.</li>
                <li>Cuerpos de cámara (Sony FX6, Burano, Venice 2, FR7) y ópticas con sus distancias focales.</li>
                <li>Soportes y parámetros de rigs (alturas, recorridos de sliders, plumas de grúas, cables, etc.).</li>
                <li>Tema visual del escenario 3D y ajustes del visor (máscaras, guías, layout del director).</li>
              </ul>
            </div>

            <button
              onClick={handleExport}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Archivo .JSON a mi Computadora</span>
            </button>
          </div>

          {/* SECTION 2: IMPORT / OPEN */}
          <div className="bg-neutral-950/70 border border-neutral-800 rounded-xl p-4 space-y-3">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>2. Abrir / Cargar Configuración (.JSON)</span>
            </span>

            {/* Drag & Drop Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-indigo-400 bg-indigo-950/30 text-indigo-200'
                  : 'border-neutral-700 bg-neutral-900/60 hover:border-neutral-600 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <FolderOpen className="w-8 h-8 text-indigo-400" />
              <div>
                <p className="font-semibold text-xs text-white">
                  Arrastra aquí tu archivo <span className="text-indigo-400">.json</span> o haz clic para seleccionarlo
                </p>
                <p className="text-[11px] text-neutral-500 mt-0.5">
                  Compatible con cualquier archivo guardado previamente desde esta aplicación
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
            />

            {importError && (
              <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{importError}</span>
              </div>
            )}
          </div>

          {/* SECTION 3: LOCAL BROWSER STORAGE & RESET */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-950/40 border border-neutral-800 text-[11px] text-neutral-400">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Auto-Guardado Local:</strong> Tus cambios se respaldan automáticamente en este navegador.
              </span>
            </div>

            <button
              onClick={() => {
                if (window.confirm('¿Seguro que deseas reiniciar todas las cámaras a los valores por defecto de fábrica?')) {
                  clearLocalStorage();
                  onResetDefault();
                  onNotify('Cámaras reiniciadas a la configuración por defecto', 'info');
                  onClose();
                }
              }}
              className="px-2.5 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white border border-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restablecer por Defecto</span>
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="px-6 py-3 bg-neutral-950 border-t border-neutral-800 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-medium text-xs cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
