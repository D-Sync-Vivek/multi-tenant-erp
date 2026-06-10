import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { schoolAdminApi } from '../../services/schoolAdminApi';

export default function Settings() {
  // 1. State to hold your form data
  const [settings, setSettings] = useState({
    language: 'English (United States)',
    darkMode: false,
    pushNotifications: true,
    emailAlerts: true
  });
  
  const [isSaving, setIsSaving] = useState(false);

  // 2. Fetch initial settings when component loads
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await schoolAdminApi.getSettings();
        // Merge fetched data with our default state to prevent undefined errors
        if (data) {
          setSettings(prev => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Helper to handle input changes
  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  // 3. Save function triggered by the button
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await schoolAdminApi.updateSettings(settings);
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <MainLayout title="Account Settings">
      <div className="max-w-4xl mx-auto">
        <div className="grid gap-8">
          <section className="bg-surface-container-lowest p-8 rounded-lg shadow-[0px_12px_32px_rgba(11,28,48,0.06)]">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary-container" data-icon="tune">tune</span>
              <h3 className="text-xl font-bold">Preferences</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-3">
                <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest">Interface Language</label>
                <div className="relative">
                  <select 
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="w-full appearance-none bg-surface-container-low border-none rounded-md py-4 px-5 text-on-surface font-semibold focus:ring-2 focus:ring-surface-tint focus:bg-surface-container-lowest transition-all"
                  >
                    <option>English (United States)</option>
                    <option>Spanish (Espa&#xf1;ol)</option>
                    <option>French (Fran&#xe7;ais)</option>
                    <option>German (Deutsch)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="material-symbols-outlined text-on-surface-variant">expand_more</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 px-1">This will change the language of all navigation and labels.</p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-on-surface-variant uppercase tracking-widest">Appearance</label>
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-md">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant" data-icon="dark_mode">dark_mode</span>
                    <span className="font-semibold">Dark Mode</span>
                  </div>
                  <button 
                    onClick={() => handleChange('darkMode', !settings.darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.darkMode ? 'bg-primary' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-1'}`}/>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface-container-lowest p-8 rounded-lg shadow-[0px_12px_32px_rgba(11,28,48,0.06)]">
            <div className="flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary-container" data-icon="notifications_active">notifications_active</span>
              <h3 className="text-xl font-bold">Communication</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-start justify-between p-4 hover:bg-surface-container-low rounded-xl transition-all">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <span className="material-symbols-outlined text-secondary" data-icon="campaign">campaign</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Push Notifications</h4>
                    <p className="text-sm text-on-surface-variant">Get instant alerts for quiz results and class announcements.</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleChange('pushNotifications', !settings.pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.pushNotifications ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.pushNotifications ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
              <div className="flex items-start justify-between p-4 hover:bg-surface-container-low rounded-xl transition-all">
                <div className="flex gap-4">
                  <div className="mt-1">
                    <span className="material-symbols-outlined text-secondary" data-icon="mail">mail</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Email Alerts</h4>
                    <p className="text-sm text-on-surface-variant">Receive weekly performance summaries and parent updates.</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleChange('emailAlerts', !settings.emailAlerts)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${settings.emailAlerts ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.emailAlerts ? 'translate-x-6' : 'translate-x-1'}`}/>
                </button>
              </div>
            </div>
          </section>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-gradient-to-br from-primary to-primary-container p-8 rounded-lg text-white">
              <h4 className="text-xl font-bold mb-2">Need Academic Help?</h4>
              <p className="text-white/80 mb-6">Our support team is available 24/7 to assist with platform technicalities or learning roadblocks.</p>
              <button className="bg-white text-primary px-6 py-2 rounded-md font-bold text-sm shadow-sm hover:scale-105 transition-transform">Contact Support</button>
            </div>
            <div className="bg-surface-container-high p-8 rounded-lg border-2 border-white/50">
              <div className="flex items-center gap-2 text-primary font-bold mb-2">
                <span className="material-symbols-outlined" data-icon="verified_user" style={{ fontVariationSettings: `&apos` }}>verified_user</span>
                <span className="text-sm">Security</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">Your data is encrypted using institutional-grade protocols. Scholar ID verified.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 flex justify-end gap-4">
          <button className="px-8 py-3 text-primary font-bold text-sm hover:bg-surface-variant rounded-md transition-all">
            Cancel Changes
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-10 py-3 bg-gradient-to-br from-primary to-primary-container text-white font-bold text-sm rounded-md shadow-lg transition-transform ${isSaving ? 'opacity-70 cursor-not-allowed' : 'shadow-primary/20 hover:scale-105'}`}
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </MainLayout>
  );
}