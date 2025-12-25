
import React, { useState, useEffect } from 'react';
import type { Mapping, MappingType, ComboMapping } from '../types';
import { X, Save } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mapping: Mapping;
  onSave: (mapping: Mapping) => void;
}

const BUTTON_OPTIONS = ['A', 'B', 'X', 'Y', 'START', 'BACK', 'LSB', 'RSB'];
const BUMPER_OPTIONS = ['LB', 'RB'];
const STICK_OPTIONS = ['LS', 'RS'];
const DPAD_OPTIONS = ['DPAD'];
const TRIGGER_OPTIONS = ['LT', 'RT'];
const COMBO_MODIFIER_OPTIONS = [...BUMPER_OPTIONS, ...TRIGGER_OPTIONS];
const COMBO_ACTION_OPTIONS = [...BUTTON_OPTIONS];

const typeTranslations: { [key in MappingType]: string } = {
    button: 'Botão',
    bumper: 'Bumper',
    stick: 'Analógico',
    dpad: 'D-Pad',
    trigger: 'Gatilho',
    combo: 'Combo'
};

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, mapping, onSave }) => {
  const [currentMapping, setCurrentMapping] = useState(mapping);

  useEffect(() => {
    setCurrentMapping(mapping);
  }, [mapping]);
  
  if (!isOpen) return null;
  
  const handleKeyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newKey = e.target.value;
    setCurrentMapping({ ...currentMapping, key: newKey, label: newKey } as Mapping);
  };
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMapping({ ...currentMapping, label: e.target.value });
  };
  
  const handleComboChange = (part: 'modifierKey' | 'actionKey', value: string) => {
    const updatedCombo = { ...currentMapping as ComboMapping, [part]: value };
    updatedCombo.label = `${updatedCombo.modifierKey} + ${updatedCombo.actionKey}`;
    setCurrentMapping(updatedCombo);
  };

  const handleSave = () => {
    onSave(currentMapping);
  };

  const renderKeySelector = () => {
    let options: string[] = [];
    let currentKey = '';

    switch(currentMapping.type) {
        case 'button':
            options = BUTTON_OPTIONS;
            currentKey = currentMapping.key;
            break;
        case 'bumper':
            options = BUMPER_OPTIONS;
            currentKey = currentMapping.key;
            break;
        case 'stick':
            options = STICK_OPTIONS;
            currentKey = currentMapping.key;
            break;
        case 'dpad':
            options = DPAD_OPTIONS;
            currentKey = currentMapping.key;
            break;
        case 'trigger':
            options = TRIGGER_OPTIONS;
            currentKey = currentMapping.key;
            break;
        default:
            return null;
    }

    return (
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Mapeado Para</label>
            <select value={currentKey} onChange={handleKeyChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
  };

  const renderComboSelector = () => {
    if (currentMapping.type !== 'combo') return null;
    const comboMap = currentMapping as ComboMapping;
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tecla Modificadora (Segurar)</label>
                <select value={comboMap.modifierKey} onChange={(e) => handleComboChange('modifierKey', e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                    {COMBO_MODIFIER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tecla de Ação (Pressionar)</label>
                <select value={comboMap.actionKey} onChange={(e) => handleComboChange('actionKey', e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                    {COMBO_ACTION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            </div>
        </>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">Configurações de {typeTranslations[mapping.type]}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>
        
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rótulo de Exibição</label>
                <input type="text" value={currentMapping.label} onChange={handleLabelChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white" />
            </div>
            {renderKeySelector()}
            {renderComboSelector()}
        </div>

        <div className="mt-8 flex justify-end">
            <button onClick={handleSave} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200">
                <Save size={20} />
                Salvar Alterações
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
