import React, { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../components/AuthProvider';
import { Save, Loader2 } from 'lucide-react';
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
    <div className="min-h-screen bg-[var(--bg)] pt-24 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--heading)]">Profile Settings</h1>
          <p className="text-[var(--text-muted)]">Manage your personal information.</p>
        </header>

        <div className="bg-[var(--surface)] p-8 rounded-2xl border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[var(--border)]">
            <Avatar 
              name={fullName} 
              email={user?.email} 
              size="lg" 
            />
            <div>
              <p className="text-[var(--heading)] font-semibold text-lg">{fullName || user?.email}</p>
              <p className="text-sm text-[var(--text-muted)]">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--heading)]">First Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg2)] text-[var(--heading)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={profile.first_name}
                  onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-[var(--heading)]">Last Name</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--bg2)] text-[var(--heading)] outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  value={profile.last_name}
                  onChange={(e) => setProfile({ ...profile, last_name: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={updating}
              className="btn btn-primary w-full md:w-auto flex items-center justify-center gap-2"
            >
              {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Changes
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;