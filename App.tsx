
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGamepad } from './hooks/useGamepad';
import { usePrevious } from './hooks/usePrevious';
import type { Profile, Mapping, MappingType, AIMappingSuggestion, ButtonKey, StickKey, DpadKey, TriggerKey, BumperKey, ComboMapping } from './types';
import { saveProfile, getProfiles, deleteProfile, loadProfile as loadProfileFromStorage } from './services/profileService';
import { generateMappingsFromImage } from './services/geminiService';
import Header from './components/Header';
import Toolbar from './components/Toolbar';
import MappingArea from './components/MappingArea';
import GamepadVisualizer from './components/GamepadVisualizer';
import ProfileManagerModal from './components/ProfileManagerModal';
import Onboarding from './components/Onboarding';
import SettingsModal from './components/SettingsModal';
import NativeCodeViewerModal from './components/NativeCodeViewerModal';

const App: React.FC = () => {
  const gamepadState = useGamepad();
  const previousGamepadState = usePrevious(gamepadState);
  const [profiles, setProfiles] = useState<string[]>([]);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [isNativeCodeModalOpen, setNativeCodeModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState<Mapping | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(!localStorage.getItem('onboardingComplete'));
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const mappingAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProfiles(getProfiles());
  }, []);

  // Bloco de código para solicitação de permissões (desativado para Web)
  useEffect(() => {
    // =================================================================================
    // NOTA PARA O DESENVOLVEDOR: LÓGICA DE PERMISSÃO DE SOBREPOSIÇÃO
    // O código abaixo é um exemplo de como você solicitaria permissões de sobreposição
    // em um ambiente de aplicativo nativo (como Electron/Tauri) ou móvel.
    // APIs de navegador padrão não suportam sobreposição de tela por razões de segurança.
    // Para habilitar, você precisaria integrar isso com as APIs específicas da sua
    // plataforma de destino e remover os comentários.
    // =================================================================================
    /*
    const requestOverlayPermission = async () => {
      try {
        // Exemplo para um ambiente hipotético (ex: Electron)
        // const hasPermission = await window.electronAPI.requestOverlayPermission();
        // if (hasPermission) {
        //   console.log("Permissão de sobreposição concedida.");
        // } else {
        //   alert("A permissão de sobreposição é necessária para o funcionamento completo do NetoPad.");
        // }
        console.log("Tentativa de solicitar permissão de sobreposição (simulado).");
      } catch (error) {
        console.error("Erro ao solicitar permissão de sobreposição:", error);
      }
    };

    // Chame a função ao iniciar o app.
    requestOverlayPermission();
    */
    // =================================================================================
  }, []);


  const refreshProfiles = useCallback(() => {
    setProfiles(getProfiles());
  }, []);

  const handleNewProfile = () => {
    const profileName = prompt("Digite um nome para o novo perfil:");
    if (profileName && !profiles.includes(profileName)) {
      const newProfile: Profile = {
        name: profileName,
        mappings: [],
        backgroundImage: null,
      };
      setActiveProfile(newProfile);
      saveProfile(newProfile);
      refreshProfiles();
    } else if (profileName) {
      alert("Já existe um perfil com este nome.");
    }
  };

  const handleSaveProfile = () => {
    if (activeProfile) {
      saveProfile(activeProfile);
      refreshProfiles();
      alert(`Perfil "${activeProfile.name}" salvo!`);
    }
  };

  const handleLoadProfile = (name: string) => {
    const profile = loadProfileFromStorage(name);
    if (profile) {
      setActiveProfile(profile);
    }
    setProfileModalOpen(false);
  };

  const handleDeleteProfile = (name: string) => {
    if (window.confirm(`Tem certeza que deseja deletar o perfil "${name}"?`)) {
      deleteProfile(name);
      if (activeProfile?.name === name) {
        setActiveProfile(null);
      }
      refreshProfiles();
    }
  };

  const updateProfile = useCallback((updatedProfile: Profile) => {
    setActiveProfile(updatedProfile);
  }, []);

  const addMapping = (type: MappingType, x: number, y: number) => {
    if (!activeProfile) {
      alert("Por favor, crie ou carregue um perfil primeiro.");
      return;
    }

    let newMapping: Mapping;

    switch (type) {
      case 'button':
        newMapping = { id: Date.now(), type: 'button', x, y, key: 'A', label: 'A' };
        break;
      case 'bumper':
        newMapping = { id: Date.now(), type: 'bumper', x, y, key: 'LB', label: 'LB' };
        break;
      case 'stick':
        newMapping = { id: Date.now(), type: 'stick', x, y, key: 'LS', label: 'LS' };
        break;
      case 'dpad':
        newMapping = { id: Date.now(), type: 'dpad', x, y, key: 'DPAD', label: 'DPAD' };
        break;
      case 'trigger':
        newMapping = { id: Date.now(), type: 'trigger', x, y, key: 'LT', label: 'LT' };
        break;
      case 'combo':
        newMapping = { id: Date.now(), type: 'combo', x, y, modifierKey: 'LT', actionKey: 'B', label: 'LT + B'};
        break;
      default:
        return;
    }

    const updatedProfile = { ...activeProfile, mappings: [...activeProfile.mappings, newMapping] };
    setActiveProfile(updatedProfile);
  };

  const updateMappingPosition = (id: number, x: number, y: number) => {
    if (!activeProfile) return;
    const updatedMappings = activeProfile.mappings.map(m => m.id === id ? { ...m, x, y } : m);
    setActiveProfile({ ...activeProfile, mappings: updatedMappings });
  };
   
  const handleOpenSettings = (mapping: Mapping) => {
    setEditingMapping(mapping);
    setSettingsModalOpen(true);
  };

  const handleUpdateMapping = (updatedMapping: Mapping) => {
    if (!activeProfile) return;
    const updatedMappings = activeProfile.mappings.map(m => m.id === updatedMapping.id ? updatedMapping : m);
    setActiveProfile({ ...activeProfile, mappings: updatedMappings });
    setSettingsModalOpen(false);
    setEditingMapping(null);
  };
  
  const handleRemoveMapping = (id: number) => {
    if (!activeProfile || isTestMode) return;
    if (window.confirm('Tem certeza que deseja remover este mapeamento?')) {
        const updatedMappings = activeProfile.mappings.filter(m => m.id !== id);
        setActiveProfile({ ...activeProfile, mappings: updatedMappings });
    }
  };

  const handleAiAutoMapping = async () => {
    if (!activeProfile?.backgroundImage) {
      alert("Por favor, carregue uma captura de tela primeiro.");
      return;
    }
    if (!mappingAreaRef.current) return;
    
    setIsAiLoading(true);
    try {
      const suggestions = await generateMappingsFromImage(activeProfile.backgroundImage);
      if (window.confirm(`A IA gerou ${suggestions.length} mapeamentos. Deseja aplicá-los? (Isso substituirá os mapeamentos existentes)`)) {
        const rect = mappingAreaRef.current.getBoundingClientRect();
        const newMappings = suggestions.map((s, i): Mapping | null => {
          const x = (s.x_percent / 100) * rect.width;
          const y = (s.y_percent / 100) * rect.height;
          const base = { id: Date.now() + i, x, y, label: s.label };

          switch (s.type) {
            case 'button': return { ...base, type: 'button', key: s.suggested_key as ButtonKey };
            case 'bumper': return { ...base, type: 'bumper', key: s.suggested_key as BumperKey };
            case 'stick': return { ...base, type: 'stick', key: s.suggested_key as StickKey };
            case 'dpad': return { ...base, type: 'dpad', key: s.suggested_key as DpadKey };
            case 'trigger': return { ...base, type: 'trigger', key: s.suggested_key as TriggerKey };
            default: return null;
          }
        }).filter((m): m is Mapping => m !== null);

        setActiveProfile({ ...activeProfile, mappings: newMappings });
      }
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleExportCoords = () => {
    if (!activeProfile) {
        alert("Nenhum perfil ativo para exportar.");
        return;
    }

    const header = `// Coordenadas para o Perfil: ${activeProfile.name}\n// Gerado pelo NetoPad em ${new Date().toLocaleString()}\n\n`;
    const content = activeProfile.mappings.map(m => {
        const key = 'key' in m ? m.key : (m as ComboMapping).modifierKey ? `${(m as ComboMapping).modifierKey}+${(m as ComboMapping).actionKey}` : 'N/A';
        return `// ${m.label} (${m.type}) -> ${key}\nprivate var pos_${key}_x: Float = ${Math.round(m.x)}f\nprivate var pos_${key}_y: Float = ${Math.round(m.y)}f\n`;
    }).join('\n');

    const fullContent = header + content;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeProfile.name}_coords.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    alert(`Coordenadas para "${activeProfile.name}" exportadas!`);
  };


  if (showOnboarding) {
    return <Onboarding onComplete={() => {
      localStorage.setItem('onboardingComplete', 'true');
      setShowOnboarding(false);
    }} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header
        onNewProfile={handleNewProfile}
        onSaveProfile={handleSaveProfile}
        onLoadProfile={() => setProfileModalOpen(true)}
        onExportCoords={handleExportCoords}
        onViewNativeCode={() => setNativeCodeModalOpen(true)}
        profileName={activeProfile?.name}
        isConnected={gamepadState.isConnected}
        onAiAutoMap={handleAiAutoMapping}
        isAiLoading={isAiLoading}
        isTestMode={isTestMode}
        onToggleTestMode={() => setIsTestMode(prev => !prev)}
        isAiDisabled={!activeProfile?.backgroundImage}
        isActionDisabled={!activeProfile || activeProfile.mappings.length === 0}
      />
      <main className="flex-grow flex flex-col lg:flex-row p-4 gap-4">
        <Toolbar />
        <MappingArea
          profile={activeProfile}
          updateProfile={updateProfile}
          addMapping={addMapping}
          updateMappingPosition={updateMappingPosition}
          gamepadState={gamepadState}
          previousGamepadState={previousGamepadState}
          onOpenSettings={handleOpenSettings}
          onRemoveMapping={handleRemoveMapping}
          isAiLoading={isAiLoading}
          isTestMode={isTestMode}
          ref={mappingAreaRef}
        />
        <GamepadVisualizer gamepadState={gamepadState} />
      </main>
      <ProfileManagerModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        profiles={profiles}
        onLoad={handleLoadProfile}
        onDelete={handleDeleteProfile}
      />
      {editingMapping && (
         <SettingsModal
            isOpen={isSettingsModalOpen}
            onClose={() => setSettingsModalOpen(false)}
            mapping={editingMapping}
            onSave={handleUpdateMapping}
         />
      )}
      <NativeCodeViewerModal
        isOpen={isNativeCodeModalOpen}
        onClose={() => setNativeCodeModalOpen(false)}
      />
    </div>
  );
};

export default App;
