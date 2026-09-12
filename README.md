# ARITMETICA! — PWA v0.3.0

Laboratorio aritmetico componibile in sviluppo incrementale.

## File da caricare su GitHub
Caricare nella **root** della repository:
- `index.html`
- `styles.css`
- `app.js`
- `manifest.webmanifest`
- `service-worker.js`
- la cartella `icons` con i quattro PNG al suo interno

> Come per le altre PWA, crea prima la cartella `icons` nella repository e poi carica al suo interno i singoli file.

## Funzioni presenti
- massimo 20 elementi;
- D20 frazioni, D6 operazioni, D6 confronto, D8 misto e D12 matematico;
- cilindri 0–9, operazioni, confronto, relazioni e relazioni complete (=, ≠, ≈, >, ≥, <, ≤);
- linea di frazione ridimensionabile;
- COMPOSIZIONE/GIOCO;
- trascinamento libero e magnete di allineamento;
- tap = estrazione casuale;
- cilindro: trascinamento verticale = scelta manuale;
- pressione lunga = congela/sblocca il risultato;
- MESCOLA TUTTO con arresti sfalsati;
- Adatta/Disponi automaticamente;
- modalità Giorno/Notte;
- audio sintetizzati disattivabili;
- timer 30 s, 1 min, 2 min, 5 min e personalizzato;
- Ultimo tavolo automatico;
- Salva/Carica configurazioni;
- Esporta/Importa JSON;
- fullscreen;
- orientamento landscape.

## Nota tecnica sui dadi 3D
La scena usa Three.js tramite modulo CDN. Il service worker tenta di memorizzare anche il modulo 3D durante l'installazione, oltre ai file locali. La prima apertura richiede comunque connessione a Internet.

## Pubblicazione GitHub Pages
1. Crea una nuova repository (nome provvisorio suggerito: `aritmetica`).
2. Carica i file mantenendo la struttura.
3. Settings → Pages → **Deploy from a branch**.
4. Branch `main`, cartella `/(root)`.
5. Apri il sito almeno una volta online; poi puoi installarlo come PWA.

## Cache
La cache corrente è `aritmetica-v0.3.0`. A ogni aggiornamento importante conviene incrementare la versione nel `service-worker.js`.

## Stato del progetto
È una prima build funzionale pensata per essere affinata per step. In particolare grafica, fisica/animazione dei dadi, audio e dettagli responsive potranno essere regolati dopo la prova reale su laptop/iPad/iPhone.


NOVITÀ v0.2.0
- HOME più evidente e colorata nella barra del tavolo.
- Dadi: la faccia estratta termina frontale e perfettamente orientata, senza rotazioni finali ambigue dei simboli.
- Corretto il pannello + ELEMENTI: può essere chiuso e riaperto liberamente in COMPOSIZIONE.
- Aggiunta finestra ISTRUZIONI / CREDITI (pulsante i dalla Home e dal tavolo).
- Aggiunto elemento grafico luminoso =?, trascinabile, duplicabile ed eliminabile.


NOVITÀ v0.3.0
- D20 frazioni: la faccia estratta resta luminosa; le altre facce vengono attenuate per evitare confusione visiva.
- Nuovo D12 dodecaedrico: +, −, ×, :, ^, √, =, >, <, ≈, ≠, ★ (Jolly).
- Nuovo cilindro “Relazioni complete”: =, ≠, ≈, >, ≥, <, ≤.
