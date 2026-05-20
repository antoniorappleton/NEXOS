import React, { useState } from 'react';
import { User, Content, Module } from '../data/mockData';
import { Search, Filter, FileText, Link2, Code, Dumbbell, Download, Eye, Plus } from 'lucide-react';
import { Youtube } from './Icons';

interface ContentLibraryProps {
  user: User;
  contents: Content[];
  modules: Module[];
  onUploadContent: (newContent: Omit<Content, 'id' | 'createdAt'>) => void;
}

export const ContentLibrary: React.FC<ContentLibraryProps> = ({
  user,
  contents,
  modules,
  onUploadContent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedContent, setSelectedContent] = useState<Content | null>(contents[0] || null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form states
  const [upTitle, setUpTitle] = useState('');
  const [upType, setUpType] = useState<'video' | 'pdf' | 'link' | 'code' | 'exercise'>('pdf');
  const [upModule, setUpModule] = useState(modules[0]?.id || '');
  const [upDesc, setUpDesc] = useState('');
  const [upUrl, setUpUrl] = useState('');
  const [upDiff, setUpDiff] = useState<'Iniciante' | 'Intermédio' | 'Avançado'>('Iniciante');
  const [upTech, setUpTech] = useState('HTML');

  // Trigger simulated downloads
  const handleDownload = (filename: string) => {
    setToastMessage(`A descarregar "${filename}"...`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    onUploadContent({
      moduleId: upModule,
      teacherId: user.role === 'teacher' ? user.id : 'u-1',
      title: upTitle,
      type: upType,
      description: upDesc,
      fileUrl: upType === 'pdf' || upType === 'code' || upType === 'exercise' ? '/files/' + upTitle.toLowerCase().replace(/ /g, '_') + '.' + (upType === 'pdf' ? 'pdf' : 'zip') : undefined,
      externalUrl: upType === 'video' || upType === 'link' ? upUrl : undefined,
      difficulty: upDiff,
      technology: upTech
    });
    
    // Reset
    setUpTitle('');
    setUpDesc('');
    setUpUrl('');
    setShowUploadModal(false);
    
    setToastMessage('Conteúdo carregado com sucesso!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter logic
  const filteredContents = contents.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.technology.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesModule = selectedModule === 'all' || item.moduleId === selectedModule;
    const matchesDiff = selectedDifficulty === 'all' || item.difficulty === selectedDifficulty;

    return matchesSearch && matchesType && matchesModule && matchesDiff;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <Youtube className="text-rose-400" size={18} />;
      case 'pdf': return <FileText className="text-blue-400" size={18} />;
      case 'link': return <Link2 className="text-purple-400" size={18} />;
      case 'code': return <Code className="text-amber-400" size={18} />;
      case 'exercise': return <Dumbbell className="text-emerald-400" size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Toast Alert popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl bg-slate-800 border border-brand-500 text-sm font-semibold text-white shadow-2xl animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Biblioteca de Conteúdos</h1>
          <p className="mt-2 text-slate-400">Repositório de recursos de estudo, demonstrações, tutoriais em vídeo e exercícios práticos.</p>
        </div>
        {user.role === 'teacher' && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white transition rounded-lg bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/10 cursor-pointer"
          >
            <Plus size={16} />
            Publicar Material
          </button>
        )}
      </div>

      {/* Search and filter toolbar */}
      <div className="p-4 glass rounded-2xl flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl w-full sm:max-w-md">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar materiais por tema ou tecnologia..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-slate-200 outline-none w-full placeholder-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Module filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Filter size={12} className="text-slate-400" />
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">Módulos: Todos</option>
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.name.split(' ')[0]}...</option>
              ))}
            </select>
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Filter size={12} className="text-slate-400" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-transparent text-slate-300 outline-none cursor-pointer"
            >
              <option value="all">Nível: Todos</option>
              <option value="Iniciante">Iniciante</option>
              <option value="Intermédio">Intermédio</option>
              <option value="Avançado">Avançado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resource type filter tags */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Todos os Recursos' },
          { id: 'video', label: 'Vídeo Aulas' },
          { id: 'pdf', label: 'Documentação / PDFs' },
          { id: 'code', label: 'Templates & Código' },
          { id: 'exercise', label: 'Desafios & Exercícios' },
          { id: 'link', label: 'Links Externos' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedType(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition cursor-pointer ${
              selectedType === tab.id
                ? 'bg-brand-500/25 border-brand-500 text-brand-400 font-bold'
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Split layout: List and Details Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Contents Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredContents.map((content) => (
              <div
                key={content.id}
                onClick={() => setSelectedContent(content)}
                className={`p-5 rounded-2xl glass-card border transition cursor-pointer text-left flex flex-col justify-between ${
                  selectedContent?.id === content.id
                    ? 'border-brand-500/60 bg-slate-800/35 ring-1 ring-brand-500/20'
                    : 'border-slate-800 hover:border-slate-700/60 hover:bg-slate-800/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="inline-block px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-3xs font-extrabold tracking-wider uppercase">
                      {content.technology}
                    </span>
                    <div className="p-1.5 rounded-lg bg-slate-900/50">
                      {getIcon(content.type)}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-sm mt-3 line-clamp-1 group-hover:text-brand-400 transition">
                    {content.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {content.description}
                  </p>
                </div>
                
                <div className="mt-4 flex items-center justify-between border-t border-slate-800/65 pt-3 text-3xs text-slate-500 font-medium">
                  <span className="capitalize">{content.type} • {content.difficulty}</span>
                  <span className="flex items-center gap-1">
                    <Eye size={10} /> Preview
                  </span>
                </div>
              </div>
            ))}
            {filteredContents.length === 0 && (
              <div className="col-span-2 py-12 text-center text-slate-500 text-sm">
                Nenhum recurso corresponde aos filtros selecionados.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Visual details and embed area */}
        <div>
          {selectedContent ? (
            <div className="p-6 glass rounded-2xl border border-brand-500/20 space-y-6">
              <div>
                <span className="text-3xs font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400">
                  {selectedContent.technology} • {selectedContent.difficulty}
                </span>
                <h2 className="text-lg font-bold text-white mt-3 leading-snug">{selectedContent.title}</h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{selectedContent.description}</p>
              </div>

              {/* Dynamic preview block */}
              {selectedContent.type === 'video' ? (
                <div className="space-y-3">
                  <span className="text-2xs text-slate-400 font-bold block">Video Aula Player</span>
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black">
                    {selectedContent.externalUrl ? (
                      <iframe
                        src={selectedContent.externalUrl}
                        title={selectedContent.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="absolute inset-0 w-full h-full"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-xs">
                        Video indisponível
                      </div>
                    )}
                  </div>
                </div>
              ) : selectedContent.type === 'link' ? (
                <a
                  href={selectedContent.externalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between p-4 rounded-xl bg-purple-500/10 border border-purple-500/35 hover:bg-purple-500/15 text-purple-400 font-semibold text-xs transition cursor-pointer"
                >
                  <span>Abrir Ligação Externa</span>
                  <Link2 size={16} />
                </a>
              ) : (
                <button
                  onClick={() => handleDownload(selectedContent.title)}
                  className="w-full flex items-center justify-between p-4 rounded-xl bg-brand-600/15 border border-brand-500/35 hover:bg-brand-600/25 text-brand-400 font-semibold text-xs transition cursor-pointer"
                >
                  <span>Descarregar Material (.zip / .pdf)</span>
                  <Download size={16} />
                </button>
              )}

              {/* Comments Mock section */}
              <div className="border-t border-slate-800 pt-4 space-y-3">
                <span className="text-xs font-semibold text-slate-300 block">Discussão & Dúvidas</span>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-3xs text-slate-400 leading-relaxed italic text-center">
                  "Nenhum comentário adicionado. Coloque a sua dúvida relacionada com este recurso aqui."
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escreve uma nota..."
                    className="w-full text-xs p-2 rounded-lg bg-slate-950 border border-slate-800 text-white outline-none focus:border-brand-500/50"
                  />
                  <button className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-2xs transition font-semibold">
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 glass rounded-2xl text-center text-slate-500 text-xs">
              Seleciona um conteúdo para visualizar o seu detalhe e links de descarregamento.
            </div>
          )}
        </div>
      </div>

      {/* Upload Material Modal (Teacher ONLY) */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 glass rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-white">Publicar Novo Recurso</h2>

            <form onSubmit={handleSaveUpload} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">Tipo de Ficheiro</label>
                  <select
                    value={upType}
                    onChange={(e: any) => setUpType(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="pdf">PDF Documento</option>
                    <option value="video">Vídeo Embed</option>
                    <option value="code">Código / Template</option>
                    <option value="exercise">Exercício Prático</option>
                    <option value="link">Link Externo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">Módulo Associado</label>
                  <select
                    value={upModule}
                    onChange={(e) => setUpModule(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    {modules.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Título do Recurso</label>
                <input
                  type="text"
                  required
                  value={upTitle}
                  onChange={(e) => setUpTitle(e.target.value)}
                  placeholder="Ex: Folha de Atalhos de React Hooks"
                  className="w-full p-2.5 rounded-lg text-sm glass-input text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">Dificuldade</label>
                  <select
                    value={upDiff}
                    onChange={(e: any) => setUpDiff(e.target.value)}
                    className="w-full p-2.5 rounded-lg text-sm bg-slate-900 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermédio">Intermédio</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">Tecnologia (Tag)</label>
                  <input
                    type="text"
                    required
                    value={upTech}
                    onChange={(e) => setUpTech(e.target.value)}
                    placeholder="Ex: React, CSS, Git"
                    className="w-full p-2.5 rounded-lg text-sm glass-input text-slate-200"
                  />
                </div>
              </div>

              {(upType === 'video' || upType === 'link') && (
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-semibold block">Link de Destino (URL)</label>
                  <input
                    type="url"
                    required
                    value={upUrl}
                    onChange={(e) => setUpUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                    className="w-full p-2.5 rounded-lg text-sm glass-input text-slate-200"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs text-slate-400 font-semibold block">Breve Descrição</label>
                <textarea
                  required
                  value={upDesc}
                  onChange={(e) => setUpDesc(e.target.value)}
                  placeholder="Resumo do conteúdo e como os alunos devem utilizá-lo no estudo..."
                  rows={2}
                  className="w-full p-3 rounded-lg text-sm glass-input text-slate-200"
                />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition bg-slate-800 rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition cursor-pointer"
                >
                  Publicar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
