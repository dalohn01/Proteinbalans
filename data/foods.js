// Livsmedelsdata för Proteinbalans.
//
// Proteinvärden (g per 100 g ätlig del) kommer från Livsmedelsverkets
// livsmedelsdatabas (API v1, dataversion 2026-06-29). `slv` är livsmedlets
// nummer i databasen och `slvName` dess namn där, så att värdet går att spåra.
//
// Portionsstorlek (`grams` + beskrivningen `portion`) – källan anges i
// `portionSource`:
//   "slv"    – portionsvikten i Livsmedelsverkets livsmedelsdatabas
//              (valet "Portion" i Sök näringsinnehåll).
//   "pm2024" – Livsmedelsverkets PM 2024 "Volymvikter, viktförändringsfaktorer
//              och avfall" (vikt per dl/msk).
//   "egen"   – egen standardportion. Används där Livsmedelsverket saknar
//              portion, eller där deras portion inte passar (t.ex. fläskfilé
//              20 g = en skiva).
// Beskrivningstexten (`portion`) är alltid vår egen.
//
// Poster med `source: "typvärde"` finns inte i Livsmedelsverkets databas
// (t.ex. proteinpulver) och använder ungefärliga typvärden för produktgruppen.
//
// Sammansatta livsmedel (t.ex. ostsmörgås) anger `ingredients` i stället för
// `proteinPer100g`; proteinet räknas då fram från ingredienserna.
//
// Filen är .js (inte .json) så att sidan fungerar även när index.html öppnas
// direkt från disken.

window.CATEGORIES = [
  { id: "alla", label: "Alla" },
  { id: "vaxt", label: "Växtbaserat" },
  { id: "mejeri", label: "Mejeri & ägg" },
  { id: "kott-fisk", label: "Kött & fisk" },
  { id: "drycker", label: "Proteindrycker" },
];

