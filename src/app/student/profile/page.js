"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { DEPARTMENTS, STUDY_YEARS } from "@/lib/utils";
import {
  User,
  Mail,
  Phone,
  Hash,
  Building,
  GraduationCap,
  Upload,
  CheckCircle2,
  AlertCircle,
  Lock,
  Camera,
  Shield
} from "lucide-react";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState({
    full_name: "",
    roll_number: "",
    department: "",
    year: "",
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
    async function loadProfile() {
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
              full_name: user.user_metadata?.full_name || "",
              roll_number: user.user_metadata?.roll_number || "",
              department: user.user_metadata?.department || DEPARTMENTS[0],
              year: user.user_metadata?.year || STUDY_YEARS[0],
              phone: user.user_metadata?.phone || "",
              photo_url: user.user_metadata?.photo_url || "",
            });
          }
        } else {
          // Demo fallback
          setEmail("student@college.edu");
          setProfile({
            full_name: "Alex Johnson",
            roll_number: "21CS042",
            department: "Computer Science & Engineering",
            year: "3rd Year",
            phone: "+91 98765 43210",
            photo_url: "",
          });
        }
      } catch (err) {
        console.error("Profile load error:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
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
        setMessage("Profile updated successfully in demo mode!");
        setSaving(false);
        return;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          department: profile.department,
          year: profile.year,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setMessage("Profile details successfully updated.");
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setError(null);

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        // Create a local object URL for demo mode
        const previewUrl = URL.createObjectURL(file);
        setProfile((prev) => ({ ...prev, photo_url: previewUrl }));
        setMessage("Photo updated in demo preview mode!");
        setUploadingPhoto(false);
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const photoUrl = publicUrlData.publicUrl;

      // Update in profiles table
      await supabase
        .from("profiles")
        .update({ photo_url: photoUrl })
        .eq("id", user.id);

      setProfile((prev) => ({ ...prev, photo_url: photoUrl }));
      setMessage("Profile photo updated successfully!");
    } catch (err) {
      console.error("Photo upload error:", err);
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

      setPasswordMessage("Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password change error:", err);
      setError(err.message || "Failed to change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Student Profile & Credentials
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal details, college affiliation, and account security.
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
            <div className="w-28 h-28 rounded-full bg-slate-100 border-2 border-brand-500 overflow-hidden flex items-center justify-center text-slate-400 shadow-inner">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-slate-400" />
              )}
            </div>

            <label className="absolute bottom-0 right-0 p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-full cursor-pointer shadow-md transition">
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

          <h3 className="font-bold text-lg text-slate-900 mt-4">{profile.full_name || "Student"}</h3>
          <span className="text-xs font-mono font-semibold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200 mt-1">
            Roll: {profile.roll_number || "N/A"}
          </span>
          <p className="text-xs text-slate-500 mt-2">{profile.department}</p>
          <p className="text-xs text-slate-400">{profile.year}</p>

          <div className="w-full mt-6 pt-4 border-t border-slate-100 text-left text-xs space-y-2 text-slate-500">
            <div className="flex items-center justify-between">
              <span>Account Status:</span>
              <span className="font-semibold text-emerald-600">Active Member</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Borrow Limit:</span>
              <span className="font-semibold text-slate-800">3 Books</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-brand-600" />
              Personal Information
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
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Roll Number (Read-only)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile.roll_number || ""}
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Department
                  </label>
                  <select
                    value={profile.department || DEPARTMENTS[0]}
                    onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Year of Study
                  </label>
                  <select
                    value={profile.year || STUDY_YEARS[0]}
                    onChange={(e) => setProfile({ ...profile, year: e.target.value })}
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {STUDY_YEARS.map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={profile.phone || ""}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-100 text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-600/30 transition disabled:opacity-60"
                >
                  {saving ? "Saving Changes..." : "Save Profile Details"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-slate-700" />
              Change Password
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
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1 block w-full px-3.5 py-2 border border-slate-300 rounded-xl text-sm bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition disabled:opacity-60"
                >
                  {passwordSaving ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
