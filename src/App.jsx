import React, { useState } from 'react';
import { 
  PanelLeft, 
  Paperclip, 
  SlidersHorizontal, 
  Send, 
  Bookmark, 
  FileText, 
  Plus, 
  X, 
  Quote 
} from 'lucide-react';
import './index.css';

const mockDocuments = [
  { id: 1, title: 'Relatório Anual de Atividades do Centro de Rádio Astronomia e Astrofísica em 1974' },
  { id: 2, title: 'Plano de Consolidação do Centro de Radioastronomia e Astrofísica Mackenzie' },
  { id: 3, title: 'As Fontes Não Convencionais de Energia' },
  { id: 4, title: 'Atividades do Centro de Rádio-Astronimia e Astrofísica em 1972' },
  { id: 5, title: '1º Relatório Bimestral a Visita e Pesquisa no Observatório de Dwingeloo na Holanda' },
];

function App() {
  const [inputValue, setInputValue] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '') {
      setCurrentSearch(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col relative font-sans text-black overflow-hidden">
      
      {/* ÍCONE DE TOGGLE DO SIDEBAR ESQUERDO */}
      <div className="absolute top-6 left-6 z-10">
        <button 
          className="p-2 hover:bg-gray-100 rounded-md transition-colors text-black"
          aria-label="Abrir menu"
        >
          <PanelLeft size={28} strokeWidth={1.5} />
        </button>
      </div>

      {/* ÁREA CENTRAL */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-8 pt-24 pb-4 overflow-y-auto scroll-smooth">
        
        {!currentSearch ? (
          <div className="flex-1 flex flex-col justify-center pb-20">
            <h1 className="text-[2.75rem] leading-tight font-semibold text-black tracking-tight">
              Olá!
            </h1>
            <h2 className="text-[2.75rem] leading-tight font-semibold text-black tracking-tight">
              Como posso te ajudar hoje?
            </h2>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-8 pb-10">
            
            {/* Bolha da Pergunta animada com fade-in */}
            <div className="self-end flex items-center gap-4 max-w-[85%] animate-fade-in-up">
              <button 
                className="text-black hover:text-gray-600 transition-colors flex-shrink-0 mt-1"
                title="Salvar String de Busca"
              >
                <Bookmark size={22} strokeWidth={1.5} />
              </button>

              <div className="bg-gray-100 py-4 px-6 rounded-2xl">
                <p className="text-[1.1rem] text-black font-medium">{currentSearch}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {/* Adicionamos o parâmetro 'index' aqui no map para fazer a cascata */}
              {mockDocuments.map((doc, index) => (
                <div 
                  key={doc.id} 
                  style={{ animationDelay: `${index * 100}ms` }} // Efeito cascata (100ms de diferença entre cada)
                  className="animate-fade-in-up border border-gray-300 rounded-xl p-5 flex items-center justify-between hover:border-gray-500 hover:shadow-sm transition-all bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 border border-gray-200 rounded-lg">
                      <FileText size={24} strokeWidth={1.5} className="text-gray-700" />
                    </div>
                    <span className="text-[1.05rem] font-medium text-black">
                      {doc.title}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 ml-4">
                    <button 
                      onClick={() => setSelectedDoc(doc)}
                      className="text-gray-500 hover:text-black transition-colors" 
                      title="Ver Detalhes"
                    >
                      <Plus size={24} strokeWidth={1.5} />
                    </button>
                    <button className="text-gray-500 hover:text-black transition-colors" title="Favoritar Arquivo">
                      <Bookmark size={24} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>

      {/* CAIXA DE INPUT INFERIOR */}
      <div className="w-full max-w-4xl mx-auto px-8 pb-10 bg-white z-10">
        <form 
          onSubmit={handleSearch}
          className="border border-gray-400 rounded-3xl p-5 flex flex-col gap-4 shadow-sm bg-white"
        >
          <div className="flex items-center justify-between gap-4">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Faça sua busca no nosso acervo" 
              className="flex-1 outline-none text-[1.1rem] bg-transparent placeholder-black"
            />
            <button 
              type="submit"
              disabled={!inputValue.trim()}
              className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
              aria-label="Enviar busca"
            >
              <Send size={20} strokeWidth={1.5} className="mr-[2px] mt-[2px]" />
            </button>
          </div>

          <div className="flex items-center gap-6 mt-1 ml-1">
            <button type="button" className="text-black hover:text-gray-600 transition-colors">
              <Paperclip size={22} strokeWidth={1.75} />
            </button>
            <button type="button" className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors font-medium text-[1rem]">
              <SlidersHorizontal size={22} strokeWidth={1.75} />
              Preferências
            </button>
          </div>
        </form>
      </div>

      {/* PAINEL LATERAL DIREITO - DETALHES DO DOCUMENTO */}
      {selectedDoc && (
        <>
          {/* Fundo escuro com animação suave de fade */}
          <div 
            className="absolute inset-0 bg-black/20 z-40 animate-fade-in" 
            onClick={() => setSelectedDoc(null)}
          ></div>

          {/* Barra lateral deslizando da direita */}
          <aside className="absolute top-0 right-0 h-full w-[40%] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-50 animate-slide-in-right">
            
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-black">Detalhes do Arquivo</h3>
              <button 
                onClick={() => setSelectedDoc(null)} 
                className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black rounded-md transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-start gap-4 mb-8">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex-shrink-0">
                  <FileText size={28} strokeWidth={1.5} className="text-gray-700" />
                </div>
                <h4 className="text-xl font-medium text-black leading-tight pt-1">
                  {selectedDoc.title}
                </h4>
              </div>

              <div className="space-y-6">
                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Breve Descrição</h5>
                  <p className="text-gray-700 text-[0.95rem] leading-relaxed">
                    Este é um resumo gerado dinamicamente para o documento. 
                    Quando a integração com o motor de busca semântica estiver pronta, 
                    este espaço exibirá o contexto do porquê este arquivo foi retornado para a sua pesquisa.
                  </p>
                </div>

                <div>
                  <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Metadados</h5>
                  <ul className="text-[0.95rem] text-gray-700 space-y-3">
                    <li className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">Gênero</span>
                      <span className="font-medium text-black">Relatório Técnico</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">Ano</span>
                      <span className="font-medium text-black">1974</span>
                    </li>
                    <li className="flex justify-between border-b border-gray-50 pb-2">
                      <span className="text-gray-500">Acervo</span>
                      <span className="font-medium text-black">CHCM</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button className="w-full bg-white border border-gray-300 hover:border-gray-800 text-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors shadow-sm">
                <Quote size={18} strokeWidth={1.5} />
                Obter Citação (ABNT)
              </button>
            </div>

          </aside>
        </>
      )}

    </div>
  );
}

export default App;