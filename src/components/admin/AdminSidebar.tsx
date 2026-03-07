import React from 'react';
import { 
  LayoutDashboard, 
  Newspaper, 
  FileText, 
  Image as ImageIcon, 
  FolderTree, 
  Tag, 
  MessageSquare, 
  Users, 
  Palette, 
  Settings, 
  Radio,
  LogOut,
  ChevronRight,
  Menu as MenuIcon,
  Layout
} from 'lucide-react';

export type AdminTab = 
  | 'dashboard' 
  | 'posts' 
  | 'pages' 
  | 'media' 
  | 'categories' 
  | 'tags' 
  | 'comments' 
  | 'users' 
  | 'appearance' 
  | 'radio' 
  | 'settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  setActiveTab: (tab: AdminTab) => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'posts', label: 'Articles', icon: Newspaper },
    { id: 'pages', label: 'Pages', icon: FileText },
    { id: 'media', label: 'Médiathèque', icon: ImageIcon },
    { id: 'categories', label: 'Catégories', icon: FolderTree },
    { id: 'tags', label: 'Étiquettes', icon: Tag },
    { id: 'comments', label: 'Commentaires', icon: MessageSquare },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'radio', label: 'Radio', icon: Radio },
    { id: 'settings', label: 'Réglages', icon: Settings },
  ];

  return (
    <div className="w-64 bg-stone-900 text-stone-300 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-stone-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-islamic-green rounded-lg flex items-center justify-center text-white font-bold">I</div>
        <h1 className="font-serif font-bold text-xl text-white">IQRA CMS</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as AdminTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all group ${
                activeTab === item.id 
                  ? 'bg-islamic-green text-white shadow-lg shadow-islamic-green/20' 
                  : 'hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={activeTab === item.id ? 'text-white' : 'text-stone-500 group-hover:text-stone-300'} />
                <span className="text-sm font-medium">{item.label}</span>
              </div>
              {activeTab === item.id && <ChevronRight size={14} />}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-stone-800">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-stone-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Déconnexion</span>
        </button>
      </div>
    </div>
  );
};
