# Ordine — ptek

- **slug:** ptek
- **data ordine:** 2026-06-23
- **origine:** configuratore
- **stato:** online

## Richiesta del cliente (prompt / config)
```
{"azienda":"ptek","settore":"impianti","accento":"#FB923C","moduli_extra":["man","macchine","sites","zone","conti","pellet","turni"],"generato":"configuratore"}
```

## Smistamento (lo compila la Direzione)
- moduli **pronti** → Assemblaggio: man · macchine · sites · zone · conti · pellet (+ base: hub, cal, notes, notif, clients, emps)
- moduli **da creare** → Laboratorio: turni (promesso)
- accento: #FB923C

## Esito
- **stato:** online (push gestito dal main loop)
- cartella: `clienti/ptek/`
- link live: `https://yfy8b8j9jj-lgtm.github.io/modula/clienti/ptek/app.html`
- QA: **passata** — node --check OK su tutti i .js · 0 asset 404 · `turni` (promesso) assente da app.html/VIEWS/dispatcher · BRAND.name='ptek' · accento #FB923C iniettato in app.html · segnaposto Supabase/VAPID presenti → parte in modalità DEMO
- TODO aperti (confermati): Supabase (`__SUPABASE_URL__` / `__SUPABASE_ANON_KEY__`) · VAPID (`__VAPID_PUBLIC_KEY__`) · logo (`BRAND.logo='./logo.png'`) · modulo promesso **turni** (Laboratorio)
- note: app pronta nella struttura, in attesa di collegamento dati. Sblocco prioritario: 1) Supabase, 2) logo, 3) modulo turni.
