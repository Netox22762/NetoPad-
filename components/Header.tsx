
import React from 'react';
import { Gamepad2, PlusCircle, FolderOpen, Save, Wifi, WifiOff, Sparkles, Loader2, TestTube2, Download } from 'lucide-react';

interface HeaderProps {
  onNewProfile: () => void;
  onSaveProfile: () => void;
  onLoadProfile: () => void;
  onExportCoords: () => void;
  profileName?: string;
  isConnected: boolean;
  onAiAutoMap: () => void;
  isAiLoading: boolean;
  isTestMode: boolean;
  onToggleTestMode: () => void;
  isAiDisabled: boolean;
  isExportDisabled: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
    onNewProfile, onSaveProfile, onLoadProfile, onExportCoords, profileName, isConnected, 
    onAiAutoMap, isAiLoading, isTestMode, onToggleTestMode, isAiDisabled, isExportDisabled 
}) => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm p-3 shadow-lg flex justify-between items-center border-b border-slate-700">
      <div className="flex items-center gap-3">
        <Gamepad2 className="text-cyan-400" size={32} />
        <h1 className="text-xl md:text-2xl font-bold text-white tracking-wider">
          Neto<span className="text-cyan-400">Pad</span>
        </h1>
        {profileName && <span className="hidden md:inline-block bg-slate-700 text-cyan-300 px-3 py-1 rounded-full text-sm font-semibold">{profileName}</span>}
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2 mr-2 border-r border-slate-600 pr-3">
            <label htmlFor="testModeToggle" className="text-sm font-medium text-slate-300 cursor-pointer flex items-center gap-2">
                <TestTube2 size={18} />
                <span className="hidden md:inline">Modo Teste</span>
            </label>
            <button
                role="switch"
                aria-checked={isTestMode}
                id="testModeToggle"
                onClick={onToggleTestMode}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-slate-800 ${isTestMode ? 'bg-cyan-500' : 'bg-slate-600'}`}
            >
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isTestMode ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>

        <button onClick={onAiAutoMap} disabled={isAiLoading || isAiDisabled} title={isAiDisabled ? "Carregue uma imagem primeiro" : "Mapeamento Automático com IA"} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          {isAiLoading ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
          <span className="hidden md:inline">Mapeamento IA</span>
        </button>
        <button onClick={onNewProfile} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
          <PlusCircle size={20} />
          <span className="hidden md:inline">Novo</span>
        </button>
        <button onClick={onLoadProfile} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105">
          <FolderOpen size={20} />
          <span className="hidden md:inline">Carregar</span>
        </button>
        <button onClick={onSaveProfile} disabled={!profileName} className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          <Save size={20} />
          <span className="hidden md:inline">Salvar</span>
        </button>
         <button onClick={onExportCoords} disabled={isExportDisabled} title="Exportar Coordenadas para Uso Nativo" className="flex items-center gap-2 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
          <Download size={20} />
          <span className="hidden md:inline">Exportar</span>
        </button>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
          <span className="hidden md:inline font-semibold">{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
