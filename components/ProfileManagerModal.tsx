
import React from 'react';
import { X, Trash2, FolderUp } from 'lucide-react';

interface ProfileManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: string[];
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
}

const ProfileManagerModal: React.FC<ProfileManagerModalProps> = ({ isOpen, onClose, profiles, onLoad, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-md p-6 m-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-400">Gerenciar Perfis</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={28} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
          {profiles.length > 0 ? (
            profiles.map((name) => (
              <div key={name} className="flex justify-between items-center bg-slate-700 p-3 rounded-lg">
                <span className="font-semibold text-slate-100">{name}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => onLoad(name)} title="Carregar Perfil" className="p-2 text-green-400 hover:bg-slate-600 rounded-full transition-colors">
                    <FolderUp size={20} />
                  </button>
                  <button onClick={() => onDelete(name)} title="Deletar Perfil" className="p-2 text-red-400 hover:bg-slate-600 rounded-full transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-8">Nenhum perfil salvo encontrado.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileManagerModal;
