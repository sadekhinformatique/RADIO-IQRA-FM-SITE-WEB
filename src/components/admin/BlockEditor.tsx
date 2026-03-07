import React, { useState } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  List, 
  Quote, 
  Code, 
  Table, 
  Video, 
  Music, 
  FileText, 
  Columns, 
  Grid, 
  Minus, 
  Plus, 
  Trash2, 
  X,
  MoveUp, 
  MoveDown,
  Layout,
  Radio,
  Youtube,
  Twitter,
  Music2
} from 'lucide-react';

export type BlockType = 
  | 'paragraph' | 'heading' | 'list' | 'quote' | 'code' | 'table' 
  | 'image' | 'gallery' | 'audio' | 'video' | 'file' 
  | 'columns' | 'group' | 'spacer' | 'separator'
  | 'radio-player' | 'embed-youtube' | 'embed-twitter' | 'embed-spotify';

export interface Block {
  id: string;
  type: BlockType;
  content: any;
  settings?: any;
}

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ blocks, onChange }) => {
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  const addBlock = (type: BlockType, index?: number) => {
    const newBlock: Block = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content: type === 'list' ? [''] : '',
      settings: {}
    };
    
    const newBlocks = [...blocks];
    if (typeof index === 'number') {
      newBlocks.splice(index + 1, 0, newBlock);
    } else {
      newBlocks.push(newBlock);
    }
    onChange(newBlocks);
    setActiveBlockId(newBlock.id);
  };

  const removeBlock = (id: string) => {
    onChange(blocks.filter(b => b.id !== id));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex >= 0 && targetIndex < newBlocks.length) {
      [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
      onChange(newBlocks);
    }
  };

  const updateBlock = (id: string, content: any, settings?: any) => {
    onChange(blocks.map(b => b.id === id ? { ...b, content, settings: settings || b.settings } : b));
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-20">
      {blocks.length === 0 && (
        <div className="border-2 border-dashed border-stone-200 rounded-xl p-12 text-center">
          <p className="text-stone-400 mb-4">Commencez à écrire ou ajoutez un bloc</p>
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => addBlock('paragraph')} className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors">
              <Type size={16} /> Paragraphe
            </button>
            <button onClick={() => addBlock('heading')} className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors">
              <Type size={16} className="font-bold" /> Titre
            </button>
            <button onClick={() => addBlock('image')} className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors">
              <ImageIcon size={16} /> Image
            </button>
          </div>
        </div>
      )}

      {blocks.map((block, index) => (
        <div 
          key={block.id} 
          className={`group relative border-2 rounded-xl transition-all ${activeBlockId === block.id ? 'border-islamic-green bg-white shadow-lg' : 'border-transparent hover:border-stone-100'}`}
          onClick={() => setActiveBlockId(block.id)}
        >
          {/* Block Controls */}
          <div className={`absolute -left-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${activeBlockId === block.id ? 'opacity-100' : ''}`}>
            <button onClick={() => moveBlock(index, 'up')} className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50"><MoveUp size={14} /></button>
            <button onClick={() => moveBlock(index, 'down')} className="p-2 bg-white border border-stone-200 rounded-lg hover:bg-stone-50"><MoveDown size={14} /></button>
          </div>

          <div className={`absolute -right-12 top-0 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${activeBlockId === block.id ? 'opacity-100' : ''}`}>
            <button onClick={() => removeBlock(block.id)} className="p-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50"><Trash2 size={14} /></button>
          </div>

          {/* Block Content */}
          <div className="p-4">
            {block.type === 'paragraph' && (
              <textarea
                value={block.content}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="Entrez votre texte ici..."
                className="w-full border-none focus:ring-0 resize-none text-lg leading-relaxed text-stone-700 min-h-[100px]"
              />
            )}

            {block.type === 'heading' && (
              <input
                type="text"
                value={block.content}
                onChange={(e) => updateBlock(block.id, e.target.value)}
                placeholder="Titre"
                className="w-full border-none focus:ring-0 text-3xl font-serif font-bold text-stone-800"
              />
            )}

            {block.type === 'image' && (
              <div className="space-y-2">
                {block.content ? (
                  <div className="relative rounded-lg overflow-hidden">
                    <img src={block.content} alt="Block" className="w-full h-auto" />
                    <button 
                      onClick={() => updateBlock(block.id, '')}
                      className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-stone-200 rounded-xl p-8 flex flex-col items-center justify-center bg-stone-50">
                    <ImageIcon size={32} className="text-stone-300 mb-2" />
                    <input 
                      type="text" 
                      placeholder="URL de l'image" 
                      className="w-full max-w-sm border border-stone-200 rounded-lg px-4 py-2 text-sm"
                      onBlur={(e) => updateBlock(block.id, e.target.value)}
                    />
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Légende de l'image"
                  className="w-full border-none focus:ring-0 text-sm italic text-stone-500 text-center"
                  value={block.settings?.caption || ''}
                  onChange={(e) => updateBlock(block.id, block.content, { ...block.settings, caption: e.target.value })}
                />
              </div>
            )}

            {block.type === 'list' && (
              <div className="space-y-2">
                {(block.content as string[]).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-islamic-green rounded-full flex-shrink-0" />
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const newList = [...block.content];
                        newList[i] = e.target.value;
                        updateBlock(block.id, newList);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const newList = [...block.content];
                          newList.splice(i + 1, 0, '');
                          updateBlock(block.id, newList);
                        }
                      }}
                      className="w-full border-none focus:ring-0 text-lg"
                      placeholder="Élément de liste..."
                    />
                    <button onClick={() => {
                      const newList = block.content.filter((_: any, idx: number) => idx !== i);
                      updateBlock(block.id, newList.length ? newList : ['']);
                    }} className="text-stone-300 hover:text-red-500"><X size={14} /></button>
                  </div>
                ))}
              </div>
            )}

            {block.type === 'quote' && (
              <div className="border-l-4 border-islamic-green pl-6 py-2 bg-stone-50 rounded-r-lg">
                <textarea
                  value={block.content}
                  onChange={(e) => updateBlock(block.id, e.target.value)}
                  placeholder="Citation..."
                  className="w-full border-none focus:ring-0 bg-transparent text-xl italic font-serif text-stone-700"
                />
                <input
                  type="text"
                  placeholder="Auteur"
                  className="w-full border-none focus:ring-0 bg-transparent text-sm font-bold text-stone-500"
                  value={block.settings?.author || ''}
                  onChange={(e) => updateBlock(block.id, block.content, { ...block.settings, author: e.target.value })}
                />
              </div>
            )}
          </div>

          {/* Add Block Button between blocks */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button 
              onClick={() => addBlock('paragraph', index)}
              className="w-8 h-8 bg-islamic-green text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      ))}

      {/* Block Inserter Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white border border-stone-200 rounded-2xl shadow-2xl p-4 flex items-center gap-4 z-50">
        <div className="flex items-center gap-2 border-r border-stone-100 pr-4">
          <button onClick={() => addBlock('paragraph')} className="p-2 hover:bg-stone-50 rounded-lg text-stone-600" title="Paragraphe"><Type size={20} /></button>
          <button onClick={() => addBlock('heading')} className="p-2 hover:bg-stone-50 rounded-lg text-stone-600" title="Titre"><Type size={20} className="font-bold" /></button>
          <button onClick={() => addBlock('list')} className="p-2 hover:bg-stone-50 rounded-lg text-stone-600" title="Liste"><List size={20} /></button>
          <button onClick={() => addBlock('quote')} className="p-2 hover:bg-stone-50 rounded-lg text-stone-600" title="Citation"><Quote size={20} /></button>
        </div>
        <div className="flex items-center gap-2 border-r border-stone-100 pr-4">
          <button onClick={() => addBlock('image')} className="p-2 hover:bg-stone-50 rounded-lg text-stone-600" title="Image"><ImageIcon size={20} /></button>
          <button onClick={() => addBlock('video')} className="p-2 hover:bg-stone-50 rounded-lg text-stone-600" title="Vidéo"><Video size={20} /></button>
          <button onClick={() => addBlock('audio')} className="p-2 hover:bg-stone-50 rounded-lg text-stone-600" title="Audio"><Music size={20} /></button>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => addBlock('radio-player')} className="p-2 hover:bg-stone-50 rounded-lg text-islamic-green" title="Radio Player"><Radio size={20} /></button>
          <button onClick={() => addBlock('embed-youtube')} className="p-2 hover:bg-stone-50 rounded-lg text-red-600" title="YouTube"><Youtube size={20} /></button>
        </div>
      </div>
    </div>
  );
};
