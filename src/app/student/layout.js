"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function StudentLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    async function loadStudentProfile() {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          // Not authenticated — middleware should already redirect, but be safe
          router.replace("/login");
          return;
        }

        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Failed to load student profile:", profileError);
        }

        // Build profile with fallbacks from user_metadata
        const resolvedProfile = userProfile || {
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split("@")[0] || "Student",
          roll_number: user.user_metadata?.roll_number || "N/A",
          department: user.user_metadata?.department || "Engineering",
          year: user.user_metadata?.year || "1st Year",
          email: user.email,
          role: "student",
          photo_url: user.user_metadata?.photo_url || "",
        };

        setProfile(resolvedProfile);

        // Realtime subscription for instant avatar/name sync
        channel = supabase
          .channel(`profile-sync-${user.id}`)
          .on(
            "postgres_changes",
            {
              event: "UPDATE",
              schema: "public",
              table: "profiles",
              filter: `id=eq.${user.id}`,
            },
            (payload) => {
              if (payload.new) {
                setProfile(payload.new);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Student layout error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadStudentProfile();

    return () => {
      if (channel) {
        const supabase = createClient();
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  // Show a clean loading state while profile is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-brand-600 border-t-transparent animate-spin" />
          <p className="text-sm text-slate-500">Loading your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar navigation */}
      <Sidebar
        role="student"
        userProfile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          role="student"
          userProfile={profile}
          breadcrumb={["Student Portal"]}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
