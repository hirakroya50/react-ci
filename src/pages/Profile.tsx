import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Save, Loader2, User as UserIcon, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';

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
      toast.success('Profile updated!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
      </div>
    );
  }

  const fullName = `${profile.first_name} ${profile.last_name}`.trim();

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20 md:pt-28 pb-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--heading)]">Profile Settings</h1>
          <p className="text-[var(--text-muted)] text-sm md:text-base">Manage your personal information and preferences.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[var(--surface)] p-6 rounded-2xl border border-[var(--border)] shadow-sm text-center">
              <div className="flex justify-center mb-4">
                <Avatar 
                  name={fullName} 
                  email={user?.email} 
                  size="lg" 
                  className="w-24 h-24 text-2xl"
                />
              </div>
              <h2 className="text-lg font-bold text-[var(--heading)] truncate">{fullName || 'Nexus User'}</h2>
              <p className="text-xs text-[var(--text-muted)] mb-6 truncate">{user?.email}</p>
              <div className="pt-6 border-t border-[var(--border)] space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <Shield size={12} className="text-green-500" />
                  Account Verified
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[var(--surface)] p-6 md:p-8 rounded-2xl border border-[var(--border)] shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-[var(--accent)]">
                <UserIcon size={18} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Personal Details</h3>
              </div>
              
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm text-[var(--heading)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      value={profile.first_name}
                      onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                      placeholder="e.g. John"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm text-[var(--heading)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      value={profile.last_name}
                      onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 opacity-60">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    disabled
                    className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--bg2)] text-sm text-[var(--heading)] outline-none cursor-not-allowed"
                    value={user?.email || ''}
                  />
                  <p className="text-[10px] text-[var(--text-muted)] mt-1 italic">* Email cannot be changed</p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={updating}
                    className="btn btn-primary w-full md:w-auto h-[42px] flex items-center justify-center gap-2 px-8"
                  >
                    {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;