
import React, { useCallback, forwardRef, useState, useEffect } from 'react';
import type { Profile, Mapping, MappingType, GamepadState, ButtonMapping, StickMapping, DpadMapping, TriggerMapping, BumperMapping, ComboMapping } from '../types';
import MappingElement from './MappingElement';
import { UploadCloud, Loader2 } from 'lucide-react';

interface MappingAreaProps {
  profile: Profile | null;
  updateProfile: (profile: Profile) => void;
  addMapping: (type: MappingType, x: number, y: number) => void;
  updateMappingPosition: (id: number, x: number, y: number) => void;
  gamepadState: GamepadState;
  previousGamepadState: GamepadState | undefined;
  onOpenSettings: (mapping: Mapping) => void;
  onRemoveMapping: (id: number) => void;
  isAiLoading: boolean;
  isTestMode: boolean;
}

// Re-using the activation logic here for simulation
const getIsActive = (mapping: Mapping, gamepadState: GamepadState, previousGamepadState?: GamepadState): boolean => {
    switch (mapping.type) {
        case 'button':
            return gamepadState.buttons[(mapping as ButtonMapping).key] && !previousGamepadState?.buttons[(mapping as ButtonMapping).key];
        case 'bumper':
            return gamepadState.buttons[(mapping as BumperMapping).key] && !previousGamepadState?.buttons[(mapping as BumperMapping).key];
        case 'stick':
            const stickKey = (mapping as StickMapping).key;
            return Math.abs(gamepadState.axes[`${stickKey}_X`]) > 0.8 || Math.abs(gamepadState.axes[`${stickKey}_Y`]) > 0.8;
        case 'dpad':
             const dpadPressed = gamepadState.buttons['UP'] || gamepadState.buttons['DOWN'] || gamepadState.buttons['LEFT'] || gamepadState.buttons['RIGHT'];
             const dpadPreviouslyPressed = previousGamepadState?.buttons['UP'] || previousGamepadState?.buttons['DOWN'] || previousGamepadState?.buttons['LEFT'] || previousGamepadState?.buttons['RIGHT'];
             return dpadPressed && !dpadPreviouslyPressed;
        case 'trigger':
            const triggerKey = (mapping as TriggerMapping).key;
            return gamepadState.axes[triggerKey] > 0.8 && previousGamepadState?.axes[triggerKey] <= 0.8;
        case 'combo':
            if (!previousGamepadState) return false;
            const comboMap = mapping as ComboMapping;
            const modifierIsTrigger = ['LT', 'RT'].includes(comboMap.modifierKey);
            
            const modifierHeld = modifierIsTrigger
                ? gamepadState.axes[comboMap.modifierKey] > 0.5
                : gamepadState.buttons[comboMap.modifierKey];

            const actionJustPressed =
                gamepadState.buttons[comboMap.actionKey] &&
                !previousGamepadState.buttons[comboMap.actionKey];
            
            return modifierHeld && actionJustPressed;
        default:
            return false;
    }
};


const MappingArea = forwardRef<HTMLDivElement, MappingAreaProps>(({ profile, updateProfile, addMapping, updateMappingPosition, gamepadState, previousGamepadState, onOpenSettings, onRemoveMapping, isAiLoading, isTestMode }, ref) => {
  const [simulatedPressId, setSimulatedPressId] = useState<number | null>(null);

  useEffect(() => {
    if (!isTestMode || !profile) return;

    for (const mapping of profile.mappings) {
        if (getIsActive(mapping, gamepadState, previousGamepadState)) {
            setSimulatedPressId(mapping.id);
            // The timeout clears the pulse effect, making it a flash
            setTimeout(() => setSimulatedPressId(null), 200);
            // Break after the first activated mapping is found to avoid multiple pulses
            break; 
        }
    }
  }, [gamepadState, previousGamepadState, isTestMode, profile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && profile) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        updateProfile({ ...profile, backgroundImage: e.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const mappingAreaEl = (ref as React.RefObject<HTMLDivElement>)?.current;
    if (!mappingAreaEl || isTestMode) return;
    
    const type = event.dataTransfer.getData('application/reactflow') as MappingType;
    if (!type) return;

    const rect = mappingAreaEl.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    addMapping(type, x, y);

  }, [addMapping, ref, isTestMode]);


  return (
    <div className="flex-grow bg-slate-900/50 rounded-lg border-2 border-dashed border-slate-700 flex justify-center items-center relative overflow-hidden" ref={ref} onDragOver={onDragOver} onDrop={onDrop}>
      {isAiLoading && (
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm z-20 flex flex-col justify-center items-center text-cyan-400">
            <Loader2 size={64} className="animate-spin mb-4" />
            <p className="text-xl font-semibold">IA está analisando a imagem...</p>
            <p className="text-slate-400">Isso pode levar alguns segundos.</p>
        </div>
      )}
      {profile?.backgroundImage ? (
        <img src={profile.backgroundImage} alt="Captura de tela do jogo" className="w-full h-full object-contain" />
      ) : (
        <div className="text-center text-slate-500">
           {!profile ? (
                <>
                 <h3 className="text-2xl font-bold text-slate-300">Bem-vindo!</h3>
                 <p className="mt-2">Crie ou carregue um perfil para começar a mapear.</p>
                </>
           ) : (
            <label className="cursor-pointer p-8 flex flex-col items-center">
                <UploadCloud size={64} className="mb-4 text-slate-600" />
                <span className="text-xl font-semibold text-slate-400">Carregar Captura de Tela do Jogo</span>
                <p className="text-sm">Clique aqui para selecionar uma imagem</p>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
           )}
        </div>
      )}

      {profile && profile.mappings.map(mapping => (
        <MappingElement
          key={mapping.id}
          mapping={mapping}
          containerRef={ref as React.RefObject<HTMLDivElement>}
          onPositionChange={updateMappingPosition}
          gamepadState={gamepadState}
          previousGamepadState={previousGamepadState}
          onOpenSettings={onOpenSettings}
          onRemove={onRemoveMapping}
          isTestMode={isTestMode}
          isSimulatedPress={simulatedPressId === mapping.id}
        />
      ))}
    </div>
  );
});

export default MappingArea;