
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://nnpdildjfmwljlpnrkeb.supabase.co";
const supabaseKey = "sb_publishable_Pz4cHi7gIJmZVr9Ngjzubg_2AQzhznf";

export const supabase = createClient(supabaseUrl, supabaseKey);
