import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Отсутствие ключей на этапе разработки — частая причина непонятных ошибок сети, поэтому падаем сразу с понятным сообщением
  throw new Error(
    'Отсутствуют переменные окружения VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (см. app/.env.example)'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
