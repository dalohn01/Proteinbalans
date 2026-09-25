# Proteinbalans

Visualiserar hur olika livsmedel täcker dagsbehovet av protein. Dra in
livsmedel från listan till höger – cirklarna till vänster fylls, där varje
cirkel är 1 % av dagsmålet (100 cirklar + 30 för överskott).

## Kör lokalt

Dubbelklicka på `index.html`. Inget behöver installeras.

## Struktur

- `index.html` – sidans struktur
- `css/style.css` – utseende
- `js/app.js` – logik (beräkningar, rutnät, dra och släpp). Inställningar
  (antal cirklar, fyllnadsriktning, g protein per kg) finns i `CONFIG` överst.
- `data/foods.js` – livsmedel och kategorier

## Data

Proteinvärden per 100 g kommer från Livsmedelsverkets livsmedelsdatabas
(API v1, dataversion 2026-06-29). Varje livsmedel har `slv` (nummer i
databasen) och `slvName` så att värdet går att spåra. Portionsstorlekar är
egna, ungefärliga standardportioner. Proteinpulver och färdiga proteinshakes
finns inte i databasen och är markerade med `source: "typvärde"`.

Dagsmålet räknas ut som kroppsvikt × 1,2 g protein.

## Publicera

Repot kan publiceras gratis med GitHub Pages (Settings → Pages → Deploy from
branch → `main` / root).
