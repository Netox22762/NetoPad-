
import React, { useState, useEffect } from 'react';
import type { Mapping, GamepadState, ButtonMapping, StickMapping, DpadMapping, TriggerMapping, BumperMapping, ComboMapping } from '../types';
import { Settings, Trash2 } from 'lucide-react';

interface MappingElementProps {
  mapping: Mapping;
  containerRef: React.RefObject<HTMLDivElement>;
  onPositionChange: (id: number, x: number, y: number) => void;
  gamepadState: GamepadState;
  previousGamepadState: GamepadState | undefined;
  onOpenSettings: (mapping: Mapping) => void;
  onRemove: (id: number) => void;
  isTestMode: boolean;
  isSimulatedPress?: boolean;
}

const getIsActive = (mapping: Mapping, gamepadState: GamepadState, previousGamepadState?: GamepadState): boolean => {
    switch (mapping.type) {
        case 'button':
            return gamepadState.buttons[(mapping as ButtonMapping).key] || false;
        case 'bumper':
            return gamepadState.buttons[(mapping as BumperMapping).key] || false;
        case 'stick':
            const stickKey = (mapping as StickMapping).key;
            return Math.abs(gamepadState.axes[`${stickKey}_X`]) > 0.5 || Math.abs(gamepadState.axes[`${stickKey}_Y`]) > 0.5;
        case 'dpad':
             return gamepadState.buttons['UP'] || gamepadState.buttons['DOWN'] || gamepadState.buttons['LEFT'] || gamepadState.buttons['RIGHT'];
        case 'trigger':
            const triggerKey = (mapping as TriggerMapping).key;
            return gamepadState.axes[triggerKey] > 0.5;
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

const MappingElement: React.FC<MappingElementProps> = ({ mapping, containerRef, onPositionChange, gamepadState, previousGamepadState, onOpenSettings, onRemove, isTestMode, isSimulatedPress }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const isActive = getIsActive(mapping, gamepadState, previousGamepadState);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isTestMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(mapping.id);
  };

  const handleSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onOpenSettings(mapping);
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onPositionChange(mapping.id, x, y);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, containerRef, mapping.id, onPositionChange]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${mapping.x}px`,
    top: `${mapping.y}px`,
    transform: 'translate(-50%, -50%)',
    touchAction: 'none',
  };

  const baseClasses = 'flex items-center justify-center rounded-full font-bold text-white transition-all duration-100 select-none text-xs sm:text-base relative';
  const sizeClasses = mapping.type === 'stick' ? 'w-24 h-24' : mapping.type === 'dpad' ? 'w-20 h-20 rounded-md' : mapping.type === 'combo' ? 'w-16 h-16' : 'w-12 h-12';

  const baseStyles = {
    button: 'bg-blue-500/80',
    stick: 'bg-green-500/80',
    dpad: 'bg-yellow-500/80',
    trigger: 'bg-red-500/80',
    bumper: 'bg-purple-500/80',
    combo: 'bg-orange-500/80',
  };

  const activeStyles = {
    button: 'bg-blue-400 scale-110 shadow-lg shadow-blue-400/50',
    stick: 'bg-green-400 scale-110 shadow-lg shadow-green-400/50',
    dpad: 'bg-yellow-400 scale-110 shadow-lg shadow-yellow-400/50',
    trigger: 'bg-red-400 scale-110 shadow-lg shadow-red-400/50',
    bumper: 'bg-purple-400 scale-110 shadow-lg shadow-purple-400/50',
    combo: 'bg-orange-400 scale-110 shadow-lg shadow-orange-400/50',
  };

  const dynamicClasses = isActive
    ? activeStyles[mapping.type] || 'bg-slate-400 scale-110 shadow-lg shadow-slate-400/50'
    : baseStyles[mapping.type] || 'bg-slate-500/80';
    
  const cursorClass = isTestMode ? 'cursor-default' : (isDragging ? 'cursor-grabbing' : 'cursor-grab');

  const simulationClass = isSimulatedPress ? (mapping.type === 'dpad' ? 'simulate-press dpad-simulate-press' : 'simulate-press') : '';

  const controls = (
     <div className="absolute -top-3 -right-3 flex gap-1 z-10">
        <button onClick={handleSettings} className="bg-slate-600 hover:bg-slate-500 text-white rounded-full p-1.5 transform hover:scale-110 transition-transform">
           <Settings size={14}/>
        </button>
         <button onClick={handleRemove} className="bg-red-600 hover:bg-red-500 text-white rounded-full p-1.5 transform hover:scale-110 transition-transform">
           <Trash2 size={14}/>
        </button>
     </div>
  );

  return (
    <div 
        style={style} 
        className={`${baseClasses} ${sizeClasses} ${dynamicClasses} ${cursorClass} ${simulationClass}`}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
    >
      {mapping.label}
      {showControls && !isDragging && !isTestMode && controls}
    </div>
  );
};

export default MappingElement;
