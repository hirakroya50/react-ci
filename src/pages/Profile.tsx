import React, { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../components/AuthProvider";
import {
  Save,
  Loader2,
  User as UserIcon,
  Shield,
  Mail,
  Calendar,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import Avatar from "../components/Avatar";
import { motion } from "framer-motion";

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    avatar_url: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, avatar_url")
          .eq("id", user?.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        if (data)
          setProfile({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            avatar_url: data.avatar_url || "",
          });
      } catch (error: any) {
        toast.error("Error loading profile");
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
      const { error } = await supabase.from("profiles").upsert({
        id: user?.id,
        ...profile,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));

      // Auto-save the avatar URL to the profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user?.id);

      if (updateError) throw updateError;

      toast.success("Avatar uploaded!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
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
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)] px-4 pb-12 pt-24 sm:px-6 md:pt-28">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.16),transparent_68%)]" />
      <div className="pointer-events-none absolute right-10 top-40 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <header className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-glass)] px-6 py-7 shadow-[var(--shadow-sm)] backdrop-blur-xl sm:px-8">
          <span className="inline-flex rounded-full border border-indigo-400/25 bg-indigo-500/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-indigo-400">
            Account
          </span>
          <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-[var(--heading)] md:text-4xl">
            Profile settings
          </h1>
          <p className="mt-2 text-base text-[var(--text-muted)]">
            Keep your workspace identity polished and up to date.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 xl:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4"
          >
            <div className="sticky top-28 rounded-[2rem] border border-[var(--border)] bg-[var(--surface-glass)] p-6 text-center shadow-[var(--shadow-sm)] backdrop-blur-xl sm:p-8">
              <div className="relative mb-6 inline-block">
                <Avatar
                  name={fullName}
                  email={user?.email}
                  url={profile.avatar_url}
                  size="xl"
                  className="shadow-xl shadow-indigo-500/15"
                />
                <label className="absolute -bottom-2 -right-2 rounded-xl border border-indigo-300/30 bg-indigo-600 p-2 text-white shadow-lg transition-transform hover:scale-105 cursor-pointer">
                  {uploading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                  />
                </label>
              </div>

              <h2 className="truncate px-2 text-2xl font-black tracking-[-0.02em] text-[var(--heading)]">
                {fullName || "Nexus Member"}
              </h2>
              <p className="mb-8 mt-2 truncate text-sm text-[var(--text-muted)]">{user?.email}</p>

              <div className="space-y-3 border-t border-[var(--border)] pt-5 text-left text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-glass-strong)] px-3 py-2.5">
                  <Shield size={15} className="text-indigo-500" />
                  Verified account
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-glass-strong)] px-3 py-2.5">
                  <Calendar size={15} className="text-indigo-500" />
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
            <div className="rounded-[2rem] border border-[var(--border)] bg-[var(--surface-glass)] p-6 shadow-[var(--shadow-sm)] backdrop-blur-xl sm:p-8 md:p-10">
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl border border-indigo-300/25 bg-indigo-500/10 p-2.5">
                  <UserIcon size={20} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.22em] text-[var(--heading)]">
                  Profile Information
                </h3>
              </div>

              <form onSubmit={handleUpdate} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-base font-medium text-[var(--heading)] outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                      value={profile.first_name}
                      onChange={(e) =>
                        setProfile({ ...profile, first_name: e.target.value })
                      }
                      placeholder="e.g. Alex"
                    />
                  </div>

                  <div className="space-y-2.5">
                    <label className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-5 py-3.5 text-base font-medium text-[var(--heading)] outline-none transition-all focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
                      value={profile.last_name}
                      onChange={(e) =>
                        setProfile({ ...profile, last_name: e.target.value })
                      }
                      placeholder="e.g. Vance"
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--text-muted)]">
                    Email Connection
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
                      size={18}
                    />
                    <input
                      type="email"
                      disabled
                      className="w-full cursor-not-allowed rounded-2xl border border-[var(--border)] bg-[var(--bg2)] py-3.5 pl-12 pr-5 text-base font-medium text-[var(--heading)] opacity-70"
                      value={user?.email || ""}
                    />
                  </div>
                  <p className="ml-1 mt-2 text-[11px] font-medium text-[var(--text-muted)]">
                    Your primary email is managed via Auth settings.
                  </p>
                </div>

                <div className="border-t border-[var(--border)] pt-5">
                  <button
                    type="submit"
                    disabled={updating}
                    className="inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-indigo-500 to-violet-500 px-6 text-base font-black text-white shadow-[0_16px_36px_rgba(99,102,241,0.28)] transition hover:-translate-y-0.5 disabled:opacity-60 md:w-auto"
                  >
                    {updating ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <Save size={20} />
                    )}
                    <span>Apply Changes</span>
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
