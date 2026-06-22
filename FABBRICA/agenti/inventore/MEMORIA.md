# MEMORIA — l'Inventore

Quaderno append-only. **Prima** di costruire lo leggo; **dopo** ci lascio la ricetta.

## Coda moduli da costruire (da MANIFEST.inArrivo)
prenota · magazzino · catalogo · fatture · documenti · report · fidelity · turni

## Ricetta-base "nuovo modulo" (di partenza)
1. Crea la cartella/file (in `modules-extra/<id>/<id>.js`, oppure root se ha asset propri come macchine/zone).
2. Scrivi `function render<Nome>(){ ... }` che dipinge in `#main` usando gli helper del core (`esc`, `S`, `save`, ecc.).
3. Registra: voce in `VIEWS`, coppia nel dispatcher `R`, riga nel `MANIFEST.extra`, e `stato:'pronto'` nel catalogo.
4. Se ha dati propri: aggiungi la tabella nello stato `S` (`blank()`), in `MAPS`, `TBL`, `UP_ORDER`/`DEL_ORDER`.
5. Solo struttura + segnaposto: nessun dato reale.

## Trabocchetti noti
- Gli `id` devono combaciare in catalogo, MANIFEST, VIEWS e dispatcher: un disallineamento = menù rotto.
- Funzioni render globali (niente moduli ES): si caricano via `<script>` in `app.html` dopo il core.

## Ricette dei moduli costruiti (cresce ad ogni modulo)
<!-- formato: ### <modulo> [AAAA-MM-GG] → passi specifici + cosa è andato storto -->
_(ancora vuoto)_
