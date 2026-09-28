import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://ecobrycdzpcllmnrgoqn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_6uLKJCZ6xendwx_tAVMj1g_BwnCaKdK';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
