# CONSEGNA — ptek

- **Azienda:** ptek
- **Slug:** ptek
- **Settore:** impianti
- **Accento:** `#FB923C` (override di `--cy`, iniettato in `app.html` dopo `core.css`)
- **Data assemblaggio:** 2026-06-23
- **Origine:** configuratore
- **Link live (dopo push):** https://yfy8b8j9jj-lgtm.github.io/modula/clienti/ptek/app.html

## Moduli inclusi (assemblati)
**Base (sempre presenti):**
- ⚡ Hub
- 📅 Calendario
- 📝 Note
- 🔔 Notifiche
- 👥 Clienti
- 👷 Personale

**Extra scelti (tutti pronti):**
- 🔧 Manut. (`man`)
- 🪵 Pellet (`pellet`)
- 🏗 Cantieri (`sites`)
- ⚙️ Macchine (`macchine` — file in root)
- 🗺️ Zone (`zone` — file in root + Leaflet; ordine js: leaflet → zone-data → zone; `ZONE_CENTER` definito)
- 💰 Conti (`conti`)

## Moduli promessi — da costruire (Laboratorio)
- **turni** — richiesto dal cliente ma non ancora disponibile. Sarà costruito dall'Inventore e aggiunto in un secondo momento. NON presente in questa consegna.

## TODO aperti
- [ ] **Supabase:** sostituire `__SUPABASE_URL__` e `__SUPABASE_ANON_KEY__` in `core/core.js` con il progetto del cliente. Finché sono segnaposto l'app parte in **modalità DEMO** (dati di esempio, nessun backend).
- [ ] **VAPID:** sostituire `__VAPID_PUBLIC_KEY__` in `core/core.js` per le notifiche push.
- [ ] **Logo:** caricare `clienti/ptek/logo.png` e impostare `BRAND.logo='./logo.png'` in `core/core.js` (ora vuoto = mostra solo il nome).
- [ ] **turni:** integrare il modulo quando il Laboratorio lo consegna.

## Note tecniche
- `BRAND.name = 'ptek'`, `BRAND.tagline = 'impianti'`.
- VIEWS e dispatcher di `core/core.js` contengono esattamente i moduli inclusi (nessuna voce orfana, nessun `render*` mancante — verificato).
- Verifica eseguita: `node --check` su tutti i .js OK; tutti i 24 asset restituiscono 200 sul server di preview; zero 404.
