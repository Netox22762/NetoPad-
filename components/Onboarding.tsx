
import React from 'react';
import { Gamepad2, Sparkles } from 'lucide-react';

interface OnboardingProps {
    onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  return (
    <div className="fixed inset-0 bg-slate-900 flex justify-center items-center z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-w-2xl w-full p-8 m-4 text-center transform transition-all animate-fade-in-up">
            <Gamepad2 size={64} className="mx-auto text-cyan-400 mb-4" />
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Mapeador Pro de Gamepad!</h1>
            <p className="text-slate-300 text-lg mb-6">
                A ferramenta definitiva para criar layouts de controle personalizados, agora com o poder da IA.
            </p>
            <div className="text-left space-y-4 mb-8 text-slate-300">
                <p>1. <b className="text-cyan-400">Crie um Perfil:</b> Clique no botão 'Novo' para iniciar um novo perfil de jogo.</p>
                <p>2. <b className="text-cyan-400">Carregue uma Captura de Tela:</b> Carregue uma captura de tela do seu jogo para uma referência visual.</p>
                <p>3. <b className="text-cyan-400">Arraste e Solte:</b> Arraste componentes da barra de ferramentas esquerda para sua captura de tela para mapear manualmente.</p>
                <p>4. <b className="text-purple-400">Mapeamento com IA <Sparkles className="inline-block h-4 w-4" />:</b> Ou simplesmente clique em 'Mapeamento IA' para que o Gemini analise a imagem e posicione os controles para você!</p>
                <p>5. <b className="text-cyan-400">Teste e Salve:</b> Use o 'Modo Teste' para verificar seus controles e veja o painel 'Entradas ao Vivo' para confirmar se o gamepad está funcionando. Depois, salve seu perfil.</p>
            </div>
            <button
                onClick={onComplete}
                className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105"
            >
                Vamos Começar
            </button>
        </div>
    </div>
  );
};

export default Onboarding;
