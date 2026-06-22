# Mappa progetto Modula — fonte per rigenerare il widget

Questa è la **mappa concettuale interattiva** del progetto Modula, da mostrare come widget in chat
(tool `show_widget` di visualize). L'utente la tiene fissata in una chat dedicata.

**Come rigenerarla:** quando l'utente la chiede ("rigenera/aggiorna la mappa"), aggiornare i DATI qui sotto
allo stato corrente del progetto e ri-emettere il widget con `show_widget` (title: `mappa_progetto_modula`).
Vincoli widget visualize: niente emoji (icone Tabler `ti-*`), niente `position:fixed`, colori via CSS vars
del host, font-weight 400/500, contenitore 680px. Vedi codice in fondo.

## DATI (aggiornare a ogni avanzamento)

Hub centrale: **Modula** — "gestionali su misura".

Base URL live: `https://yfy8b8j9jj-lgtm.github.io/modula`

### Sezioni (rami dall'hub)
**Sito & vendita**
- Landing — "Vetrina pubblica di Modula" — stato: online — `/` 
- Configuratore — "Il cliente compone la sua app" — stato: online — `/configuratore/`

**App del cliente**
- App personalizzata — "Il gestionale interno" — stato: template — `/app.html`
- Portale clienti — "I clienti finali prenotano" — stato: online — `/portale/`
- Mini sito azienda — "Vetrina pubblica del cliente" — stato: scheletro — `/mini-sito/`

**Fabbrica (qui su Claude)**
- Fabbrica Modula — "Assemblaggio app qui su Claude" — stato: strutturata — `/FABBRICA/`
  - hub `/FABBRICA/index.html` → 4 reparti, ognuno con un agente che si auto-migliora (livelli veri)
  - **flusso ordine:** config → 🧭 Dirigenza smista → 🛠 Assemblaggio (moduli pronti) + 🧪 Laboratorio (da creare) → app → 🔄 Conversione dati (opz.)
  - **Direzione** (il Direttore · `direzione.html`): ENTRATA — accetta la config, classifica i moduli e smista (genera i prompt per Assemblaggio e Laboratorio); poi registro clienti, stato, TODO, QA
  - **Assemblaggio** (l'Assemblatore · `assemblaggio.html`): console config→app · MANIFEST.js + RICETTA.md
  - **Laboratorio** (l'Inventore · `laboratorio.html`): riceve i moduli "da creare", Loris contatta l'azienda e li costruisce → pronto
  - **Conversione** (il Convertitore · `conversione.html`): opzionale, su scelta cliente — converte i file del vecchio gestionale → formato Modula (skill `importa-dati`)
  - agenti reali in `.claude/agents/` (fabbrica-assemblatore/direttore/inventore/convertitore); quaderni in `FABBRICA/agenti/<id>/`
  - import dati: skill `importa-dati` (adattata da ptek) → file `modula-import.json`; l'app (core.js) accetta modula-import e il vecchio ptek-import
  - output app cliente in `/clienti/<slug>/` (sottocartella, online sotto /modula/clienti/)

### Resoconto
Fatto: landing+effetti · hosting GitHub Pages · brand "Modula" definitivo · color picker per-azienda ·
portale clienti · scheletro mini-sito · Fabbrica strutturata (manifest+ricetta).
Prossimo: assemblare il primo cliente · script generatore (opzione B) quando i clienti crescono.
Rimandato: dominio personalizzato.

### Nuovi arrivi
Fabbrica Modula (assemblaggio Claude-driven) · Accento colore per-azienda · Portale prenotazioni · Mini sito.

## Stati → colori pill
online/pronto/template = success (verde) · scheletro = warning (ambra) · da fare/da strutturare = neutro.

---

## CODICE WIDGET (snapshot — ri-emettere via show_widget, aggiornando i dati sopra)

Il codice completo del widget è quello usato nella sessione del 2026-06-22 (chat dedicata).
Struttura: hub Modula centrato → SVG che disegna frecce verso 3 colonne (`[data-branch]`) →
card-link per ogni sezione (`.mk-node`, aprono gli URL live) → due pannelli "Resoconto" e
"Nuovi arrivi" → legenda stati. Connettori disegnati in JS da `#mk-map`/`#mk-svg` con ResizeObserver.
Per rigenerare: ricostruire l'HTML dai DATI qui sopra seguendo questa struttura.
