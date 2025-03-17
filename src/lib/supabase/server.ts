import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./database.types";

export const createClient = async (cookieStore: ReturnType<typeof cookies>) => {
  const cookieData = await cookieStore;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieData.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieData.set({ name, value, ...options });
          } catch (error: unknown) {
            console.error("Error setting cookie:", error);
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieData.set({ name, value: "", ...options });
          } catch (error: unknown) {
            console.error("Error removing cookie:", error);
          }
        },
      },
    }
  );
};
