/* ===== MODULA · CONFIG BACKEND CONDIVISO =====
   UNA sola coppia di credenziali per TUTTA la piattaforma (tutte le aziende).
   La anon key e' pubblica per design (l'isolamento dei dati lo fa la RLS lato server).
   Compilare DOPO aver creato il progetto Supabase ed eseguito supabase/schema.sql.

   Finche' restano i segnaposto __..__ l'app parte in modalita' DEMO (nessun backend). */
window.MODULA_CONFIG = {
  SUPABASE_URL: 'https://hdhaptzsgkpdhuelwede.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_qGJfbDU2EKSBMl6pzY__CQ_ifsB4UGA',
  VAPID_PUBLIC: '__VAPID_PUBLIC_KEY__',    /* push notifiche — da configurare piu' avanti */
  /* Indirizzo dove arrivano le richieste moduli inviate dai titolari DALL'app.
     Le legge la Fabbrica (vedi FABBRICA/POSTA.md) e instrada attivazioni / moduli su misura. */
  SUPPORT_EMAIL: 'lollyberry00@gmail.com'
};
