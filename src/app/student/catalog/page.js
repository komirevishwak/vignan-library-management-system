"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StudentCatalogPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/digital-books");
  }, [router]);

  return null;
}
