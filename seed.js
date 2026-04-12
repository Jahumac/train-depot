/**
 * Sample data seeder for the OO Gauge Model Train Catalog
 * Run with: node seed.js
 */

const db = require('./database');
const fs = require('fs');
const path = require('path');

// Ensure clean start
const dbFile = path.join(__dirname, 'data', 'catalog.json');
if (fs.existsSync(dbFile)) {
  fs.unlinkSync(dbFile);
}
db.ensureDbExists();

const sampleItems = [
  // === STEAM - LNER ===
  {
    name: "LNER A3 Class 4472 'Flying Scotsman'",
    manufacturer: "Hornby",
    purchasePrice: 289.99,
    placeOfPurchase: "Hattons of Liverpool",
    livery: "LNER Apple Green",
    historicalBackground: "The most famous steam locomotive in the world, No. 4472 Flying Scotsman was designed by Sir Nigel Gresley for the London and North Eastern Railway. Built in 1923 at Doncaster Works, she was the first locomotive to officially reach 100 mph. The A3 class were 4-6-2 Pacific tender locomotives, renowned for hauling express passenger services on the East Coast Main Line.",
    goesWellWith: "LNER teak coaches, Thompson coaches, LNER brake van, fish vans",
    lastServiceDate: "2025-11-15",
    categoryId: "locomotives",
    subcategoryId: "steam-lner"
  },
  {
    name: "LNER A4 Class 4468 'Mallard'",
    manufacturer: "Hornby",
    purchasePrice: 315.00,
    placeOfPurchase: "Rails of Sheffield",
    livery: "LNER Garter Blue",
    historicalBackground: "Holder of the world speed record for steam traction at 126 mph, achieved on 3 July 1938 on the East Coast Main Line near Essendine. Designed by Sir Nigel Gresley, the streamlined A4 class represented the pinnacle of British steam locomotive design. Mallard is now preserved at the National Railway Museum in York.",
    goesWellWith: "LNER streamlined coaches, LNER beaver tail observation car, corridor tenders",
    lastServiceDate: "2025-09-20",
    categoryId: "locomotives",
    subcategoryId: "steam-lner"
  },
  {
    name: "LNER V2 Class 4771 'Green Arrow'",
    manufacturer: "Bachmann",
    purchasePrice: 265.00,
    placeOfPurchase: "Hattons of Liverpool",
    livery: "LNER Lined Green",
    historicalBackground: "The V2 class 2-6-2 was designed by Gresley and introduced in 1936. Known as the 'engines that won the war', they handled both passenger and freight duties with distinction. Green Arrow is the sole survivor, preserved at the NRM.",
    goesWellWith: "LNER teak coaches, mixed freight wagons, fish vans, parcels stock",
    lastServiceDate: "2025-06-10",
    categoryId: "locomotives",
    subcategoryId: "steam-lner"
  },

  // === STEAM - GWR ===
  {
    name: "GWR Castle Class 5029 'Nunney Castle'",
    manufacturer: "Dapol",
    purchasePrice: 249.99,
    placeOfPurchase: "Kernow Model Rail Centre",
    livery: "GWR Lined Green",
    historicalBackground: "The Castle class 4-6-0 locomotives were designed by Charles Collett and introduced in 1923. They were the GWR's premier express passenger engines, working services such as the Cornish Riviera Express. The class proved so successful that construction continued until 1950.",
    goesWellWith: "GWR chocolate and cream coaches, GWR auto trailer, GWR Siphon G milk vans",
    lastServiceDate: "2025-08-22",
    categoryId: "locomotives",
    subcategoryId: "steam-gwr"
  },
  {
    name: "GWR 57xx Class 0-6-0PT Pannier Tank",
    manufacturer: "Bachmann",
    purchasePrice: 189.99,
    placeOfPurchase: "Rails of Sheffield",
    livery: "GWR Lined Green",
    historicalBackground: "The humble pannier tank was the workhorse of the Great Western Railway. The 57xx class was the most numerous class, with 863 locomotives built between 1929 and 1950. They handled shunting, branch line, and short-distance freight duties across the GWR network.",
    goesWellWith: "GWR auto trailer, GWR brake van, open mineral wagons, GWR goods stock",
    lastServiceDate: "2026-01-05",
    categoryId: "locomotives",
    subcategoryId: "steam-gwr"
  },
  {
    name: "GWR King Class 6000 'King George V'",
    manufacturer: "Heljan",
    purchasePrice: 349.00,
    placeOfPurchase: "Gaugemaster",
    livery: "GWR Brunswick Green",
    historicalBackground: "The King Class were the most powerful 4-6-0 express passenger locomotives in Britain when introduced in 1927. Designed by Charles Collett, 6000 King George V visited the United States for the Baltimore and Ohio Railroad centenary celebrations in 1927, returning with a commemorative bell.",
    goesWellWith: "GWR centenary coaches, GWR Super Saloons, restaurant cars, Cornish Riviera stock",
    lastServiceDate: "2025-12-01",
    categoryId: "locomotives",
    subcategoryId: "steam-gwr"
  },

  // === STEAM - LMS ===
  {
    name: "LMS Coronation Class 6229 'Duchess of Hamilton'",
    manufacturer: "Hornby",
    purchasePrice: 329.99,
    placeOfPurchase: "Hattons of Liverpool",
    livery: "LMS Crimson Lake",
    historicalBackground: "The Coronation class (also known as Duchess class) were Sir William Stanier's masterpiece. These 4-6-2 Pacific locomotives were the most powerful express passenger engines to run on British metals. No. 6229 visited the USA in 1939 disguised as 6220 Coronation and was stranded there by the outbreak of WWII.",
    goesWellWith: "LMS Coronation Scot coaches, LMS period III stock, TPO vehicles",
    lastServiceDate: "2025-10-18",
    categoryId: "locomotives",
    subcategoryId: "steam-lms"
  },
  {
    name: "LMS Stanier 8F 2-8-0 No. 48151",
    manufacturer: "Bachmann",
    purchasePrice: 225.00,
    placeOfPurchase: "TMC - The Model Centre",
    livery: "BR Black Late Crest",
    historicalBackground: "The Stanier 8F was a freight locomotive designed by Sir William Stanier for the LMS. Introduced in 1935, they became the standard heavy freight locomotive and were adopted as a War Department engine during WWII, serving as far afield as the Middle East and Italy.",
    goesWellWith: "16-ton mineral wagons, brake vans, tank wagons, open wagons, hopper wagons",
    lastServiceDate: "2025-07-30",
    categoryId: "locomotives",
    subcategoryId: "steam-lms"
  },

  // === STEAM - SOUTHERN ===
  {
    name: "SR Merchant Navy Class 35028 'Clan Line'",
    manufacturer: "Hornby",
    purchasePrice: 299.99,
    placeOfPurchase: "Rails of Sheffield",
    livery: "BR Brunswick Green",
    historicalBackground: "The Merchant Navy class was designed by Oliver Bulleid for the Southern Railway. Originally built with an innovative air-smoothed casing, they were later rebuilt in more conventional form. No. 35028 Clan Line is the sole operational survivor and is maintained by the Merchant Navy Locomotive Preservation Society.",
    goesWellWith: "Bulleid coaches, BR Mk1 coaches, Golden Arrow Pullman cars, boat train stock",
    lastServiceDate: "2025-05-12",
    categoryId: "locomotives",
    subcategoryId: "steam-southern"
  },

  // === STEAM - BR ===
  {
    name: "BR Standard Class 9F 92220 'Evening Star'",
    manufacturer: "Bachmann",
    purchasePrice: 279.99,
    placeOfPurchase: "Hattons of Liverpool",
    livery: "BR Lined Green",
    historicalBackground: "The last steam locomotive built by British Railways, completed at Swindon Works in March 1960. The 9F class were heavy freight locomotives, but proved equally capable on express passenger duties. Evening Star was the only 9F to receive lined green livery, marking her special status.",
    goesWellWith: "BR 21-ton hoppers, BR brake vans, 16-ton minerals, Mk1 coaches for mixed traffic duties",
    lastServiceDate: "2026-02-14",
    categoryId: "locomotives",
    subcategoryId: "steam-br"
  },
  {
    name: "BR Standard Class 4MT 2-6-4T No. 80104",
    manufacturer: "Bachmann",
    purchasePrice: 215.00,
    placeOfPurchase: "Kernow Model Rail Centre",
    livery: "BR Lined Black",
    historicalBackground: "The BR Standard Class 4 tank locomotives were designed by R.A. Riddles for suburban and branch line passenger duties. Built between 1951 and 1957, they were versatile and popular engines that served across the British Railways network.",
    goesWellWith: "BR Mk1 suburban coaches, push-pull stock, branch line freight wagons",
    lastServiceDate: "2025-04-20",
    categoryId: "locomotives",
    subcategoryId: "steam-br"
  },

  // === STEAM - PRE-GROUPING ===
  {
    name: "LSWR T9 Class 4-4-0 No. 120",
    manufacturer: "Dapol",
    purchasePrice: 199.99,
    placeOfPurchase: "Gaugemaster",
    livery: "LSWR Sage Green",
    historicalBackground: "Known as 'Greyhounds' for their turn of speed, the T9 class were designed by Dugald Drummond for the London and South Western Railway. Introduced in 1899, they handled express passenger services between London Waterloo and the South West of England.",
    goesWellWith: "LSWR corridor coaches, LSWR non-corridor stock, pre-grouping goods wagons",
    lastServiceDate: "2025-03-10",
    categoryId: "locomotives",
    subcategoryId: "steam-pre-grouping"
  },

  // === DIESEL ===
  {
    name: "BR Class 55 'Deltic' D9009 'Alycidon'",
    manufacturer: "Heljan",
    purchasePrice: 375.00,
    placeOfPurchase: "Rails of Sheffield",
    livery: "BR Two-Tone Green",
    historicalBackground: "The Class 55 Deltics were the most powerful single-unit diesel locomotives in the UK when introduced in 1961. Named after racehorses and regiments, they dominated East Coast Main Line expresses for over 20 years, hauling services at speeds up to 100 mph.",
    goesWellWith: "BR Mk1 coaches, Mk2 coaches, BR blue/grey coaching stock, TPO vehicles",
    lastServiceDate: "2025-11-01",
    categoryId: "locomotives",
    subcategoryId: "diesel"
  },
  {
    name: "BR Class 37 No. 37521 'English China Clays'",
    manufacturer: "Heljan",
    purchasePrice: 289.99,
    placeOfPurchase: "TMC - The Model Centre",
    livery: "BR Large Logo Blue",
    historicalBackground: "The Class 37 is one of the most successful and long-lived British diesel locomotive designs. Built by English Electric from 1960 to 1965, they were versatile machines found on passenger, freight, and engineering duties across the entire BR network.",
    goesWellWith: "CDA china clay wagons, Mk1/Mk2 coaches, tank wagons, VDA vans",
    lastServiceDate: "2025-08-15",
    categoryId: "locomotives",
    subcategoryId: "diesel"
  },
  {
    name: "BR Class 47 No. 47500 'Great Western'",
    manufacturer: "Heljan",
    purchasePrice: 310.00,
    placeOfPurchase: "Hattons of Liverpool",
    livery: "BR InterCity Executive",
    historicalBackground: "The Class 47, built by Brush Traction, was the backbone of BR's main line diesel fleet. With 512 built between 1962 and 1967, they hauled everything from express passengers to heavy freight, and were found across the entire network.",
    goesWellWith: "Mk1 and Mk2 coaches, InterCity Mk3 coaches, Freightliner flats, general freight stock",
    lastServiceDate: "2026-01-20",
    categoryId: "locomotives",
    subcategoryId: "diesel"
  },

  // === MULTIPLE UNITS ===
  {
    name: "GWR Railcar No. 22",
    manufacturer: "Dapol",
    purchasePrice: 259.00,
    placeOfPurchase: "Kernow Model Rail Centre",
    livery: "GWR Chocolate & Cream",
    historicalBackground: "The GWR diesel railcars were pioneering vehicles introduced from 1933 to reduce operating costs on branch lines and cross-country routes. Streamlined and modern in appearance, they represented the GWR's forward-thinking approach to rail travel.",
    goesWellWith: "GWR branch line stock, GWR auto trailers",
    lastServiceDate: "2025-12-20",
    categoryId: "locomotives",
    subcategoryId: "multiple-units"
  },

  // === ROLLING STOCK - LNER ===
  {
    name: "LNER Teak Corridor Coach (Composite)",
    manufacturer: "Bachmann",
    purchasePrice: 89.99,
    placeOfPurchase: "Hattons of Liverpool",
    livery: "LNER Teak",
    historicalBackground: "The LNER teak coaches were the standard main line passenger stock, built to Gresley's designs. Their distinctive varnished teak finish gave the East Coast Main Line services a refined appearance that was widely admired.",
    goesWellWith: "LNER A3, A4, V2 class locomotives, LNER dining cars, brake composites",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-lner"
  },
  {
    name: "LNER Thompson Brake Third Coach",
    manufacturer: "Bachmann",
    purchasePrice: 84.99,
    placeOfPurchase: "Rails of Sheffield",
    livery: "LNER Teak",
    historicalBackground: "Edward Thompson succeeded Gresley as CME of the LNER and introduced his own coach designs featuring a more angular appearance. These coaches served well into the British Railways era.",
    goesWellWith: "LNER B1 class, Thompson L1 class, LNER teak corridor coaches",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-lner"
  },

  // === ROLLING STOCK - GWR ===
  {
    name: "GWR Collett Composite Coach",
    manufacturer: "Dapol",
    purchasePrice: 79.99,
    placeOfPurchase: "Kernow Model Rail Centre",
    livery: "GWR Chocolate & Cream",
    historicalBackground: "The iconic chocolate and cream livery of the Great Western Railway coaches is one of the most recognisable in British railway history. Collett's coaches were well-appointed and comfortable vehicles for their era.",
    goesWellWith: "GWR Castle class, King class, Hall class, GWR restaurant car",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-gwr"
  },
  {
    name: "GWR Siphon G Milk Van",
    manufacturer: "Dapol",
    purchasePrice: 49.99,
    placeOfPurchase: "Hattons of Liverpool",
    livery: "GWR Brown",
    historicalBackground: "Siphon G vans were used for the conveyance of milk churns from the farms of the West Country and Wales to the dairies and distribution points. They ran in dedicated milk trains, often at express speed.",
    goesWellWith: "GWR pannier tanks, GWR Halls, other Siphon vans, GWR brake vans",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-gwr"
  },

  // === ROLLING STOCK - LMS ===
  {
    name: "LMS Period III Corridor Brake Third",
    manufacturer: "Bachmann",
    purchasePrice: 85.00,
    placeOfPurchase: "TMC - The Model Centre",
    livery: "LMS Crimson Lake",
    historicalBackground: "LMS Period III stock represented the standard coaching vehicles of the Stanier era. Well-built and comfortable, these coaches formed the backbone of LMS express passenger services throughout the 1930s and 1940s.",
    goesWellWith: "LMS Duchess, Jubilee, Black Five class locomotives, LMS restaurant cars",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-lms"
  },

  // === ROLLING STOCK - BR ===
  {
    name: "BR Mk1 FK (First Corridor) Coach",
    manufacturer: "Bachmann",
    purchasePrice: 74.99,
    placeOfPurchase: "Hattons of Liverpool",
    livery: "BR Maroon",
    historicalBackground: "The BR Mk1 coach was the first standard design produced by British Railways after nationalisation in 1948. Over 4,600 were built at several works, and they formed the backbone of BR passenger services for decades. Many survive in preservation.",
    goesWellWith: "BR Standard classes, Class 47, Class 37, Mk1 BSK, Mk1 restaurant cars",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-br"
  },
  {
    name: "BR 16-Ton Mineral Wagon (3-pack)",
    manufacturer: "Bachmann",
    purchasePrice: 59.99,
    placeOfPurchase: "Rails of Sheffield",
    livery: "BR Bauxite",
    historicalBackground: "The 16-ton mineral wagon was the standard coal wagon of British Railways, replacing the older pre-grouping designs. Thousands were built and they were a ubiquitous sight on the network hauling coal from the collieries to power stations and depots.",
    goesWellWith: "BR 9F, 8F, Class 37, Class 47, BR brake vans, any freight locomotive",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-br"
  },

  // === ROLLING STOCK - NATIONALISATION ONWARDS ===
  {
    name: "BR HAA Hopper Wagon (MGR Coal)",
    manufacturer: "Heljan",
    purchasePrice: 45.00,
    placeOfPurchase: "Gaugemaster",
    livery: "BR Grey (Railfreight)",
    historicalBackground: "The HAA hopper wagon was designed for the merry-go-round (MGR) coal train system, where trains loaded at collieries and discharged at power stations without stopping. This system revolutionised bulk coal transport in Britain.",
    goesWellWith: "Class 56, Class 58, Class 37, Class 47, other HAA hoppers, brake vans",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-nationalisation"
  },
  {
    name: "Freightliner FLA Container Flat Wagon",
    manufacturer: "Bachmann",
    purchasePrice: 54.99,
    placeOfPurchase: "TMC - The Model Centre",
    livery: "Freightliner Green",
    historicalBackground: "Freightliner services began in 1965 as a joint venture to carry containers between major cities. The flat wagons carry standard ISO containers and have become an increasingly important part of the rail freight network.",
    goesWellWith: "Class 47, Class 66, Class 37, other Freightliner flats, containers",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-nationalisation"
  },

  // === ROLLING STOCK - SOUTHERN ===
  {
    name: "SR Maunsell Restriction 1 Composite Coach",
    manufacturer: "Bachmann",
    purchasePrice: 82.50,
    placeOfPurchase: "Kernow Model Rail Centre",
    livery: "SR Malachite Green",
    historicalBackground: "Richard Maunsell's coaches for the Southern Railway were robust and well-designed vehicles. The Restriction 1 coaches were built to the widest loading gauge and ran on main line services from London to the South Coast.",
    goesWellWith: "SR Merchant Navy, West Country, Schools class locomotives, SR Maunsell brake coaches",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-southern"
  },

  // === ROLLING STOCK - PRE-GROUPING ===
  {
    name: "Private Owner Coal Wagon 'Llanelly Steel Co.'",
    manufacturer: "Dapol",
    purchasePrice: 24.99,
    placeOfPurchase: "Hattons of Liverpool",
    livery: "Red Oxide with White Lettering",
    historicalBackground: "Private owner wagons were a distinctive feature of British railways before nationalisation. Collieries, steel works, and coal merchants operated thousands of their own wagons, each with distinctive liveries and lettering.",
    goesWellWith: "Pre-grouping locomotives, GWR pannier tanks, other PO wagons, brake vans",
    lastServiceDate: "",
    categoryId: "rolling-stock",
    subcategoryId: "rs-pre-grouping"
  }
];

// Seed the database
console.log('🚂 Seeding OO Gauge Model Train Catalog...\n');

let totalCost = 0;
for (const item of sampleItems) {
  const created = db.createItem(item);
  totalCost += item.purchasePrice;
  console.log(`  ✅ ${created.name} (£${item.purchasePrice.toFixed(2)})`);
}

console.log(`\n📊 Seeded ${sampleItems.length} items`);
console.log(`💷 Total collection value: £${totalCost.toFixed(2)}`);
console.log('\n✨ Done! Start the server with: node server.js\n');
