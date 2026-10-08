"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useRealtimeRefresh } from "@/lib/useRealtimeRefresh";

export default function StudentLayout({ children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadStudentProfile() {
    {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          // If in demo or no auth, use fallback student profile
          setProfile({
            full_name: "Student Member",
            roll_number: "21CS042",
            department: "Computer Science & Engineering",
            year: "3rd Year",
            role: "student",
          });
          setLoading(false);
          return;
        }

        const { data: userProfile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        setProfile(userProfile || {
          full_name: user.user_metadata?.full_name || "Student Member",
          roll_number: user.user_metadata?.roll_number || "N/A",
          department: user.user_metadata?.department || "Engineering",
          role: "student",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    }

  }

  useEffect(() => {
    loadStudentProfile();
  }, []);

  // If the librarian deactivates this account, sign the student out right away
  useRealtimeRefresh(["profiles"], async () => {
    await loadStudentProfile();
  });

  useEffect(() => {
    if (profile && profile.is_active === false) {
      const supabase = createClient();
      supabase.auth.signOut().finally(() => {
        router.push("/login");
        router.refresh();
      });
    }
  }, [profile, router]);

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
