"use client";

import { useAuth as useWorkOSAuth } from "@workos-inc/authkit-nextjs/components";

export function useAuth() {
  return useWorkOSAuth();
}
