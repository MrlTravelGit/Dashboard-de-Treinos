import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Faltam as variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY");
}

const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = supabaseClient;
export default supabaseClient;
