
import React from 'react';
import type { MappingType } from '../types';
import { Circle, Square, ChevronsLeftRight, Gamepad, Minus, Layers } from 'lucide-react';

const ToolbarButton: React.FC<{ type: MappingType; label: string; icon: React.ReactNode; }> = ({ type, label, icon }) => {
  const onDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex flex-col items-center p-3 bg-slate-700 hover:bg-cyan-500/50 border border-slate-600 rounded-lg cursor-grab active:cursor-grabbing transition-all duration-200 transform hover:-translate-y-1"
      title={`Arraste para adicionar um(a) ${label}`}
    >
      {icon}
      <span className="text-xs font-semibold mt-1">{label}</span>
    </div>
  );
};

const Toolbar: React.FC = () => {
  return (
    <aside className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 lg:w-48">
      <h2 className="text-lg font-bold mb-4 text-cyan-400 border-b border-slate-600 pb-2">Componentes</h2>
      <div className="grid grid-cols-3 lg:grid-cols-2 gap-3">
        <ToolbarButton type="button" label="Botão" icon={<Circle size={28} className="text-blue-400"/>} />
        <ToolbarButton type="bumper" label="Bumper" icon={<Minus size={28} className="text-purple-400" strokeWidth={4}/>} />
        <ToolbarButton type="trigger" label="Gatilho" icon={<ChevronsLeftRight size={28} className="text-red-400"/>} />
        <ToolbarButton type="stick" label="Analógico" icon={<Gamepad size={28} className="text-green-400"/>} />
        <ToolbarButton type="dpad" label="D-Pad" icon={<Square size={28} className="text-yellow-400"/>} />
        <ToolbarButton type="combo" label="Combo" icon={<Layers size={28} className="text-orange-400"/>} />
      </div>
    </aside>
  );
};

export default Toolbar;
