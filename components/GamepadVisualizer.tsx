
import React from 'react';
import type { GamepadState } from '../types';

const AXES_ORDER = ['LS_X', 'LS_Y', 'RS_X', 'RS_Y', 'LT', 'RT'];
const BUTTONS_ORDER = [
    'A', 'B', 'X', 'Y', 'LB', 'RB', 'LSB', 'RSB',
    'UP', 'DOWN', 'LEFT', 'RIGHT', 'START', 'BACK'
];

const AxisVisualizer: React.FC<{ label: string; value: number }> = ({ label, value = 0 }) => {
    const isTrigger = label === 'LT' || label === 'RT';
    const percentage = isTrigger ? value * 100 : (value + 1) * 50;

    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="w-10 font-mono text-slate-300">{label}</span>
            <div className="flex-1 bg-slate-700 rounded-full h-4 overflow-hidden relative">
                <div 
                    className="absolute top-0 h-full bg-cyan-500 transition-all duration-50"
                    style={{ 
                        left: isTrigger ? '0%' : (percentage < 50 ? `${percentage}%` : '50%'),
                        width: isTrigger ? `${percentage}%` : `${Math.abs(percentage - 50)}%`,
                    }}
                ></div>
                {!isTrigger && <div className="absolute top-0 left-1/2 w-px h-full bg-slate-500"></div>}
            </div>
            <span className="w-12 text-right font-mono text-cyan-300">{value.toFixed(3)}</span>
        </div>
    );
};

const ButtonVisualizer: React.FC<{ label: string, isPressed: boolean }> = ({ label, isPressed }) => {
    return (
        <div className="flex items-center gap-2 text-sm">
            <div className={`w-3 h-3 rounded-full transition-colors ${isPressed ? 'bg-cyan-400' : 'bg-slate-600'}`}></div>
            <span className={`transition-colors ${isPressed ? 'text-cyan-300' : 'text-slate-400'}`}>{label}</span>
        </div>
    )
}

const GamepadVisualizer: React.FC<{ gamepadState: GamepadState }> = ({ gamepadState }) => {
  const { buttons, axes, isConnected } = gamepadState;

  return (
    <aside className="bg-slate-800/50 backdrop-blur-sm p-4 rounded-lg border border-slate-700 hidden xl:block xl:w-96 relative">
        <h2 className="text-lg font-bold mb-4 text-cyan-400 border-b border-slate-600 pb-2">Entradas ao Vivo</h2>
        
        <div className={`transition-opacity duration-300 space-y-4 ${isConnected ? 'opacity-100' : 'opacity-40'}`}>
            <div>
                <h3 className="text-md font-semibold text-slate-300 mb-2">Eixos</h3>
                <div className="space-y-2">
                    {AXES_ORDER.map(axis => (
                        <AxisVisualizer key={axis} label={axis} value={axes[axis] ?? 0} />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-md font-semibold text-slate-300 mb-2 mt-4">Botões</h3>
                <div className="grid grid-cols-3 gap-x-2 gap-y-2">
                    {BUTTONS_ORDER.map(btn => (
                        <ButtonVisualizer key={btn} label={btn} isPressed={buttons[btn] ?? false} />
                    ))}
                </div>
            </div>
        </div>

        {!isConnected && 
            <div className="absolute inset-0 flex justify-center items-center text-slate-400 font-semibold text-lg bg-slate-800/80 rounded-lg backdrop-blur-sm">
                Conecte um gamepad para ver as entradas ao vivo
            </div>
        }
    </aside>
  );
};

export default GamepadVisualizer;
