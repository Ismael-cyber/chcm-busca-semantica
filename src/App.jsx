import React, { useState, useRef, useEffect } from 'react';
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
  AudioLines,
  Type, 
  Archive, 
  Landmark,
  Trash2,
  ChevronDown,
  ChevronRight,
  Star,
  Loader2
} from 'lucide-react';
import './index.css';

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

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isStringsOpen, setIsStringsOpen] = useState(true);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(true);
  const [hoveredRating, setHoveredRating] = useState(0);
  
  // === ESTADOS DA API ===
  const [interactions, setInteractions] = useState([]);
  const messagesEndRef = useRef(null);
  const prevInteractionsLength = useRef(0); // Memória para saber se a conversa cresceu
  
  // === LOCAL STORAGE ===
  const [chatSessions, setChatSessions] = useState(() => {
    const saved = localStorage.getItem('chcm_chatSessions');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);

  const [savedStrings, setSavedStrings] = useState(() => {
    const saved = localStorage.getItem('chcm_savedStrings');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [favoriteDocs, setFavoriteDocs] = useState(() => {
    const saved = localStorage.getItem('chcm_favoriteDocs');
    return saved ? JSON.parse(saved) : [];
  });
  
  
  const [docRatings, setDocRatings] = useState(() => {
    const saved = localStorage.getItem('chcm_docRatings');
    return saved ? JSON.parse(saved) : {};
  });
  
  useEffect(() => localStorage.setItem('chcm_savedStrings', JSON.stringify(savedStrings)), [savedStrings]);
  useEffect(() => localStorage.setItem('chcm_favoriteDocs', JSON.stringify(favoriteDocs)), [favoriteDocs]);
  useEffect(() => localStorage.setItem('chcm_chatSessions', JSON.stringify(chatSessions)), [chatSessions]);
  useEffect(() => localStorage.setItem('chcm_docRatings', JSON.stringify(docRatings)), [docRatings]);

  // Scroll inteligente
  useEffect(() => {
    // Só desce a tela automaticamente se uma NOVA pergunta foi enviada ao chat
    if (interactions.length > prevInteractionsLength.current) {
      // Pequeno timeout para garantir que a interface já renderizou o balão de carregamento
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
    prevInteractionsLength.current = interactions.length;
  }, [interactions]);

  // === FUNÇÃO BUSCA NA API ===
  const performSearch = async (query) => {
    if (!query) return;

    const interactionId = Date.now(); 
    
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = Date.now();
      setCurrentSessionId(activeSessionId);
      setChatSessions(prev => [{ id: activeSessionId, title: query, interactions: [] }, ...prev].slice(0, 15));
    }

    setInteractions(prevInteractions => {
      const newInteractions = [...prevInteractions, { id: interactionId, query: query, results: [], isLoading: true, error: null }];
      setChatSessions(prevSessions => prevSessions.map(s => s.id === activeSessionId ? { ...s, interactions: newInteractions } : s));
      return newInteractions;
    });
    
    setCurrentSearch(query);
    setInputValue('');
    if (attachment) removeAttachment();

    try {
      const API_BASE_URL = 'http://100.67.87.47:8000'; 
      const n = limiteAte ? parseInt(limiteAte) : 10;
      const url = `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&n=${n}`;

      const response = await fetch(url);
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Erro no servidor (Status: ${response.status})`);
      }

      const data = await response.json();
      const resultsArray = Array.isArray(data) ? data : (data.results || data.data || data.items || []);
      
      setInteractions(prevInteractions => {
        const newInteractions = prevInteractions.map(interaction => 
          interaction.id === interactionId ? { ...interaction, results: resultsArray, isLoading: false } : interaction
        );
        setChatSessions(prevSessions => prevSessions.map(s => s.id === activeSessionId ? { ...s, interactions: newInteractions } : s));
        return newInteractions;
      });

    } catch (err) {
      console.error("Erro na requisição:", err);
      let errorMessage = err.message === 'Failed to fetch' 
        ? "Não foi possível conectar à API. Verifique se o backend está rodando e o CORS liberado." 
        : `Erro: ${err.message}`;
      
      setInteractions(prevInteractions => {
        const newInteractions = prevInteractions.map(interaction => 
          interaction.id === interactionId ? { ...interaction, error: errorMessage, isLoading: false } : interaction
        );
        setChatSessions(prevSessions => prevSessions.map(s => s.id === activeSessionId ? { ...s, interactions: newInteractions } : s));
        return newInteractions;
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (inputValue.trim() !== '' || attachment) {
      const query = inputValue.trim() || 'Busca por anexo';
      performSearch(query);
    }
  };

  const handleRestoreSearch = (query) => performSearch(query);

  // Função para restaurar um Chat inteiro pelo Histórico Lateral
  const handleRestoreSession = (sessionId) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(session.id);
      setInteractions(session.interactions);
    }
  };

  const handleNovaBusca = () => {
    setInteractions([]); 
    setCurrentSessionId(null);
    setCurrentSearch('');
    setInputValue('');
    setActiveChips([]);
    removeAttachment();
  };

  const handleSaveString = (queryToSave = currentSearch) => {
    if (queryToSave && !savedStrings.includes(queryToSave)) {
      setSavedStrings(prev => [...prev, queryToSave]);
      setIsStringsOpen(true);
    }
  };

  const handleSaveDoc = (doc) => {
    if (favoriteDocs.some(d => d.id === doc.id)) {
      setFavoriteDocs(prev => prev.filter(d => d.id !== doc.id));
    } else {
      setFavoriteDocs(prev => [...prev, doc]);
      setIsFavoritesOpen(true);
    }
  };

  const handleRateDoc = (docId, rating) => setDocRatings(prev => ({ ...prev, [docId]: rating }));
  const isDocFavorited = (docId) => favoriteDocs.some(d => d.id === docId);
  const isStringSaved = savedStrings.includes(currentSearch);

  const applyLimite = (e) => {
    e.preventDefault();
    if(limiteDe && limiteAte) {
      const newChip = { id: 'limite', label: `De: ${limiteDe} a ${limiteAte} doc(s)` };
      setActiveChips(prev => [...prev.filter(c => c.id !== 'limite'), newChip]);
    }
    setActiveMenu(null);
  };

  const applyGenero = (label) => {
    const newChip = { id: 'genero', label: `Gênero: ${label}` };
    setActiveChips(prev => [...prev.filter(c => c.id !== 'genero'), newChip]);
    setActiveMenu(null);
  };

  const removeChip = (idToRemove) => setActiveChips(prev => prev.filter(chip => chip.id !== idToRemove));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAttachment({ file, url, type: file.type, name: file.name });
      setActiveMenu(null);
    }
  };

  const removeAttachment = () => {
    if (attachment?.url) URL.revokeObjectURL(attachment.url);
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Helper seguro para ler propriedades dinâmicas do objeto do backend
  // Helper inteligente para extrair o título do documento com base no Spectrum
  const getDocTitle = (doc) => {
    return doc?.metadata?.['Nome do Objeto (Object Name)'] || 
           doc?.metadata?.nome_do_objeto || 
           doc?.metadata?.nome || 
           doc?.metadata?.titulo || 
           doc?.metadata?.title || 
           `Documento Tombo #${doc?.id || 'Desconhecido'}`;
  };

  // Helper para buscar chaves do metadata (protege contra chaves nulas ou nomes em formatos diferentes)
  const getMetaValue = (doc, possibleKeys) => {
    if (!doc?.metadata) return 'Não informado';
    for (const key of possibleKeys) {
      if (doc.metadata[key] !== undefined && doc.metadata[key] !== null && doc.metadata[key] !== '') {
        return doc.metadata[key];
      }
    }
    return 'Não informado';
  };

  return (
    <div className="h-screen w-full bg-white flex font-sans text-black overflow-hidden relative">
      
      {/* ================= SIDEBAR ESQUERDA ================= */}
    <aside 
        className={`h-full bg-white flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden z-20 ${
          isSidebarOpen ? 'w-[280px] border-r border-gray-200' : 'w-0 border-r-0'
        }`}
      >
        <div className={`w-[280px] h-full flex flex-col transition-opacity duration-300 ${
          isSidebarOpen ? 'opacity-100 delay-100' : 'opacity-0'
        }`}>
          
          <div className="pt-8 pb-8 px-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tighter">chcm</h1>
              <Landmark size={26} strokeWidth={1.5} className="mt-1 text-black" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-6 pt-2">
            
            <div className="px-6">
              <div className="flex items-center justify-between mb-3 w-full">
                <button onClick={() => setIsStringsOpen(!isStringsOpen)} className="flex items-center gap-2 text-[0.95rem] font-semibold text-black hover:text-gray-600 transition-colors text-left">
                  <Type size={18} strokeWidth={2} /> Strings de Busca Salva
                  {isStringsOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>
                {savedStrings.length > 0 && (
                  <button onClick={() => setSavedStrings([])} className="text-gray-400 hover:text-red-500 transition-colors" title="Limpar Strings"><Trash2 size={14} /></button>
                )}
              </div>
              {isStringsOpen && (
                <ul className="space-y-2 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                  {savedStrings.length === 0 ? <li className="text-xs text-gray-400">Nenhuma string salva</li> : 
                    savedStrings.map((str, i) => (
                      <li key={i} onClick={() => { handleNovaBusca(); performSearch(str); }} className="flex items-center gap-2 text-[0.9rem] text-black cursor-pointer hover:text-gray-500 transition-colors" title={str}>
                        <span className="text-[0.65rem] font-bold text-gray-800 flex-shrink-0">abc</span><span className="truncate">{str}</span>
                      </li>
                    ))
                  }
                </ul>
              )}
            </div>

            <div className="px-6">
              <div className="flex items-center justify-between mb-3 w-full">
                <button onClick={() => setIsFavoritesOpen(!isFavoritesOpen)} className="flex items-center gap-2 text-[0.95rem] font-semibold text-black hover:text-gray-600 transition-colors text-left">
                  <Archive size={18} strokeWidth={2} /> Arquivos Salvos
                  {isFavoritesOpen ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                </button>
                {favoriteDocs.length > 0 && (
                  <button onClick={() => setFavoriteDocs([])} className="text-gray-400 hover:text-red-500 transition-colors" title="Limpar Favoritos"><Trash2 size={14} /></button>
                )}
              </div>
              {isFavoritesOpen && (
                <ul className="space-y-2 animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                  {favoriteDocs.length === 0 ? <li className="text-xs text-gray-400">Nenhum arquivo favorito</li> : 
                    favoriteDocs.map((doc, i) => (
                      <li key={i} onClick={() => setSelectedDoc(doc)} className="flex items-center gap-2 text-[0.9rem] text-black cursor-pointer hover:text-gray-500 transition-colors" title={getDocTitle(doc)}>
                        <Archive size={14} strokeWidth={2} className="text-gray-800 flex-shrink-0" /><span className="truncate">{getDocTitle(doc)}</span>
                      </li>
                    ))
                  }
                </ul>
              )}
            </div>

            <div className="px-6 mt-2">
              <button onClick={handleNovaBusca} className="w-full border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 text-sm font-medium hover:border-black hover:bg-gray-50 transition-colors shadow-sm">
                <Plus size={18} strokeWidth={2} /> Nova Busca
              </button>
            </div>

            <div className="px-6 mt-2 pb-6">
              <div className="flex justify-between items-center mb-3">
                <div className="text-[0.95rem] font-semibold text-black">Histórico de Buscas</div>
                {chatSessions.length > 0 && (
                  <button onClick={() => setChatSessions([])} className="text-gray-400 hover:text-red-500 transition-colors" title="Limpar Histórico"><Trash2 size={14} /></button>
                )}
              </div>
              <ul className="space-y-2">
                {chatSessions.length === 0 ? <li className="text-xs text-gray-400">Nenhum histórico</li> : 
                  chatSessions.map((session) => (
                    <li 
                      key={session.id} 
                      onClick={() => handleRestoreSession(session.id)} 
                      className={`text-[0.9rem] cursor-pointer truncate transition-colors ${currentSessionId === session.id ? 'text-black font-semibold' : 'text-gray-700 hover:text-black'}`} 
                      title={session.title}
                    >
                      {session.title}
                    </li>
                  ))
                }
              </ul>
            </div>

          </div>
        </div>
      </aside>

      {/* ================= ÁREA CENTRAL ================= */}
      <div className="flex-1 flex flex-col relative h-full w-full min-w-0">
        
        <div className="absolute top-6 left-6 z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-md transition-colors text-black bg-white/50 backdrop-blur-sm">
            <PanelLeft size={24} strokeWidth={1.5} />
          </button>
        </div>

        {activeMenu && <div className="absolute inset-0 z-20" onClick={() => setActiveMenu(null)}></div>}

        <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-8 pt-24 pb-4 overflow-y-auto scroll-smooth">
          {interactions.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center pb-20">
              <h1 className="text-[2.65rem] leading-tight font-semibold text-black tracking-tight">Olá!</h1>
              <h2 className="text-[2.65rem] leading-tight font-semibold text-black tracking-tight">Como posso te ajudar hoje?</h2>
            </div>
          ) : (
            <div className="flex-1 flex flex-col gap-12 pb-10">
              
              {interactions.map((interaction) => (
                <div key={interaction.id} className="flex flex-col gap-6">
                  
                  {/* BUBBLE DA PERGUNTA DO USUÁRIO */}
                  <div className="self-end flex items-center gap-4 max-w-[85%] animate-fade-in-up">
                    <button 
                      onClick={() => handleSaveString(interaction.query)}
                      disabled={savedStrings.includes(interaction.query)}
                      className={`transition-colors flex-shrink-0 mt-1 ${savedStrings.includes(interaction.query) ? 'text-black' : 'text-gray-400 hover:text-black'}`}
                      title={savedStrings.includes(interaction.query) ? "String já salva" : "Salvar String de Busca"}
                    >
                      <Bookmark size={22} strokeWidth={1.5} fill={savedStrings.includes(interaction.query) ? "currentColor" : "none"} />
                    </button>
                    <div className="bg-gray-100 py-4 px-6 rounded-2xl">
                      <p className="text-[1.1rem] text-black font-medium">{interaction.query}</p>
                    </div>
                  </div>

                  {/* BUBBLE DA RESPOSTA DO SISTEMA */}
                  <div className="flex flex-col gap-4 w-full">
                    {interaction.isLoading && (
                      <div className="flex flex-col items-center justify-center py-6 text-gray-500 animate-pulse">
                        <Loader2 size={28} className="animate-spin mb-3" />
                        <p className="text-sm">Buscando no acervo...</p>
                      </div>
                    )}

                    {interaction.error && (
                      <div className="border border-red-200 bg-red-50 text-red-700 p-5 rounded-xl text-center">
                        <h4 className="font-bold mb-1">Houve um problema com a busca</h4>
                        <p className="text-sm">{interaction.error}</p>
                      </div>
                    )}

                    {!interaction.isLoading && !interaction.error && Array.isArray(interaction.results) && interaction.results.length === 0 && (
                      <div className="text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-xl">
                        Nenhum documento retornado pela API para esta busca.
                      </div>
                    )}

                    {!interaction.isLoading && !interaction.error && Array.isArray(interaction.results) && interaction.results.map((doc, index) => (
                      <div key={doc?.id || index} style={{ animationDelay: `${index * 50}ms` }} className="animate-fade-in-up border border-gray-300 rounded-xl p-5 flex items-center justify-between hover:border-gray-500 hover:shadow-sm transition-all bg-white">
                        <div className="flex items-center gap-4 w-full overflow-hidden">
                          <div className="p-2 border border-gray-200 rounded-lg flex-shrink-0">
                            <FileText size={24} strokeWidth={1.5} className="text-gray-700" />
                          </div>
                          <div className="flex flex-col flex-1 overflow-hidden">
                            <span className="text-[1.05rem] font-medium text-black truncate w-full" title={getDocTitle(doc)}>
                              {getDocTitle(doc)}
                            </span>
                            <span className="text-xs text-green-600 font-medium">
                              Score de Relevância: {((Number(doc?.score) || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 ml-4 flex-shrink-0">
                          <button onClick={() => setSelectedDoc(doc)} className="text-gray-500 hover:text-black transition-colors" title="Ver Detalhes">
                            <Plus size={24} strokeWidth={1.5} />
                          </button>
                          <button 
                            onClick={() => handleSaveDoc(doc)}
                            className={`transition-colors ${favoriteDocs.some(d => d.id === doc?.id) ? 'text-black' : 'text-gray-400 hover:text-black'}`} 
                            title={favoriteDocs.some(d => d.id === doc?.id) ? "Remover dos Favoritos" : "Favoritar Arquivo"}
                          >
                            <Bookmark size={24} strokeWidth={1.5} fill={favoriteDocs.some(d => d.id === doc?.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Âncora invisível para o scroll automático funcionar */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* ================= CAIXA DE INPUT INFERIOR ================= */}
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
                  <button type="button" onClick={removeAttachment} className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-400 hover:bg-gray-200 transition-colors shadow-sm h-5 w-5 flex items-center justify-center">
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
                /* SEM O DISABLED ISLOADING AQUI */
              />
              <button 
                onClick={handleSearch} 
                disabled={!inputValue.trim() && !attachment} /* SEM O ISLOADING AQUI TAMBÉM */
                className="bg-black text-white p-3 rounded-full hover:bg-gray-800 transition-colors flex-shrink-0 disabled:opacity-50"
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
                    <button type="button" onClick={() => fileInputRef.current.click()} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-black text-sm font-medium transition-colors">
                      <ImagePlus size={18} strokeWidth={2} /> Adicionar fotos ou arquivos
                    </button>
                  </div>
                )}
              </div>
              
              <div className="relative flex-shrink-0">
                <button type="button" onClick={() => setActiveMenu(activeMenu === 'prefs' ? null : 'prefs')} className="flex items-center gap-2 text-black hover:text-gray-600 transition-colors font-medium text-[1rem] mt-1">
                  <SlidersHorizontal size={22} strokeWidth={1.75} /> Preferências
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

              {activeChips.map(chip => (
                <div key={chip.id} className="relative border border-gray-400 text-black text-[0.9rem] font-medium rounded-md px-3 py-1 bg-white animate-scale-in flex items-center ml-2">
                  {chip.label}
                  <button type="button" onClick={() => removeChip(chip.id)} className="absolute -top-2 -right-2 bg-white rounded-full border border-gray-400 hover:bg-gray-200 transition-colors shadow-sm h-5 w-5 flex items-center justify-center"><X size={12} strokeWidth={2} className="text-black" /></button>
                </div>
              ))}
            </div>
          </form>
        </div>

        {/* PAINEL LATERAL DIREITO - DETALHES DINÂMICOS */}
        {/* ================= PAINEL LATERAL DIREITO - DETALHES DINÂMICOS ================= */}
        {selectedDoc && (
          <>
            <div className="absolute inset-0 bg-black/20 z-40 animate-fade-in" onClick={() => setSelectedDoc(null)}></div>
            <aside className="absolute top-0 right-0 h-full w-[45%] bg-white border-l border-gray-200 shadow-2xl flex flex-col z-50 animate-slide-in-right">
              
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 sticky top-0">
                <h3 className="font-semibold text-lg text-black">Detalhes do Objeto</h3>
                <button onClick={() => setSelectedDoc(null)} className="p-2 hover:bg-gray-100 text-gray-500 hover:text-black rounded-md transition-colors">
                  <X size={20} strokeWidth={1.5} />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto pb-10">
                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex-shrink-0">
                    <FileText size={28} strokeWidth={1.5} className="text-gray-700" />
                  </div>
                  <h4 className="text-xl font-medium text-black leading-tight pt-1">
                    {getDocTitle(selectedDoc)}
                  </h4>
                </div>

                <div className="space-y-8">
                  {/* === DESCRIÇÃO DO SPECTRUM === */}
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Breve Descrição</h5>
                    <p className="text-gray-700 text-[0.95rem] leading-relaxed text-justify">
                      {getMetaValue(selectedDoc, ['Descrição Resumida', 'descricao_resumida']) !== 'Não informado' 
                        ? getMetaValue(selectedDoc, ['Descrição Resumida', 'descricao_resumida'])
                        : getMetaValue(selectedDoc, ['Descrição Detalhada/Analítica', 'descricao_detalhada', 'descricao', 'resumo']) !== 'Não informado'
                        ? getMetaValue(selectedDoc, ['Descrição Detalhada/Analítica', 'descricao_detalhada', 'descricao', 'resumo'])
                        : "Não há descrição catalogada no sistema Spectrum para este documento."}
                    </p>
                  </div>

                  {/* === METADADOS CATALOGADOS === */}
                  <div>
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Metadados Catalogados</h5>
                    <ul className="text-[0.9rem] text-gray-700 space-y-3">
                      
                      <li className="flex justify-between items-start border-b border-gray-50 pb-2 gap-4">
                        <span className="text-gray-500 whitespace-nowrap">Nº de Tombo (Acessionamento)</span>
                        <span className="font-medium text-black text-right">
                          {getMetaValue(selectedDoc, ['Número de Tombo (Acessionamento)', 'numero_de_tombo', 'tombo']) !== 'Não informado' 
                            ? getMetaValue(selectedDoc, ['Número de Tombo (Acessionamento)', 'numero_de_tombo', 'tombo']) 
                            : (selectedDoc?.id || 'N/A')}
                        </span>
                      </li>
                      
                      <li className="flex justify-between items-start border-b border-gray-50 pb-2 gap-4">
                        <span className="text-gray-500 whitespace-nowrap">Score de Relevância</span>
                        <span className="font-medium text-black text-right text-green-600">{((Number(selectedDoc?.score) || 0) * 100).toFixed(2)}%</span>
                      </li>

                      <li className="flex justify-between items-start border-b border-gray-50 pb-2 gap-4">
                        <span className="text-gray-500 whitespace-nowrap">Categoria / Tipologia</span>
                        <span className="font-medium text-black text-right">{getMetaValue(selectedDoc, ['Categoria / Tipologia', 'categoria', 'tipologia'])}</span>
                      </li>

                      <li className="flex justify-between items-start border-b border-gray-50 pb-2 gap-4">
                        <span className="text-gray-500 whitespace-nowrap">Material</span>
                        <span className="font-medium text-black text-right">{getMetaValue(selectedDoc, ['Material (Repetitivo)', 'material'])}</span>
                      </li>

                      <li className="flex justify-between items-start border-b border-gray-50 pb-2 gap-4">
                        <span className="text-gray-500 whitespace-nowrap">Técnica</span>
                        <span className="font-medium text-black text-right">{getMetaValue(selectedDoc, ['Técnica (Repetitivo)', 'tecnica'])}</span>
                      </li>

                      <li className="flex justify-between items-start border-b border-gray-50 pb-2 gap-4">
                        <span className="text-gray-500 whitespace-nowrap">Autor/Artista</span>
                        <span className="font-medium text-black text-right">{getMetaValue(selectedDoc, ['Autor/Artista (Repetitivo)', 'autor', 'artista'])}</span>
                      </li>

                      <li className="flex justify-between items-start border-b border-gray-50 pb-2 gap-4">
                        <span className="text-gray-500 whitespace-nowrap">Local de Produção</span>
                        <span className="font-medium text-black text-right">{getMetaValue(selectedDoc, ['Local de Produção', 'local_de_producao', 'local'])}</span>
                      </li>

                      <li className="flex justify-between items-start border-b border-gray-50 pb-2 gap-4">
                        <span className="text-gray-500 whitespace-nowrap">Procedência</span>
                        <span className="font-medium text-black text-right">{getMetaValue(selectedDoc, ['Procedência (Doador/Vendedor)', 'procedencia'])}</span>
                      </li>

                    </ul>
                  </div>

                  {/* === NOVA SEÇÃO: AVALIAÇÃO DA RECOMENDAÇÃO === */}
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Avalie esta Recomendação</h5>
                    <p className="text-[0.85rem] text-gray-500 mb-3">Este documento é relevante para o contexto da sua busca?</p>
                    <div 
                      className="flex items-center gap-1"
                      onMouseLeave={() => setHoveredRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const currentRating = docRatings[selectedDoc.id] || 0;
                        const isFilled = (hoveredRating || currentRating) >= star;
                        return (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoveredRating(star)}
                            onClick={() => handleRateDoc(selectedDoc.id, star)}
                            className="transition-transform hover:scale-110 focus:outline-none p-1"
                            title={`Avaliar com ${star} estrela${star > 1 ? 's' : ''}`}
                          >
                            <Star 
                              size={26} 
                              strokeWidth={1.5}
                              className={`transition-colors ${isFilled ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-200'}`}
                              fill={isFilled ? 'currentColor' : 'none'}
                            />
                          </button>
                        );
                      })}
                    </div>
                    {docRatings[selectedDoc.id] && (
                      <span className="text-xs font-medium text-green-600 mt-3 block animate-fade-in-up">
                        Obrigado pelo seu feedback! Isso ajuda a treinar nossa IA.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <button className="w-full bg-white border border-gray-300 hover:border-gray-800 text-black py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors shadow-sm">
                  <Quote size={18} strokeWidth={1.5} /> Obter Citação (ABNT)
                </button>
              </div>
              
            </aside>
          </>
        )}
      </div>
    </div>
  );
}

export default App;