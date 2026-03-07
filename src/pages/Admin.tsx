import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  X,
  Loader2,
  Image as ImageIcon,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Upload,
  FileImage,
  Copy,
  ExternalLink,
  Search,
  Eye,
  Layout,
  Settings,
  Radio,
  Music,
  Video,
  LayoutDashboard,
  Newspaper,
  FileText,
  FolderTree,
  Tag,
  MessageSquare,
  Users,
  Palette,
  ChevronRight,
  Menu as MenuIcon,
  LogOut,
  ArrowLeft,
  Calendar,
  BarChart3,
  Activity,
  MoreVertical,
  Globe,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { supabase, Post, Page, Category, Tag as TagType, Media, Profile, SiteSettings, Menu, MenuItem } from '../lib/supabase';
import { AdminSidebar, AdminTab } from '../components/admin/AdminSidebar';
import { BlockEditor, Block } from '../components/admin/BlockEditor';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaFiles, setMediaFiles] = useState<Media[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // CMS Form States
  const [postForm, setPostForm] = useState<Partial<Post>>({ 
    title: '', 
    slug: '', 
    content: [], 
    status: 'draft', 
    category_id: '',
    featured_image_url: '' 
  });
  const [pageForm, setPageForm] = useState<Partial<Page>>({ 
    title: '', 
    slug: '', 
    content: [], 
    status: 'draft' 
  });
  const [categoryForm, setCategoryForm] = useState<Partial<Category>>({ name: '', slug: '', description: '' });
  const [tagForm, setTagForm] = useState<Partial<TagType>>({ name: '', slug: '' });
  const [settingsForm, setSettingsForm] = useState<Partial<SiteSettings>>({
    site_title: 'RADIO IQRA FM',
    site_description: 'La Voix du Saint Coran',
    theme_config: {}
  });

  const ADMIN_PASSWORD = 'admin_iqra_2026';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('admin_auth', 'true');
    } else {
      alert('Mot de passe incorrect');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('admin_auth');
  };

  useEffect(() => {
    if (localStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (editingItem) {
      if (activeTab === 'posts') {
        setPostForm({
          title: editingItem.title || '',
          slug: editingItem.slug || '',
          content: editingItem.content || [],
          status: editingItem.status || 'draft',
          category_id: editingItem.category_id || '',
          featured_image_url: editingItem.featured_image_url || ''
        });
      } else if (activeTab === 'pages') {
        setPageForm({
          title: editingItem.title || '',
          slug: editingItem.slug || '',
          content: editingItem.content || [],
          status: editingItem.status || 'draft',
          featured_image_url: editingItem.featured_image_url || ''
        });
      } else if (activeTab === 'categories') {
        setCategoryForm({
          name: editingItem.name || '',
          slug: editingItem.slug || '',
          description: editingItem.description || ''
        });
      } else if (activeTab === 'tags') {
        setTagForm({
          name: editingItem.name || '',
          slug: editingItem.slug || ''
        });
      } else if (activeTab === 'settings') {
        setSettingsForm(editingItem);
      }
    } else {
      // Reset forms when not editing
      setPostForm({ title: '', slug: '', content: [], status: 'draft', category_id: '', featured_image_url: '' });
      setPageForm({ title: '', slug: '', content: [], status: 'draft' });
      setCategoryForm({ name: '', slug: '', description: '' });
      setTagForm({ name: '', slug: '' });
    }
  }, [editingItem, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories if we are in posts tab or categories tab
      if (activeTab === 'posts' || activeTab === 'categories') {
        const { data: cats } = await supabase.from('categories').select('*').order('name');
        setCategories(cats || []);
      }

      let table = '';
      if (activeTab === 'posts') table = 'posts';
      else if (activeTab === 'pages') table = 'pages';
      else if (activeTab === 'categories') table = 'categories';
      else if (activeTab === 'tags') table = 'tags';
      else if (activeTab === 'media') table = 'media';
      else if (activeTab === 'users') table = 'profiles';
      else if (activeTab === 'settings') table = 'site_settings';
      else if (activeTab === 'comments') table = 'comments';

      if (table) {
        const { data: result, error } = await supabase
          .from(table)
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setData(result || []);
        if (activeTab === 'media') setMediaFiles(result || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type: 'success' | 'error', message: string) => {
    setStatus(type);
    setStatusMessage(message);
    setTimeout(() => setStatus('idle'), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `media/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('cms_media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('cms_media')
        .getPublicUrl(filePath);

      const { error: dbError } = await supabase
        .from('media')
        .insert([{
          name: file.name,
          url: publicUrl,
          type: file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'document',
          mime_type: file.type,
          size: file.size
        }]);

      if (dbError) throw dbError;
      
      showStatus('success', 'Fichier téléversé avec succès');
      fetchData();
    } catch (err) {
      console.error('Upload error:', err);
      showStatus('error', 'Erreur lors du téléversement');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      let table = '';
      if (activeTab === 'posts') table = 'posts';
      else if (activeTab === 'pages') table = 'pages';
      else if (activeTab === 'categories') table = 'categories';
      else if (activeTab === 'tags') table = 'tags';
      else if (activeTab === 'media') table = 'media';

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      
      showStatus('success', 'Élément supprimé');
      fetchData();
    } catch (err) {
      console.error('Delete error:', err);
      showStatus('error', 'Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let table = '';
      let formData: any = {};

      if (activeTab === 'posts') {
        table = 'posts';
        formData = postForm;
      } else if (activeTab === 'pages') {
        table = 'pages';
        formData = pageForm;
      } else if (activeTab === 'categories') {
        table = 'categories';
        formData = categoryForm;
      } else if (activeTab === 'tags') {
        table = 'tags';
        formData = tagForm;
      } else if (activeTab === 'settings') {
        table = 'site_settings';
        formData = settingsForm;
      } else if (activeTab === 'comments') {
        table = 'comments';
        formData = editingItem; // Just use the editingItem directly for simplicity if it's a comment
      }

      if (editingItem) {
        const { error } = await supabase.from(table).update(formData).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from(table).insert([formData]);
        if (error) throw error;
      }

      showStatus('success', editingItem ? 'Mis à jour avec succès' : 'Créé avec succès');
      setIsModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      console.error('Submit error:', err);
      showStatus('error', 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full border border-stone-200"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-islamic-green rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-islamic-green/20">
              <Layout size={40} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-stone-800">IQRA CMS</h1>
            <p className="text-stone-500 font-medium">Administration du site</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-widest">Mot de passe</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-islamic-green text-white font-bold py-4 rounded-xl hover:bg-islamic-gold transition-all shadow-lg shadow-islamic-green/20 active:scale-95"
            >
              Se connecter
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-stone-800 capitalize">
              {activeTab === 'dashboard' ? 'Tableau de bord' : activeTab}
            </h1>
            <p className="text-stone-500 font-medium">Bienvenue sur votre interface d'administration</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 rounded-lg text-stone-600 font-bold text-sm hover:bg-stone-50 transition-all">
              <Globe size={16} /> Voir le site
            </a>
            {['posts', 'pages', 'categories', 'tags'].includes(activeTab) && (
              <button 
                onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 bg-islamic-green text-white rounded-lg font-bold text-sm hover:bg-islamic-gold transition-all shadow-lg shadow-islamic-green/20"
              >
                <Plus size={16} /> Ajouter
              </button>
            )}
            {activeTab === 'media' && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-islamic-green text-white rounded-lg font-bold text-sm hover:bg-islamic-gold transition-all shadow-lg shadow-islamic-green/20"
              >
                <Upload size={16} /> Téléverser
              </button>
            )}
          </div>
        </div>

        {/* Status Messages */}
        <AnimatePresence>
          {status !== 'idle' && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-xl flex items-center gap-3 border ${
                status === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
              }`}
            >
              {status === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">{statusMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Articles', value: '24', icon: Newspaper, color: 'bg-blue-50 text-blue-600' },
                { label: 'Pages', value: '12', icon: FileText, color: 'bg-purple-50 text-purple-600' },
                { label: 'Commentaires', value: '156', icon: MessageSquare, color: 'bg-orange-50 text-orange-600' },
                { label: 'Utilisateurs', value: '5', icon: Users, color: 'bg-green-50 text-green-600' },
              ].map((stat) => (
                <div key={stat.label} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-stone-400 text-sm font-bold uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-serif font-bold text-stone-800">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif font-bold text-stone-800">Articles récents</h3>
                  <button className="text-islamic-green text-sm font-bold hover:underline">Voir tout</button>
                </div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-xl transition-colors">
                      <div className="w-12 h-12 bg-stone-100 rounded-lg overflow-hidden">
                        <img src={`https://picsum.photos/seed/${i}/100/100`} alt="Post" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-stone-800 line-clamp-1">L'importance de la lecture du Coran</h4>
                        <p className="text-xs text-stone-400">Publié il y a 2 heures • Par Admin</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase">Publié</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-serif font-bold text-stone-800">Activité récente</h3>
                  <Activity size={20} className="text-stone-300" />
                </div>
                <div className="space-y-6">
                  {[
                    { user: 'Admin', action: 'a publié un nouvel article', time: 'Il y a 10 min' },
                    { user: 'Modérateur', action: 'a approuvé un commentaire', time: 'Il y a 45 min' },
                    { user: 'Admin', action: 'a mis à jour les réglages radio', time: 'Il y a 2 heures' },
                  ].map((activity, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-sm text-stone-800">
                          <span className="font-bold">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-stone-400">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data List View (Posts, Pages, etc.) */}
        {['posts', 'pages', 'categories', 'tags', 'comments', 'users'].includes(activeTab) && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
              <div className="relative max-w-md w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-islamic-green"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-6 py-4">{activeTab === 'comments' ? 'Auteur / Message' : 'Titre / Nom'}</th>
                    {activeTab === 'posts' && <th className="px-6 py-4">Auteur</th>}
                    {activeTab === 'posts' && <th className="px-6 py-4">Catégorie</th>}
                    <th className="px-6 py-4">Statut</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-stone-400">Aucun élément trouvé</td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.featured_image_url && (
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-100">
                                <img src={item.featured_image_url} alt="" className="w-full h-full object-cover" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-stone-800">
                                {activeTab === 'comments' ? item.author_name : (item.title || item.name || item.username)}
                              </p>
                              <p className="text-xs text-stone-400 italic">
                                {activeTab === 'comments' ? item.content : `/${item.slug || ''}`}
                              </p>
                            </div>
                          </div>
                        </td>
                        {activeTab === 'posts' && <td className="px-6 py-4 text-sm text-stone-600">Admin</td>}
                        {activeTab === 'posts' && <td className="px-6 py-4 text-sm text-stone-600">Actualités</td>}
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                            (item.status === 'published' || item.status === 'approved') ? 'bg-green-50 text-green-600' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {item.status || 'Actif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-stone-400">
                          {new Date(item.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {activeTab === 'comments' && item.status === 'pending' && (
                              <button 
                                onClick={async () => {
                                  const { error } = await supabase.from('comments').update({ status: 'approved' }).eq('id', item.id);
                                  if (error) showStatus('error', 'Erreur lors de l\'approbation');
                                  else { showStatus('success', 'Commentaire approuvé'); fetchData(); }
                                }}
                                className="p-2 text-stone-400 hover:text-green-500 hover:bg-green-50 rounded-lg transition-all"
                                title="Approuver"
                              >
                                <CheckCircle2 size={16} />
                              </button>
                            )}
                            <button 
                              onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                              className="p-2 text-stone-400 hover:text-islamic-green hover:bg-islamic-green/10 rounded-lg transition-all"
                            >
                              <Edit size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(item.id)}
                              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Media Library View */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Rechercher dans les médias..." 
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-islamic-green"
                />
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 bg-stone-100 rounded-lg text-stone-600 hover:bg-stone-200"><Layout size={18} /></button>
                <button className="p-2 bg-stone-100 rounded-lg text-stone-600 hover:bg-stone-200"><MenuIcon size={18} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mediaFiles.map((file) => (
                <div key={file.id} className="group relative aspect-square bg-white rounded-xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {file.type === 'image' ? (
                    <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-stone-50 text-stone-300">
                      {file.type === 'video' ? <Video size={32} /> : <FileImage size={32} />}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                    <p className="text-[10px] text-white font-bold text-center line-clamp-2">{file.name}</p>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => { navigator.clipboard.writeText(file.url); showStatus('success', 'Lien copié'); }}
                        className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-lg backdrop-blur-sm"
                      >
                        <Copy size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(file.id)}
                        className="p-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-500 rounded-lg backdrop-blur-sm"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-300 hover:border-islamic-green hover:text-islamic-green hover:bg-islamic-green/5 transition-all"
              >
                <Plus size={32} />
                <span className="text-xs font-bold mt-2 uppercase tracking-widest">Ajouter</span>
              </button>
            </div>
          </div>
        )}

        {/* Appearance View */}
        {activeTab === 'appearance' && (
          <div className="space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                <Palette size={20} className="text-islamic-green" /> Thèmes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Iqra Classic', slug: 'classic', image: 'https://picsum.photos/seed/classic/400/300', active: true },
                  { name: 'Modern Dark', slug: 'dark', image: 'https://picsum.photos/seed/dark/400/300', active: false },
                  { name: 'Minimalist', slug: 'minimal', image: 'https://picsum.photos/seed/minimal/400/300', active: false },
                ].map((theme) => (
                  <div key={theme.slug} className={`group relative rounded-2xl overflow-hidden border-2 transition-all ${theme.active ? 'border-islamic-green' : 'border-stone-100 hover:border-stone-200'}`}>
                    <img src={theme.image} alt={theme.name} className="w-full aspect-video object-cover" />
                    <div className="p-4 bg-white">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-stone-800">{theme.name}</h4>
                        {theme.active && <span className="px-2 py-0.5 bg-islamic-green text-white text-[10px] font-bold rounded uppercase">Actif</span>}
                      </div>
                      <div className="flex gap-2">
                        {!theme.active && <button className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-200 transition-all">Activer</button>}
                        <button className="flex-1 py-2 border border-stone-100 text-stone-600 rounded-lg text-xs font-bold hover:bg-stone-50 transition-all">Personnaliser</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                <MenuIcon size={20} className="text-islamic-green" /> Menus de navigation
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl border border-stone-100">
                  <select className="bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    <option>Menu Principal (Header)</option>
                    <option>Menu Secondaire (Footer)</option>
                  </select>
                  <button className="px-4 py-2 bg-islamic-green text-white rounded-lg text-sm font-bold hover:bg-islamic-gold transition-all">Gérer</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Radio View */}
        {activeTab === 'radio' && (
          <div className="max-w-4xl space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                <Radio size={20} className="text-islamic-green" /> Configuration Radio
              </h3>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">URL du flux (Icecast/AzuraCast)</label>
                    <input 
                      type="text" 
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                      placeholder="https://radio.example.com/stream"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">URL de secours</label>
                    <input 
                      type="text" 
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                      placeholder="https://backup.example.com/stream"
                    />
                  </div>
                </div>

                <div className="p-6 bg-stone-900 rounded-2xl text-white">
                  <h4 className="text-sm font-bold mb-4 uppercase tracking-widest text-islamic-green">Aperçu du Player</h4>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center">
                      <Music size={32} />
                    </div>
                    <div>
                      <p className="text-lg font-serif font-bold">RADIO IQRA FM</p>
                      <p className="text-xs text-stone-400">En direct • La Voix du Saint Coran</p>
                    </div>
                    <div className="ml-auto flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">Live</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button className="bg-islamic-green text-white font-bold px-8 py-3 rounded-xl hover:bg-islamic-gold transition-all shadow-lg shadow-islamic-green/20">
                    Enregistrer les réglages radio
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-islamic-green" /> Programme Radio
              </h3>
              <div className="space-y-4">
                <button className="w-full p-4 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-islamic-green hover:text-islamic-green transition-all flex items-center justify-center gap-2">
                  <Plus size={20} /> Ajouter une émission au programme
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Settings View */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl space-y-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                <Settings size={20} className="text-islamic-green" /> Réglages généraux
              </h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Titre du site</label>
                    <input 
                      type="text" 
                      value={settingsForm.site_title}
                      onChange={(e) => setSettingsForm({ ...settingsForm, site_title: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Description du site</label>
                    <input 
                      type="text" 
                      value={settingsForm.site_description}
                      onChange={(e) => setSettingsForm({ ...settingsForm, site_description: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Logo du site (URL)</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={settingsForm.logo_url}
                      onChange={(e) => setSettingsForm({ ...settingsForm, logo_url: e.target.value })}
                      className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                    />
                    <button type="button" className="px-4 bg-stone-100 rounded-xl hover:bg-stone-200 transition-colors">
                      <ImageIcon size={20} className="text-stone-500" />
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-stone-100">
                  <h4 className="text-sm font-bold text-stone-800 mb-4 uppercase tracking-widest">Réseaux Sociaux</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Facebook', key: 'facebook_url' },
                      { label: 'Twitter', key: 'twitter_url' },
                      { label: 'Instagram', key: 'instagram_url' },
                      { label: 'TikTok', key: 'tiktok_url' },
                    ].map((social) => (
                      <div key={social.key}>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">{social.label}</label>
                        <input 
                          type="text" 
                          value={(settingsForm as any)[social.key] || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, [social.key]: e.target.value })}
                          className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-islamic-green"
                          placeholder="https://..."
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    type="submit"
                    className="bg-islamic-green text-white font-bold px-8 py-3 rounded-xl hover:bg-islamic-gold transition-all shadow-lg shadow-islamic-green/20"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
              <h3 className="text-xl font-serif font-bold text-stone-800 mb-6 flex items-center gap-2">
                <ShieldCheck size={20} className="text-islamic-green" /> Sécurité & Rôles
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-800">Inscription des utilisateurs</p>
                    <p className="text-xs text-stone-500">Autoriser n'importe qui à s'inscrire sur le site</p>
                  </div>
                  <div className="w-12 h-6 bg-stone-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                  </div>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-stone-800">Rôle par défaut</p>
                    <p className="text-xs text-stone-500">Rôle attribué aux nouveaux inscrits</p>
                  </div>
                  <select className="bg-white border border-stone-200 rounded-lg px-3 py-1 text-sm focus:outline-none">
                    <option>Abonné</option>
                    <option>Contributeur</option>
                    <option>Auteur</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Editor Modal (Full Screen for Posts/Pages) */}
      <AnimatePresence>
        {isModalOpen && (activeTab === 'posts' || activeTab === 'pages') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col"
          >
            {/* Editor Header */}
            <div className="h-16 border-b border-stone-100 px-6 flex items-center justify-between bg-white">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-stone-50 rounded-lg text-stone-400"
                >
                  <ArrowLeft size={20} />
                </button>
                <div className="h-6 w-px bg-stone-100" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                    {editingItem ? 'Modifier' : 'Nouvel'} {activeTab === 'posts' ? 'Article' : 'Page'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-stone-600 font-bold text-sm hover:bg-stone-50 rounded-lg transition-all">
                  Aperçu
                </button>
                <button 
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-islamic-green text-white font-bold text-sm rounded-lg hover:bg-islamic-gold transition-all shadow-lg shadow-islamic-green/20"
                >
                  {editingItem ? 'Mettre à jour' : 'Publier'}
                </button>
                <div className="h-6 w-px bg-stone-100 mx-2" />
                <button className="p-2 text-stone-400 hover:bg-stone-50 rounded-lg">
                  <Settings size={20} />
                </button>
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-y-auto bg-stone-50/30">
              <div className="max-w-4xl mx-auto py-12 px-6">
                <input 
                  type="text" 
                  placeholder="Ajouter un titre"
                  className="w-full bg-transparent border-none focus:ring-0 text-5xl font-serif font-bold text-stone-800 mb-8 placeholder:text-stone-200"
                  value={activeTab === 'posts' ? postForm.title : pageForm.title}
                  onChange={(e) => {
                    const title = e.target.value;
                    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                    if (activeTab === 'posts') setPostForm({ ...postForm, title, slug });
                    else setPageForm({ ...pageForm, title, slug });
                  }}
                />

                <BlockEditor 
                  blocks={activeTab === 'posts' ? (postForm.content as Block[]) : (pageForm.content as Block[])}
                  onChange={(blocks) => {
                    if (activeTab === 'posts') setPostForm({ ...postForm, content: blocks });
                    else setPageForm({ ...pageForm, content: blocks });
                  }}
                />
              </div>
            </div>

            {/* Editor Sidebar (Optional Settings) */}
            <div className="w-80 border-l border-stone-100 bg-white hidden lg:block">
              <div className="p-6">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest mb-6">Réglages</h3>
                
                <div className="space-y-8">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Permalien</label>
                    <div className="flex items-center gap-1 text-xs text-stone-500 bg-stone-50 p-2 rounded border border-stone-100">
                      <span className="opacity-50">/</span>
                      <input 
                        type="text" 
                        value={activeTab === 'posts' ? postForm.slug : pageForm.slug}
                        onChange={(e) => {
                          if (activeTab === 'posts') setPostForm({ ...postForm, slug: e.target.value });
                          else setPageForm({ ...pageForm, slug: e.target.value });
                        }}
                        className="bg-transparent border-none p-0 focus:ring-0 w-full"
                      />
                    </div>
                  </div>

                  {activeTab === 'posts' && (
                    <div>
                      <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Catégorie</label>
                      <select 
                        className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                        value={postForm.category_id}
                        onChange={(e) => setPostForm({ ...postForm, category_id: e.target.value })}
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Image mise en avant</label>
                    <div className="aspect-video bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-300 hover:border-islamic-green hover:text-islamic-green transition-all cursor-pointer">
                      <ImageIcon size={32} />
                      <span className="text-[10px] font-bold mt-2 uppercase tracking-widest">Définir l'image</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100">
                    <h4 className="text-xs font-bold text-stone-800 mb-4 uppercase tracking-widest">SEO</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Meta Titre</label>
                        <input type="text" className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Meta Description</label>
                        <textarea className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-xs h-20 resize-none" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard Modal (for Categories, Tags, etc.) */}
      <AnimatePresence>
        {isModalOpen && !['posts', 'pages'].includes(activeTab) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                <h3 className="text-xl font-serif font-bold text-stone-800">
                  {editingItem ? 'Modifier' : 'Ajouter'} {activeTab === 'categories' ? 'une catégorie' : 'une étiquette'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-600"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Nom</label>
                  <input 
                    type="text" 
                    value={activeTab === 'categories' ? categoryForm.name : tagForm.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                      if (activeTab === 'categories') setCategoryForm({ ...categoryForm, name, slug });
                      else setTagForm({ ...tagForm, name, slug });
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Slug</label>
                  <input 
                    type="text" 
                    value={activeTab === 'categories' ? categoryForm.slug : tagForm.slug}
                    onChange={(e) => {
                      if (activeTab === 'categories') setCategoryForm({ ...categoryForm, slug: e.target.value });
                      else setTagForm({ ...tagForm, slug: e.target.value });
                    }}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green"
                  />
                </div>
                {activeTab === 'categories' && (
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea 
                      value={categoryForm.description}
                      onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 focus:outline-none focus:border-islamic-green h-32 resize-none"
                    />
                  </div>
                )}
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-3 text-stone-500 font-bold hover:bg-stone-50 rounded-xl transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="bg-islamic-green text-white font-bold px-8 py-3 rounded-xl hover:bg-islamic-gold transition-all shadow-lg shadow-islamic-green/20"
                  >
                    Enregistrer
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        className="hidden" 
        accept="image/*,video/*,audio/*,application/pdf"
      />
    </div>
  );
}
