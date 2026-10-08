"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let channel;

    async function loadAdminProfile() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          setProfile({
            full_name: "Chief Librarian",
            role: "admin",
            department: "Central Library Administration",
          });
          setLoading(false);
          return;
        }

        // Keep overdue statuses current whenever an administrator opens the desk.
        await fetch("/api/sync-overdue", { method: "POST" });

        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        setProfile(userProfile || {
          full_name: user.user_metadata?.full_name || "Chief Librarian",
          role: "admin",
          department: "Library Administration",
          photo_url: user.user_metadata?.photo_url || "",
        });

        // Realtime subscription for instant avatar/name sync
        channel = supabase
          .channel(`admin-profile-sync-${user.id}`)
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${user.id}` },
            (payload) => {
              if (payload.new) {
                setProfile(payload.new);
              }
            }
          )
          .subscribe();
      } catch (err) {
        console.error("Failed to load admin profile:", err);
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
  }, []);

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
