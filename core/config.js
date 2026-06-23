/* ===== MODULA · CONFIG BACKEND CONDIVISO =====
   UNA sola coppia di credenziali per TUTTA la piattaforma (tutte le aziende).
   La anon key e' pubblica per design (l'isolamento dei dati lo fa la RLS lato server).
   Compilare DOPO aver creato il progetto Supabase ed eseguito supabase/schema.sql.

   Finche' restano i segnaposto __..__ l'app parte in modalita' DEMO (nessun backend). */
window.MODULA_CONFIG = {
  SUPABASE_URL: '__SUPABASE_URL__',        /* es. https://xxxx.supabase.co */
  SUPABASE_ANON_KEY: '__SUPABASE_ANON_KEY__', /* chiave pubblica anon/publishable */
  VAPID_PUBLIC: '__VAPID_PUBLIC_KEY__'     /* push notifiche (una per la piattaforma) */
};
