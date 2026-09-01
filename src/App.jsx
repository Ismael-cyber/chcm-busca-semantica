import React, { useState, useRef } from 'react';
import { 
  PanelLeft, 
  Paperclip, 
  SlidersHorizontal, 
  Send, 
  Bookmark, 
  FileText, 
  Plus, 
  X, 
  Quote,
  ImagePlus,
  ListFilter,
  Scan,
  Layers,
  LineChart,
  Image as ImageIcon,
  AudioLines
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
  
  const [activeMenu, setActiveMenu] = useState(null);
  const [activeChips, setActiveChips] = useState([]);
  
  const [limiteDe, setLimiteDe] = useState('');
  const [limiteAte, setLimiteAte] = useState('');

  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '' || attachment) {
      setCurrentSearch(inputValue || 'Busca por anexo');
      setInputValue('');
    }
  };

  // Funções de Preferências
  const applyLimite = (e) => {
    e.preventDefault();
    if(limiteDe && limiteAte) {
      const newChip = { id: 'limite', label: `De: ${limiteDe} a ${limiteAte} documentos` };
      setActiveChips(prev => [...prev.filter(c => c.id !== 'limite'), newChip]);
    }
    setActiveMenu(null);
  };

  const applyGenero = (label) => {
    const newChip = { id: 'genero', label: `Gênero: ${label}` };
    setActiveChips(prev => [...prev.filter(c => c.id !== 'genero'), newChip]);
    setActiveMenu(null);
  };

  // === NOVA FUNÇÃO: REMOVER FILTRO ===
  const removeChip = (idToRemove) => {
    setActiveChips(prev => prev.filter(chip => chip.id !== idToRemove));
  };

  // Funções do Anexo
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachment({ file, url, type: file.type, name: file.name });
      setActiveMenu(null);
    }
  };

  const removeAttachment = () => {
    if (attachment?.url) {
      URL.revokeObjectURL(attachment.url);
    }
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="h-screen w-full bg-white flex flex-col relative font-sans text-black overflow-hidden">
      
      {activeMenu && (
        <div className="absolute inset-0 z-20" onClick={() => setActiveMenu(null)}></div>
      )}

      <div className="absolute top-6 left-6 z-10">
        <button className="p-2 hover:bg-gray-100 rounded-md transition-colors text-black">
          <PanelLeft size={24} strokeWidth={1.5} />
        </button>
      </div>

      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-8 pt-24 pb-4 overflow-y-auto scroll-smooth">
        {!currentSearch ? (
          <div className="flex-1 flex flex-col justify-center pb-20">
            <h1 className="text-[2.65rem] leading-tight font-semibold text-black tracking-tight">Olá!</h1>
            <h2 className="text-[2.65rem] leading-tight font-semibold text-black tracking-tight">Como posso te ajudar hoje?</h2>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-8 pb-10">
            <div className="self-end flex items-center gap-4 max-w-[85%] animate-fade-in-up">
              <button className="text-black hover:text-gray-600 transition-colors flex-shrink-0 mt-1">
                <Bookmark size={22} strokeWidth={1.5} />
              </button>
              <div className="bg-gray-100 py-4 px-6 rounded-2xl">
                <p className="text-[1.1rem] text-black font-medium">{currentSearch}</p>
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full">
              {mockDocuments.map((doc, index) => (
                <div key={doc.id} style={{ animationDelay: `${index * 100}ms` }} className="animate-fade-in-up border border-gray-300 rounded-xl p-5 flex items-center justify-between hover:border-gray-500 hover:shadow-sm transition-all bg-white">
                  <div className="flex items-center gap-4">
                    <div className="p-2 border border-gray-200 rounded-lg">
                      <FileText size={24} strokeWidth={1.5} className="text-gray-700" />
                    </div>
                    <span className="text-[1.05rem] font-medium text-black">{doc.title}</span>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <button onClick={() => setSelectedDoc(doc)} className="text-gray-500 hover:text-black transition-colors"><Plus size={24} strokeWidth={1.5} /></button>
                    <button className="text-gray-500 hover:text-black transition-colors"><Bookmark size={24} strokeWidth={1.5} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CAIXA DE INPUT INFERIOR */}
      <div className="w-full max-w-4xl mx-auto px-8 pb-10 bg-white z-30 relative">
        <form onSubmit={handleSearch} className="border border-gray-400 rounded-3xl p-4 flex flex-col gap-3 shadow-sm bg-white relative">
          
          {attachment && (
            <div className="flex animate-scale-in ml-1 mt-1">
              <div className="relative border border-gray-300 rounded-xl p-1 bg-gray-50 flex items-center justify-center min-w-[4rem] h-[4rem] shadow-sm">
                {attachment.type.startsWith('image/') ? (
                  <img src={attachment.url} alt="Preview" className="h-full w-full object-cover rounded-lg" />
                ) : (
                  <div className="flex flex-col items-center justify-center w-16 px-1">
                    <FileText size={20} strokeWidth={1.5} className="text-red-600 mb-1" />
                    <span className="text-[0.6rem] font-bold text-gray-700 truncate w-full text-center">PDF</span>
                  </div>
                )}
                <button 
                  type="button"
                  onClick={removeAttachment}
                  className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-400 hover:bg-gray-200 transition-colors shadow-sm h-5 w-5 flex items-center justify-center"
                >
                  <X size={12} strokeWidth={2} className="text-black" />
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-4 pl-2">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
              placeholder="Faça sua busca no nosso acervo" 
              className="flex-1 outline-none text-[1.1rem] bg-transparent placeholder-black"
            />
            <button 
              onClick={handleSearch}
              disabled={!inputValue.trim() && !attachment}
              className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              <Send size={20} strokeWidth={1.5} className="mr-[2px] mt-[2px]" />
            </button>
          </div>

          <div className="flex items-center gap-4 pl-2 relative flex-wrap">
            <div className="relative flex-shrink-0">
              <button type="button" onClick={() => setActiveMenu(activeMenu === 'attach' ? null : 'attach')} className="text-black hover:text-gray-600 transition-colors mt-1">
                <Paperclip size={22} strokeWidth={1.75} />
              </button>
              
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,application/pdf" />
              
              {activeMenu === 'attach' && (
                <div className="absolute bottom-full left-0 mb-4 w-64 bg-white border border-gray-300 rounded-xl shadow-lg animate-scale-in flex flex-col overflow-hidden">
                  <button type="button" onClick={() => { fileInputRef.current.click(); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-black text-sm font-medium transition-colors">
                    <ImagePlus size={18} strokeWidth={2} />
                    Adicionar fotos ou arquivos
                  </button>
                </div>
              )}
            </div>
            
            <div className="relative flex-shrink-0">
              <button type="button" onClick={() => setActiveMenu(activeMenu === 'prefs' ? null : 'prefs')} className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors font-medium text-[1rem] mt-1">
                <SlidersHorizontal size={22} strokeWidth={1.75} />
                Preferências
              </button>

              {activeMenu === 'prefs' && (
                <div className="absolute bottom-full left-0 mb-4 w-56 bg-white border border-gray-300 rounded-xl shadow-lg animate-scale-in flex flex-col py-2">
                  <button type="button" onClick={() => setActiveMenu('limite')} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-black text-sm transition-colors text-left"><ListFilter size={18} strokeWidth={1.5} /> Limite de Saída</button>
                  <button type="button" className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-black text-sm transition-colors text-left"><Scan size={18} strokeWidth={1.5} /> Tipo do Documento</button>
                  <button type="button" onClick={() => setActiveMenu('genero')} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-black text-sm transition-colors text-left"><Layers size={18} strokeWidth={1.5} /> Gênero Documental</button>
                </div>
              )}

              {activeMenu === 'limite' && (
                <div className="absolute bottom-full left-0 mb-4 w-56 bg-white border border-gray-300 rounded-xl shadow-lg animate-scale-in flex flex-col p-4">
                  <div className="flex items-center gap-2 text-black text-sm font-medium mb-4"><ListFilter size={16} strokeWidth={2} /> Limite de Saída</div>
                  <div className="flex items-center justify-between mb-3 text-sm"><span className="text-gray-700">De:</span><input type="text" value={limiteDe} onChange={(e) => setLimiteDe(e.target.value)} className="border border-gray-400 rounded-md px-2 py-1 w-20 outline-none text-center focus:border-black"/></div>
                  <div className="flex items-center justify-between mb-4 text-sm"><span className="text-gray-700">Até:</span><input type="text" value={limiteAte} onChange={(e) => setLimiteAte(e.target.value)} className="border border-gray-400 rounded-md px-2 py-1 w-20 outline-none text-center focus:border-black"/></div>
                  <div className="flex justify-end"><button type="button" onClick={applyLimite} className="bg-black text-white px-5 py-1.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">Aplicar</button></div>
                </div>
              )}

              {activeMenu === 'genero' && (
                <div className="absolute bottom-full left-0 mb-4 w-48 bg-white border border-gray-300 rounded-xl shadow-lg animate-scale-in flex flex-col py-2">
                  <div className="flex items-center gap-2 px-4 py-2 text-black text-sm font-medium border-b border-gray-100 mb-1"><Layers size={16} strokeWidth={2} /> Gênero Documental</div>
                  <button type="button" onClick={() => applyGenero('Gráfico Textual')} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-black text-sm transition-colors text-left"><LineChart size={18} strokeWidth={1.5} /> Gráfico Textual</button>
                  <button type="button" onClick={() => applyGenero('Iconográfico')} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-black text-sm transition-colors text-left"><ImageIcon size={18} strokeWidth={1.5} /> Iconográfico</button>
                  <button type="button" onClick={() => applyGenero('Audiovisual')} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-black text-sm transition-colors text-left"><AudioLines size={18} strokeWidth={1.5} /> Audiovisual</button>
                </div>
              )}
            </div>

            {/* === RENDERIZAÇÃO DOS CHIPS COM BOTÃO DE REMOVER === */}
            {activeChips.map(chip => (
              <div key={chip.id} className="relative border border-gray-400 text-black text-[0.9rem] font-medium rounded-md px-3 py-1 bg-white animate-scale-in flex items-center ml-2">
                {chip.label}
                <button 
                  type="button"
                  onClick={() => removeChip(chip.id)}
                  className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-400 hover:bg-gray-200 transition-colors shadow-sm h-5 w-5 flex items-center justify-center"
                  aria-label="Remover filtro"
                >
                  <X size={12} strokeWidth={2} className="text-black" />
                </button>
              </div>
            ))}

          </div>
        </form>
      </div>

      {selectedDoc && (
        <>
          <div className="absolute inset-0 bg-black/20 z-40 animate-fade-in" onClick={() => setSelectedDoc(null)}></div>
          <aside className="absolute top-0 right-0 h-full w-[400px] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-50 animate-slide-in-right">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-black">Detalhes do Arquivo</h3>
              <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black rounded-md transition-colors"><X size={20} strokeWidth={1.5} /></button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex items-start gap-4 mb-8">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex-shrink-0"><FileText size={28} strokeWidth={1.5} className="text-gray-700" /></div>
                <h4 className="text-xl font-medium text-black leading-tight pt-1">{selectedDoc.title}</h4>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 bg-gray-50">
              <button className="w-full bg-white border border-gray-300 hover:border-gray-800 text-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors shadow-sm">
                <Quote size={18} strokeWidth={1.5} /> Obter Citação (ABNT)
              </button>
            </div>
          </aside>
        </>
      )}

    </div>
  );
}

export default App;