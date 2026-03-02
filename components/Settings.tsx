
import React, { useState, useEffect, useContext } from 'react';
import { Database, Cloud, Loader2, User as UserIcon, BrainCircuit, Key, ExternalLink, ShieldCheck, ShieldAlert, Globe, Palette, Sun, Moon, Check, Info } from 'lucide-react';
import { backupData, restoreData, getLastSyncTime, signOut } from '../services/supabaseService';
import ConfirmationModal from './ConfirmationModal';
import { LanguageContext } from '../contexts/LanguageContext';
import { Language } from '../types';
import { wallpapers, wallpaperCategories, accentColors } from '../config/theme';

interface SettingsProps {
  onExportData: () => void;
  onWipeData: () => void;
  getAllData: () => Record<string, unknown>;
  onRestoreData: (data: Record<string, unknown>) => void;
  user: { email: string; };
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  accentColor: string;
  onSetAccentColor: (color: string) => void;
  wallpaper: string;
  onSetWallpaper: (wallpaperId: string) => void;
  geminiApiKey: string;
  onSetGeminiApiKey: (key: string) => void;
}

const Settings: React.FC<SettingsProps> = (props) => {
  const { onExportData, onWipeData, getAllData, onRestoreData, user, isDarkMode, onToggleDarkMode, accentColor, onSetAccentColor, wallpaper, onSetWallpaper, geminiApiKey, onSetGeminiApiKey } = props;
  const [activeTab, setActiveTab] = useState('general');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  
  const { language, setLanguage, t } = useContext(LanguageContext);
  
  const [activeWallpaperCategory, setActiveWallpaperCategory] = useState(wallpaperCategories[0]);
  const [showApiKey, setShowApiKey] = useState(false);

  const fetchLastSync = async () => {
    try {
        const time = await getLastSyncTime();
        setLastSynced(time ? new Date(time).toLocaleString() : 'Never');
    } catch {
        setLastSynced('Could not retrieve status');
    }
  };

  useEffect(() => {
    if (activeTab === 'sync' && !lastSynced) fetchLastSync();
  }, [activeTab, lastSynced]);

  const handleBackup = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
        const { error } = await backupData(getAllData());
        if (error) throw error;
        await fetchLastSync();
    } catch (error: unknown) {
        setSyncError(`Backup failed: ${(error as Error).message}`);
    } finally {
        setIsSyncing(false);
    }
  };

  const handleRestore = async () => {
    setIsSyncing(true);
    setSyncError(null);
    try {
        const { data, error } = await restoreData();
        if (error) throw error;
        if (data) onRestoreData(data);
        else setSyncError("No backup found to restore.");
    } catch (error: unknown) {
        setSyncError(`Restore failed: ${(error as Error).message}`);
    } finally {
        setIsSyncing(false);
    }
  };
  
  const handleSignOut = async () => await signOut();

  const renderGeneralTab = () => (
     <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">General Settings</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Globe size={20} />
                    <div>
                        <h4 className="font-semibold">{t('language')}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Select your preferred language.</p>
                    </div>
                </div>
                <select value={language} onChange={(e) => setLanguage(e.target.value as Language)} className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg px-3 py-1.5">
                    <option value="en">English</option>
                    <option value="jp">日本語</option>
                    <option value="cn">中文</option>
                </select>
             </div>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">System Information</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700/50 space-y-3">
             <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <Info size={18} className="text-accent" />
                <span className="font-medium">Version:</span>
                <span className="font-mono bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded text-xs">beta0.0.1</span>
             </div>
             <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-7">&quot;100% of the code is generated by gemini&quot;</p>
          </div>
        </section>

        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Local Data Management</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-200 dark:divide-slate-700/50">
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">{t('export')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Download a local JSON file of your data.</p>
              </div>
              <button onClick={onExportData} className="px-3 py-1.5 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent-hover">Export</button>
            </div>
             <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold text-red-500">{t('wipeData')}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Permanently delete local data on this device.</p>
              </div>
              <button onClick={onWipeData} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">{t('wipeData')}</button>
            </div>
          </div>
        </section>
      </div>
  );

  const renderAppearanceTab = () => (
    <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Appearance</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-200 dark:divide-slate-700/50">
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div className="flex items-center gap-3">
                  {isDarkMode ? <Moon size={20}/> : <Sun size={20}/>}
                  <div>
                    <h4 className="font-semibold">Interface Theme</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark mode.</p>
                  </div>
              </div>
              <button onClick={onToggleDarkMode} className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg text-sm font-medium">{isDarkMode ? 'Dark' : 'Light'}</button>
            </div>
            <div className="pt-4 first:pt-0">
              <h4 className="font-semibold mb-3">Accent Color</h4>
              <div className="flex flex-wrap gap-4 items-center">
                  {accentColors.map(color => (
                    <button key={color.name} onClick={() => onSetAccentColor(color.hex)} className="w-8 h-8 rounded-full transition-transform transform hover:scale-110 flex items-center justify-center" style={{ backgroundColor: color.hex }}>
                      {accentColor === color.hex && <Check size={16} className="text-white" />}
                    </button>
                  ))}
                  <input type="color" value={accentColor} onChange={e => onSetAccentColor(e.target.value)} className="w-10 h-10 p-0 border-none rounded-full cursor-pointer appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-full [&::-webkit-color-swatch]:border-2 [&::-webkit-color-swatch]:border-white/20" />
              </div>
            </div>
          </div>
        </section>
        <section>
            <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Wallpaper</h3>
            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
                <div className="flex flex-wrap gap-2 mb-4">
                  {wallpaperCategories.map(cat => (
                      <button key={cat} onClick={() => setActiveWallpaperCategory(cat)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeWallpaperCategory === cat ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-slate-700'}`}>{cat}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-80 overflow-y-auto pr-2">
                    {wallpapers.filter(w => w.category === activeWallpaperCategory).map(wp => (
                        <button key={wp.id} onClick={() => onSetWallpaper(wp.id)} className={`aspect-video rounded-lg overflow-hidden border-2 transition-colors relative group ${wallpaper === wp.id ? 'border-accent' : 'border-transparent hover:border-gray-400'}`}>
                            <img src={isDarkMode ? wp.darkUrl : wp.lightUrl} alt={wp.id} className="w-full h-full object-cover" />
                            {wallpaper === wp.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Check size={24} className="text-white"/></div>}
                        </button>
                    ))}
                </div>
            </div>
        </section>
    </div>
  );
  
  const renderSyncTab = () => (
    <div className="space-y-8 animate-fade-in">
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Account</h3>
           <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <UserIcon size={18} />
                    <div>
                        <h4 className="font-semibold">Logged In As</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                </div>
                <button onClick={handleSignOut} className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700">Log Out</button>
            </div>
           </div>
        </section>
        <section>
          <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Cloud Sync</h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-gray-200 dark:border-slate-700/50 space-y-4 divide-y divide-gray-200 dark:divide-slate-700/50">
             <div className="text-sm pt-4 first:pt-0">
                <p className="text-gray-500 dark:text-gray-400">Data is backed up automatically to the cloud.</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Last synced: <span className="font-semibold text-slate-700 dark:text-slate-300">{lastSynced || 'Loading...'}</span></p>
                {syncError && <p className="text-red-500 mt-1">{syncError}</p>}
             </div>
             <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">Force Backup</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manually push local data to the cloud.</p>
              </div>
              <button onClick={handleBackup} disabled={isSyncing} className="w-28 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center">
                {isSyncing ? <Loader2 className="animate-spin" size={18}/> : 'Backup'}
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 first:pt-0">
              <div>
                <h4 className="font-semibold">Force Restore</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Overwrite local data with cloud backup.</p>
              </div>
              <button onClick={() => setIsRestoreModalOpen(true)} disabled={isSyncing} className="w-28 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center">
                 {isSyncing ? <Loader2 className="animate-spin" size={18}/> : 'Restore'}
              </button>
            </div>
          </div>
        </section>
    </div>
  );

  const renderAiTab = () => (
    <div className="space-y-8 animate-fade-in">
        <section>
            <h3 className="text-lg font-bold mb-3 text-slate-900 dark:text-white">Gemini AI Configuration</h3>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700/50 space-y-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${geminiApiKey ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {geminiApiKey ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{geminiApiKey ? 'API Key Active' : 'API Key Required'}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">To use AI features, you must provide a Gemini API key from Google AI Studio.</p>
                    </div>
                </div>
                
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gemini API Key</label>
                    <div className="relative">
                        <input 
                            type={showApiKey ? "text" : "password"}
                            value={geminiApiKey}
                            onChange={(e) => onSetGeminiApiKey(e.target.value)}
                            placeholder="Enter your Gemini API key..."
                            className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                        />
                        <button 
                            type="button"
                            onClick={() => setShowApiKey(!showApiKey)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            {showApiKey ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                    </div>
                    <p className="text-[10px] text-gray-400">Your key is stored locally on this device and never sent to our servers.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20"><Key size={18} /> Get API Key</a>
                    <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-600 transition-all"><ExternalLink size={18} /> Billing Docs</a>
                </div>
            </div>
        </section>
    </div>
  );

  const TABS = [
      { id: 'general', label: 'General', icon: Database },
      { id: 'appearance', label: 'Appearance', icon: Palette },
      { id: 'sync', label: 'Account & Sync', icon: Cloud },
      { id: 'ai', label: 'AI Config', icon: BrainCircuit },
  ];

  return (
    <div className="h-full flex">
      <aside className="w-52 bg-black/5 dark:bg-white/5 p-3 border-r border-white/20 dark:border-black/20">
        <nav className="space-y-1">
           {TABS.map(tab => (
             <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-left ${activeTab === tab.id ? 'bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
            </button>
           ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto bg-slate-50/30 dark:bg-transparent">
          {activeTab === 'general' && renderGeneralTab()}
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'sync' && renderSyncTab()}
          {activeTab === 'ai' && renderAiTab()}
      </main>
      <ConfirmationModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onConfirm={() => { setIsRestoreModalOpen(false); handleRestore(); }}
        title="Restore from Cloud"
        message="Are you sure? This will replace all your current local data with the data from your last cloud backup. This action cannot be undone."
        confirmText="Yes, Restore Data"
      />
    </div>
  );
};

export default Settings;
