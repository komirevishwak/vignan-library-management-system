"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    async function loadAdminProfile() {
      try {
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        // Sync overdue statuses whenever an administrator loads the desk
        fetch("/api/sync-overdue", { method: "POST" }).catch(() => {});

        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Failed to load admin profile:", profileError);
        }

        // If user is not admin role, redirect to student dashboard
        if (userProfile && userProfile.role !== "admin") {
          router.replace("/student/dashboard");
          return;
        }

        const resolvedProfile = userProfile || {
          id: user.id,
          full_name: user.user_metadata?.full_name || "Administrator",
          email: user.email,
          role: "admin",
          department: "Library Administration",
          photo_url: user.user_metadata?.photo_url || "",
        };

        setProfile(resolvedProfile);

        // Realtime subscription for instant avatar/name sync
        channel = supabase
          .channel(`admin-profile-sync-${user.id}`)
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
        console.error("Admin layout error:", err);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    loadAdminProfile();

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
          <p className="text-sm text-slate-500">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Admin Sidebar */}
      <Sidebar
        role="admin"
        userProfile={profile}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <Header
          onOpenSidebar={() => setSidebarOpen(true)}
          role="admin"
          userProfile={profile}
          breadcrumb={["Admin Desk"]}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
