import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gzwyoyjtmrtrnyqdmykj.supabase.co";
const supabaseKey = "sb_publishable_MZXFSObD-FKFRmP73B_KrQ_D_v4rz3Q";

export const supabase = createClient(supabaseUrl, supabaseKey);


