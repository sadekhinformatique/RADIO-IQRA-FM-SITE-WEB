import React from 'react';
import { Block } from './admin/BlockEditor';

interface BlockRendererProps {
  blocks: Block[] | string;
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ blocks }) => {
  if (typeof blocks === 'string') {
    return <p className="text-stone-600 text-lg leading-relaxed whitespace-pre-wrap">{blocks}</p>;
  }

  if (!Array.isArray(blocks)) return null;

  return (
    <div className="space-y-8">
      {blocks.map((block) => {
        switch (block.type) {
          case 'heading':
            return <h2 key={block.id} className="text-3xl font-serif font-bold text-stone-800 mt-8 mb-4">{block.content}</h2>;
          
          case 'paragraph':
            return <p key={block.id} className="text-stone-600 text-lg leading-relaxed">{block.content}</p>;
          
          case 'image':
            return (
              <figure key={block.id} className="my-8">
                <img src={block.content} alt={block.settings?.caption || ''} className="w-full rounded-2xl shadow-lg" />
                {block.settings?.caption && (
                  <figcaption className="text-center text-sm text-stone-400 mt-3 italic">{block.settings.caption}</figcaption>
                )}
              </figure>
            );
          
          case 'list':
            return (
              <ul key={block.id} className="space-y-3 my-6">
                {(block.content as string[]).map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-islamic-green rounded-full mt-2.5 flex-shrink-0" />
                    <span className="text-stone-600 text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            );
          
          case 'quote':
            return (
              <blockquote key={block.id} className="border-l-4 border-islamic-green pl-8 py-4 my-8 bg-stone-50 rounded-r-2xl italic">
                <p className="text-2xl font-serif text-stone-700 mb-2">"{block.content}"</p>
                {block.settings?.author && (
                  <cite className="text-sm font-bold text-stone-500 not-italic">— {block.settings.author}</cite>
                )}
              </blockquote>
            );

          case 'embed-youtube':
            const videoId = block.content.includes('v=') ? block.content.split('v=')[1].split('&')[0] : block.content.split('/').pop();
            return (
              <div key={block.id} className="aspect-video rounded-2xl overflow-hidden shadow-xl my-8">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}`}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            );

          case 'radio-player':
            return (
              <div key={block.id} className="bg-stone-900 p-8 rounded-3xl text-white my-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-islamic-green/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 bg-islamic-green rounded-2xl flex items-center justify-center shadow-lg shadow-islamic-green/20">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                  </div>
                  <div>
                    <h4 className="text-xl font-serif font-bold">Écouter RADIO IQRA FM</h4>
                    <p className="text-stone-400 text-sm">La Voix du Saint Coran en direct</p>
                  </div>
                  <button className="ml-auto px-6 py-3 bg-white text-islamic-green font-bold rounded-xl hover:bg-islamic-gold hover:text-white transition-all">
                    Lancer le direct
                  </button>
                </div>
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
