import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Save, Loader2, User as UserIcon, Shield, Mail, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import { motion } from 'framer-motion';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user?.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        if (data) setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        });
      } catch (error: any) {
        toast.error('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profile,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <Loader2 className="animate-spin text-[var(--accent)]" size={40} />
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <div className="min-h-screen bg-[var(--bg2)] pt-24 md:pt-32 pb-12 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-black text-[var(--heading)] tracking-tight">Account Settings</h1>
          <p className="text-[var(--text-muted)] mt-2 text-lg">Manage your digital presence and workspace profile.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div className="bg-[var(--surface)] p-8 rounded-3xl border border-[var(--border)] shadow-sm text-center">
              <div className="relative inline-block mb-6">
                <Avatar 
                  name={fullName} 
                  email={user?.email} 
                  size="lg" 
                  className="w-28 h-28 text-3xl shadow-xl shadow-indigo-500/10"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-4 border-[var(--surface)] rounded-full" />
              </div>
              <h2 className="text-xl font-bold text-[var(--heading)] truncate px-2">
                {fullName || 'Nexus Member'}
              </h2>
              <p className="text-sm text-[var(--text-muted)] mb-8 truncate opacity-80">{user?.email}</p>
              
              <div className="space-y-4 pt-6 border-t border-[var(--border)] text-left">
                <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  <Shield size={16} className="text-indigo-500" />
                  Verified Account
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                  <Calendar size={16} className="text-indigo-500" />
                  Member since 2024
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8"
          >
            <div className="bg-[var(--surface)] p-6 md:p-10 rounded-3xl border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl">
                  <UserIcon size={20} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--heading)]">Profile Information</h3>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">First Name</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg2)] text-base font-medium text-[var(--heading)] outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      placeholder="e.g. Alex"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-5 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg2)] text-base font-medium text-[var(--heading)] outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      placeholder="e.g. Vance"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Email Connection</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-50" size={18} />
                    <input
                      type="email"
                      disabled
                      className="w-full pl-12 pr-5 py-3 rounded-2xl border border-[var(--border)] bg-[var(--bg2)] text-base font-medium text-[var(--heading)] opacity-60 cursor-not-allowed"
                      value={user?.email || ''}
                    />
                  </div>
                  <p className="text-[10px] text-[var(--text-muted)] font-medium italic mt-2 ml-1">🔒 Your primary email is managed via Auth settings.</p>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary w-full md:w-auto min-w-[160px] h-[52px] shadow-xl shadow-indigo-500/20"
                  >
                    {updating ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    <span className="text-base">Apply Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;