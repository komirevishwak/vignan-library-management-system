"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS } from "@/lib/utils";
import {
  Shield,
  User,
  Mail,
  Phone,
  Building,
  Camera,
  CheckCircle2,
  AlertCircle,
  Lock,
  KeyRound,
  ShieldCheck
} from "lucide-react";

export default function AdminProfilePage() {
  const [profile, setProfile] = useState({
    full_name: "",
    department: "",
    phone: "",
    photo_url: "",
  });
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Password update state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState(null);

  useEffect(() => {
    async function loadAdminProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          setEmail(user.email || "");
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (data) {
            setProfile(data);
          } else {
            setProfile({
              full_name: user.user_metadata?.full_name || "Library Administrator",
              department: user.user_metadata?.department || "Central Library Administration",
              phone: user.user_metadata?.phone || "",
              photo_url: user.user_metadata?.photo_url || "",
            });
          }
        } else {
          // Demo fallback
          setEmail("admin@college.edu");
          setProfile({
            full_name: "Dr. Sarah Jenkins",
            department: "Central Library Administration",
            phone: "+91 98765 43210",
            photo_url: "",
          });
        }
      } catch (err) {
        console.error("Admin profile load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadAdminProfile();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setMessage("Administrator profile updated in demo preview mode!");
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          department: profile.department,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setMessage("Admin details updated successfully.");
    } catch (err) {
      console.error("Admin profile update error:", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const ADMIN_AVATAR_PRESETS = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
  ];

  const handleApplyPhotoUrl = async (url) => {
    if (!url) return;
    setUploadingPhoto(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        await supabase
          .from("profiles")
          .update({ photo_url: url })
          .eq("id", user.id);

        await supabase.auth.updateUser({
          data: { photo_url: url }
        });
      }

      setProfile((prev) => ({ ...prev, photo_url: url }));
      setMessage("Administrator photo updated successfully!");
    } catch (err) {
      console.error("Apply admin photo error:", err);
      setError(err.message || "Failed to update profile picture.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      setError("Image size should be less than 3MB.");
      return;
    }

    setUploadingPhoto(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      let photoUrl = "";

      // Try uploading to Supabase Storage avatars bucket
      try {
        const fileExt = file.name.split(".").pop();
        const fileName = `admin-${user ? user.id : 'demo'}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, file, { upsert: true });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          photoUrl = publicUrlData?.publicUrl || "";
        }
      } catch (storageErr) {
        console.warn("Storage upload notice:", storageErr);
      }

      // Fallback to Data URL if storage bucket is not configured
      if (!photoUrl) {
        photoUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      }

      if (user) {
        // Update in profiles table
        await supabase
          .from("profiles")
          .update({ photo_url: photoUrl })
          .eq("id", user.id);

        // Update in auth user metadata
        await supabase.auth.updateUser({
          data: { photo_url: photoUrl }
        });
      }

      setProfile((prev) => ({ ...prev, photo_url: photoUrl }));
      setMessage("Administrator photo updated successfully!");
    } catch (err) {
      console.error("Admin photo upload error:", err);
      setError(err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage(null);
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);

    try {
      const supabase = createClient();
      const { error: pwdError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (pwdError) throw pwdError;

      setPasswordMessage("Admin master password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Admin password change error:", err);
      setError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Librarian & Admin Profile
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your administrator credentials, contact details, and account security.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card & Avatar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-slate-900 border-2 border-purple-500 overflow-hidden flex items-center justify-center text-white shadow-inner">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShieldCheck className="w-12 h-12 text-purple-400" />
              )}
            </div>

            <label className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full cursor-pointer shadow-md transition">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
            </label>
          </div>

          <h3 className="font-bold text-lg text-slate-900 mt-4">{profile.full_name || "Librarian"}</h3>
          <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 mt-1">
            Library Administrator
          </span>
          <p className="text-xs text-slate-500 mt-2">{profile.department || "Central Library"}</p>

          {/* Quick Avatar Presets */}
          <div className="w-full mt-4 pt-4 border-t border-slate-100">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">
              Choose Admin Avatar
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              {ADMIN_AVATAR_PRESETS.map((presetUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPhotoUrl(presetUrl)}
                  disabled={uploadingPhoto}
                  className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 hover:border-purple-500 hover:scale-110 transition shadow-sm"
                  title={`Admin avatar option ${idx + 1}`}
                >
                  <img src={presetUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="w-full mt-4 pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-slate-500">
            <div className="flex items-center justify-between">
              <span>Role:</span>
              <span className="font-semibold text-purple-700">Master Admin</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Privileges:</span>
              <span className="font-semibold text-slate-800">Issue / Return / Stock Control</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600" />
              Personal & Official Information
            </h3>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Official Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Designation / Department
                  </label>
                  <input
                    type="text"
                    value={profile.department || ""}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    placeholder="e.g. Chief Librarian"
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/30 transition disabled:opacity-60"
                >
                  {saving ? "Saving Changes..." : "Save Admin Profile"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-700" />
              Change Admin Password
            </h3>

            {passwordMessage && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-semibold">
                {passwordMessage}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    New Master Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition disabled:opacity-60"
                >
                  {passwordSaving ? "Updating..." : "Update Master Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