window.FOODS = [
  // ── Kött & fisk ──────────────────────────────────────────────
  { id: "kycklingfile", name: "Kycklingfilé", category: "kott-fisk", portion: "100 g (stekt)", grams: 100, portionSource: "slv", proteinPer100g: 23.0, emoji: "🍗", slv: 1170, slvName: "Kyckling bröstfilé färsk stekt u. skinn" },
  { id: "kalkonpalagg", name: "Kalkonpålägg", category: "kott-fisk", portion: "2 skivor (20 g)", grams: 20, portionSource: "slv", proteinPer100g: 18.3, emoji: "🦃", slv: 6009, slvName: "Kalkon rökt tunna skivor" },
  { id: "notfars", name: "Nötfärs", category: "kott-fisk", portion: "100 g (stekt)", grams: 100, portionSource: "slv", proteinPer100g: 25.0, emoji: "🥩", slv: 2101, slvName: "Nöt färs fett 10% stekt m. salt" },
  { id: "ryggbiff", name: "Ryggbiff", category: "kott-fisk", portion: "85 g (stekt)", grams: 85, portionSource: "slv", proteinPer100g: 25.5, emoji: "🥩", slv: 1014, slvName: "Nöt ryggbiff stekt" },
  { id: "flaskfile", name: "Fläskfilé", category: "kott-fisk", portion: "125 g (stekt)", grams: 125, portionSource: "egen", proteinPer100g: 24.6, emoji: "🍖", slv: 1023, slvName: "Gris fläskfilé skiva stekt" },
  { id: "algfars", name: "Älgfärs", category: "kott-fisk", portion: "125 g (stekt)", grams: 125, portionSource: "egen", proteinPer100g: 27.6, emoji: "🦌", slv: 3621, slvName: "Älg färs stekt m. salt" },
  { id: "lax", name: "Lax", category: "kott-fisk", portion: "130 g (stekt)", grams: 130, portionSource: "slv", proteinPer100g: 24.1, emoji: "🐟", slv: 1316, slvName: "Lax stekt m. salt" },
  { id: "torsk", name: "Torsk", category: "kott-fisk", portion: "125 g (stekt)", grams: 125, portionSource: "slv", proteinPer100g: 25.2, emoji: "🐟", slv: 1337, slvName: "Torsk stekt" },
  { id: "tonfisk", name: "Tonfisk i vatten", category: "kott-fisk", portion: "1 burk (120 g)", grams: 120, portionSource: "egen", proteinPer100g: 24.1, emoji: "🥫", slv: 1278, slvName: "Tonfisk i vatten konserv. avrunnen" },
  { id: "rakor", name: "Räkor", category: "kott-fisk", portion: "100 g skalade", grams: 100, portionSource: "slv", proteinPer100g: 17.6, emoji: "🦐", slv: 1395, slvName: "Räka kokt" },
  { id: "skinka", name: "Skinkpålägg", category: "kott-fisk", portion: "15 g", grams: 15, portionSource: "slv", proteinPer100g: 18.4, emoji: "🍖", slv: 1010, slvName: "Gris skinka skivad rökt fett 1-3%" },
  { id: "bacon", name: "Bacon", category: "kott-fisk", portion: "50 g (stekt)", grams: 50, portionSource: "slv", proteinPer100g: 26.6, emoji: "🥓", slv: 1523, slvName: "Gris bacon stekt mager" },
  { id: "kallrokt-lax", name: "Kallrökt lax", category: "kott-fisk", portion: "50 g", grams: 50, portionSource: "egen", proteinPer100g: 20.0, emoji: "🐟", slv: 1269, slvName: "Lax kallrökt" },

  // ── Mejeri & ägg ─────────────────────────────────────────────
  { id: "agg", name: "Ägg", category: "mejeri", portion: "1 st (kokt)", grams: 50, portionSource: "slv", proteinPer100g: 12.1, emoji: "🥚", slv: 2205, slvName: "Ägg kokt" },
  { id: "kvarg", name: "Kvarg", category: "mejeri", portion: "250 g", grams: 250, portionSource: "slv", proteinPer100g: 10.0, emoji: "🥣", slv: 3243, slvName: "Kvarg naturell fett 0,2%" },
  { id: "keso", name: "Keso / cottage cheese", category: "mejeri", portion: "100 g", grams: 100, portionSource: "slv", proteinPer100g: 13.4, emoji: "🥣", slv: 70, slvName: "Färskost cottage cheese naturell fett 4%" },
  { id: "grekisk-yoghurt", name: "Grekisk yoghurt 0 %", category: "mejeri", portion: "200 g", grams: 200, portionSource: "slv", proteinPer100g: 9.1, emoji: "🥣", slv: 7146, slvName: "Yoghurt smaksatt m. sötningsm. fett 0% typ grekisk yoghurt" },
  { id: "yoghurt", name: "Yoghurt naturell", category: "mejeri", portion: "2 dl", grams: 200, portionSource: "slv", proteinPer100g: 3.4, emoji: "🥣", slv: 124, slvName: "Yoghurt naturell fett 3% berikad" },
  { id: "filmjolk", name: "Filmjölk", category: "mejeri", portion: "2 dl", grams: 200, portionSource: "slv", proteinPer100g: 3.3, emoji: "🥛", slv: 114, slvName: "Filmjölk fett 3% berikad" },
  { id: "mjolk", name: "Mjölk", category: "mejeri", portion: "2 dl", grams: 200, portionSource: "slv", proteinPer100g: 3.6, emoji: "🥛", slv: 150, slvName: "Mellanmjölk fett 1,5% berikad" },
  { id: "hardost", name: "Ost", category: "mejeri", portion: "15 g", grams: 15, portionSource: "slv", proteinPer100g: 26.2, emoji: "🧀", slv: 96, slvName: "Ost hårdost fett 28%" },
  { id: "parmesan", name: "Parmesan", category: "mejeri", portion: "15 g", grams: 15, portionSource: "egen", proteinPer100g: 31.1, emoji: "🧀", slv: 103, slvName: "Ost hårdost parmesan fett 30% typ Parmiggiano Reggiano" },
  { id: "halloumi", name: "Halloumi", category: "mejeri", portion: "75 g (stekt)", grams: 75, portionSource: "egen", proteinPer100g: 23.6, emoji: "🧀", slv: 2899, slvName: "Ost halloumi stekt eller grillad" },
  { id: "mozzarella", name: "Mozzarella", category: "mejeri", portion: "½ kula (60 g)", grams: 60, portionSource: "egen", proteinPer100g: 15.6, emoji: "🧀", slv: 2255, slvName: "Ost mozzarella fett 18%" },
  {
    // Ingrediensvikterna är Livsmedelsverkets portioner för bröd och ost.
    id: "ostsmorgas", name: "Ostsmörgås", category: "mejeri", portion: "1 st", portionSource: "slv", emoji: "🥪",
    ingredients: [
      { grams: 35, proteinPer100g: 9.3, slv: 3797, slvName: "Bröd fullkorn råg fibrer ca 7%" },
      { grams: 15, proteinPer100g: 26.2, slv: 96, slvName: "Ost hårdost fett 28%" },
    ],
  },

  // ── Växtbaserat ──────────────────────────────────────────────
  { id: "tempeh", name: "Tempeh", category: "vaxt", portion: "100 g", grams: 100, portionSource: "egen", proteinPer100g: 18.6, emoji: "🌱", slv: 7027, slvName: "Tempeh" },
  { id: "tofu", name: "Tofu", category: "vaxt", portion: "100 g", grams: 100, portionSource: "egen", proteinPer100g: 6.6, emoji: "🧊", slv: 905, slvName: "Tofu fast" },
  { id: "artfars", name: "Ärtproteinfärs", category: "vaxt", portion: "125 g", grams: 125, portionSource: "egen", proteinPer100g: 26.6, emoji: "🌱", slv: 6901, slvName: "Ärtprotein färs kylvara el. frysvara" },
  { id: "sojabitar", name: "Sojabitar", category: "vaxt", portion: "100 g (stekt)", grams: 100, portionSource: "egen", proteinPer100g: 19.8, emoji: "🌱", slv: 6289, slvName: "Sojaprotein bitar stekta typ Oumph®" },
  { id: "mykoprotein", name: "Mykoproteinfärs", category: "vaxt", portion: "100 g (stekt)", grams: 100, portionSource: "egen", proteinPer100g: 16.7, emoji: "🍄", slv: 6282, slvName: "Mykoprotein färs bitar filé stekt" },
  { id: "roda-linser", name: "Röda linser", category: "vaxt", portion: "150 g (kokta)", grams: 150, portionSource: "egen", proteinPer100g: 10.6, emoji: "🫘", slv: 3822, slvName: "Röda linser torkade kokta m. salt" },
  { id: "kikartor", name: "Kikärtor", category: "vaxt", portion: "150 g (kokta)", grams: 150, portionSource: "egen", proteinPer100g: 8.1, emoji: "🫘", slv: 3762, slvName: "Kikärtor torkade kokta m. salt" },
  { id: "svarta-bonor", name: "Svarta bönor", category: "vaxt", portion: "150 g", grams: 150, portionSource: "egen", proteinPer100g: 8.1, emoji: "🫘", slv: 3817, slvName: "Svarta bönor konserv. u. lag" },
  { id: "edamame", name: "Edamame", category: "vaxt", portion: "75 g", grams: 75, portionSource: "slv", proteinPer100g: 10.9, emoji: "🫛", slv: 5860, slvName: "Sojabönor färska förvällda u. skal" },
  { id: "hummus", name: "Hummus", category: "vaxt", portion: "3 msk (51 g)", grams: 51, portionSource: "pm2024", proteinPer100g: 5.8, emoji: "🥙", slv: 3051, slvName: "Hummus kikärtsröra" },
  { id: "jordnotter", name: "Jordnötter", category: "vaxt", portion: "1 näve (30 g)", grams: 30, portionSource: "egen", proteinPer100g: 22.4, emoji: "🥜", slv: 1561, slvName: "Jordnötter rostade" },
  { id: "jordnotssmor", name: "Jordnötssmör", category: "vaxt", portion: "1 msk (15 g)", grams: 15, portionSource: "egen", proteinPer100g: 22.6, emoji: "🥜", slv: 1559, slvName: "Jordnötssmör" },
  { id: "mandlar", name: "Mandlar", category: "vaxt", portion: "1 näve (30 g)", grams: 30, portionSource: "egen", proteinPer100g: 20.7, emoji: "🌰", slv: 1575, slvName: "Sötmandel" },
  { id: "pumpafro", name: "Pumpafrön", category: "vaxt", portion: "2 msk (20 g)", grams: 20, portionSource: "egen", proteinPer100g: 29.8, emoji: "🎃", slv: 1571, slvName: "Pumpafrö" },
  { id: "hampafro", name: "Hampafrön", category: "vaxt", portion: "1 msk (15 g)", grams: 15, portionSource: "egen", proteinPer100g: 28.0, emoji: "🌿", slv: 6159, slvName: "Hampafrö u. skal" },
  { id: "naringsjast", name: "Näringsjäst", category: "vaxt", portion: "2 msk (10 g)", grams: 10, portionSource: "egen", proteinPer100g: 46.6, emoji: "✨", slv: 6998, slvName: "Näringsjäst" },
  { id: "havregryn", name: "Havregryn", category: "vaxt", portion: "40 g (1 portion gröt)", grams: 40, portionSource: "egen", proteinPer100g: 9.5, emoji: "🥣", slv: 702, slvName: "Havregryn fullkorn" },
  { id: "fullkornsbrod", name: "Fullkornsbröd", category: "vaxt", portion: "1 skiva", grams: 35, portionSource: "slv", proteinPer100g: 9.3, emoji: "🍞", slv: 3797, slvName: "Bröd fullkorn råg fibrer ca 7%" },
  { id: "pasta", name: "Pasta", category: "vaxt", portion: "175 g (kokt)", grams: 175, portionSource: "slv", proteinPer100g: 4.6, emoji: "🍝", slv: 3756, slvName: "Pasta kokt m. salt" },
  { id: "quinoa", name: "Quinoa", category: "vaxt", portion: "115 g (kokt)", grams: 115, portionSource: "slv", proteinPer100g: 4.4, emoji: "🍚", slv: 3518, slvName: "Mjölmålla quinoa röd kokt m. salt" },
  { id: "banan", name: "Banan", category: "vaxt", portion: "1 st", grams: 105, portionSource: "slv", proteinPer100g: 1.1, emoji: "🍌", slv: 553, slvName: "Banan" },
  { id: "broccoli", name: "Broccoli", category: "vaxt", portion: "100 g", grams: 100, portionSource: "egen", proteinPer100g: 2.9, emoji: "🥦", slv: 325, slvName: "Broccoli" },
  { id: "sojadryck", name: "Sojadryck", category: "vaxt", portion: "2 dl", grams: 207, portionSource: "slv", proteinPer100g: 3.1, emoji: "🥛", slv: 907, slvName: "Sojadryck" },
  { id: "havredryck", name: "Havredryck", category: "vaxt", portion: "2 dl", grams: 198, portionSource: "pm2024", proteinPer100g: 1.0, emoji: "🥛", slv: 700, slvName: "Havredryck fett 1,5% berikad" },

  // ── Proteindrycker (färdigblandade drycker och pulver) ───────
  { id: "kvargdryck", name: "Kvargdryck", category: "drycker", portion: "1 flaska (330 g)", grams: 330, portionSource: "slv", proteinPer100g: 5.4, emoji: "🥤", slv: 6089, slvName: "Kvarg drickf. olika smaker" },
  { id: "maltidsersattning", name: "Måltidsersättning", category: "drycker", portion: "1 portion pulver (50 g)", grams: 50, portionSource: "egen", proteinPer100g: 35.0, emoji: "🥤", slv: 1891, slvName: "Måltidsersättning pulver chokladsmak berikad" },
  { id: "proteinshake", name: "Proteinshake, färdig", category: "drycker", portion: "1 flaska (33 cl)", grams: 330, portionSource: "egen", proteinPer100g: 7.5, emoji: "🥤", source: "typvärde" },
  { id: "vassleprotein", name: "Vassleproteinpulver", category: "drycker", portion: "1 skopa (30 g)", grams: 30, portionSource: "egen", proteinPer100g: 75, emoji: "🥤", source: "typvärde" },
  { id: "vaxtproteinpulver", name: "Växtproteinpulver", category: "drycker", portion: "1 skopa (30 g)", grams: 30, portionSource: "egen", proteinPer100g: 70, emoji: "🥤", source: "typvärde" },
];
