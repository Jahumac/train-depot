/**
 * OO Gauge Model Train Reference Database
 * Comprehensive catalog of well-known OO gauge models with pre-filled data.
 * When a user starts typing a name, matching entries are suggested.
 * Selecting one auto-fills: manufacturer, livery, subcategory, history, goes-well-with, and reference image.
 */

const referenceDB = {

  // ============================================================
  //  "Goes Well With" suggestions by era and region
  // ============================================================

  compatibility: {
    'steam-pre-grouping': [
      'Pre-grouping coaching stock', 'Private owner wagons', 'Horse boxes', 'Milk vans',
      'Open wagons', 'Brake vans', 'Cattle wagons', 'Pre-grouping goods stock'
    ],
    'steam-lner': [
      'LNER teak coaches', 'Thompson coaches', 'Gresley buffet cars', 'LNER fish vans',
      'LNER parcels stock', 'LNER brake van', 'Corridor tenders', 'LNER restaurant cars',
      'LNER beaver tail observation car', 'Mixed freight wagons'
    ],
    'steam-gwr': [
      'GWR chocolate & cream coaches', 'GWR auto trailer', 'Collett coaches',
      'GWR Siphon G milk vans', 'GWR brake van', 'GWR restaurant car',
      'GWR Super Saloons', 'Open mineral wagons', 'GWR goods stock'
    ],
    'steam-lms': [
      'LMS Period III coaches', 'LMS Coronation Scot stock', 'Stanier coaches',
      'LMS brake van', 'LMS restaurant cars', 'TPO vehicles',
      '16-ton mineral wagons', 'LMS goods stock'
    ],
    'steam-southern': [
      'Maunsell coaches', 'Bulleid coaches', 'Golden Arrow Pullman cars',
      'SR brake van', 'Boat train stock', 'SR utility vans',
      'BR Mk1 coaches (later period)'
    ],
    'steam-br': [
      'BR Mk1 coaches', 'BR Mk1 suburban stock', 'BR brake vans',
      '16-ton mineral wagons', '21-ton hoppers', 'BR cattle wagons',
      'BR goods stock', 'Push-pull stock', 'Branch line freight wagons'
    ],
    'diesel': [
      'BR Mk1 coaches', 'BR Mk2 coaches', 'BR Mk3 coaches (HST)',
      'BR blue/grey coaching stock', 'Freightliner flats', 'Tank wagons',
      'VDA vans', 'HAA hopper wagons', 'TPO vehicles',
      'InterCity Executive stock', 'InterCity Swallow stock'
    ],
    'multiple-units': [
      'Branch line stock', 'Auto trailers', 'Suburban coaches',
      'Platform accessories', 'Station buildings'
    ],
    'rs-lner': ['LNER A3, A4, V2, B1 class locomotives', 'LNER dining cars', 'LNER brake composites'],
    'rs-gwr': ['GWR Castle, King, Hall, Pannier class locomotives', 'GWR restaurant cars'],
    'rs-lms': ['LMS Duchess, Jubilee, Black Five, 8F class locomotives', 'LMS restaurant cars'],
    'rs-southern': ['SR Merchant Navy, West Country, Schools class locomotives', 'SR brake coaches'],
    'rs-br': ['BR Standard classes', 'Class 47', 'Class 37', 'Class 55', 'BR Mk1 restaurant cars'],
    'rs-nationalisation': ['Class 56', 'Class 58', 'Class 66', 'Class 37', 'Class 47'],
    'rs-pre-grouping': ['Pre-grouping locomotives', 'GWR pannier tanks', 'Other PO wagons', 'Brake vans']
  },

  // Helper: get "goes well with" suggestions for a subcategory
  getCompatible(subcategoryId) {
    return this.compatibility[subcategoryId] || [];
  },

  // ============================================================
  //  Reference Models Database
  //  Each entry represents a well-known prototype / model product
  // ============================================================

  models: [
    // ===================== STEAM - LNER =====================
    {
      name: "LNER A3 Class 4472 'Flying Scotsman'",
      altNames: ['Flying Scotsman', 'A3 Class', '4472'],
      manufacturer: 'Hornby',
      livery: 'LNER Apple Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lner',
      historicalBackground: "The most famous steam locomotive in the world, No. 4472 Flying Scotsman was designed by Sir Nigel Gresley for the London and North Eastern Railway. Built in 1923 at Doncaster Works, she was the first locomotive to officially reach 100 mph in 1934. The A3 class were 4-6-2 Pacific tender locomotives, renowned for hauling express passenger services on the East Coast Main Line between London King's Cross and Edinburgh. After withdrawal in 1963, she was privately preserved and has since toured the world. Now part of the National Collection, she was restored to main line running condition in 2016.",
      goesWellWith: 'LNER teak coaches, Thompson coaches, LNER brake van, LNER fish vans, corridor tenders',
      refImage: ''
    },
    {
      name: "LNER A4 Class 4468 'Mallard'",
      altNames: ['Mallard', 'A4 Class', '4468', 'A4 Mallard'],
      manufacturer: 'Hornby',
      livery: 'LNER Garter Blue',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lner',
      historicalBackground: "Holder of the world speed record for steam traction at 126 mph, achieved on 3 July 1938 on Stoke Bank near Essendine, Lincolnshire. Designed by Sir Nigel Gresley, the streamlined A4 class represented the pinnacle of British steam locomotive design. Built at Doncaster in 1938, Mallard hauled express services on the East Coast Main Line. The streamlined casing was designed with input from Bugatti. Mallard is now preserved at the National Railway Museum in York, alongside five other surviving A4s.",
      goesWellWith: 'LNER streamlined coaches, LNER beaver tail observation car, corridor tenders, LNER restaurant cars',
      refImage: ''
    },
    {
      name: "LNER A4 Class 4498 'Sir Nigel Gresley'",
      altNames: ['Sir Nigel Gresley', '4498', 'A4 Gresley'],
      manufacturer: 'Hornby',
      livery: 'LNER Garter Blue',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lner',
      historicalBackground: "Named after the legendary Chief Mechanical Engineer who designed her, No. 4498 was built at Doncaster in 1937. Sir Nigel Gresley was the 100th Gresley Pacific. After withdrawal in 1966, she was preserved by the A4 Locomotive Society and has since been a regular performer on heritage railways and the main line.",
      goesWellWith: 'LNER streamlined coaches, LNER teak coaches, LNER restaurant cars, corridor tenders',
      refImage: ''
    },
    {
      name: "LNER V2 Class 4771 'Green Arrow'",
      altNames: ['Green Arrow', 'V2 Class', '4771'],
      manufacturer: 'Bachmann',
      livery: 'LNER Lined Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lner',
      historicalBackground: "The V2 class 2-6-2 was designed by Gresley and introduced in 1936 for mixed-traffic duties. Known as 'the engines that won the war' for their sterling service during WWII hauling both passenger and freight trains of enormous weight. 184 were built between 1936 and 1944. Green Arrow is the sole survivor of the class, preserved at the National Railway Museum in York.",
      goesWellWith: 'LNER teak coaches, mixed freight wagons, fish vans, parcels stock, LNER brake van',
      refImage: ''
    },
    {
      name: "LNER B1 Class 61264",
      altNames: ['B1 Class', '61264', 'Thompson B1'],
      manufacturer: 'Bachmann',
      livery: 'BR Lined Black',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lner',
      historicalBackground: "The B1 class 4-6-0 was designed by Edward Thompson as a general purpose locomotive for the LNER, introduced in 1942. 410 were built, making them one of the most numerous LNER classes. They worked passenger and freight services across the former LNER network. Two survive in preservation: 61264 and 61306 'Mayflower'.",
      goesWellWith: 'LNER teak coaches, Thompson coaches, BR Mk1 coaches, mixed freight wagons',
      refImage: ''
    },
    {
      name: "LNER A1 Class 60163 'Tornado'",
      altNames: ['Tornado', 'A1 Tornado', '60163', 'Peppercorn A1'],
      manufacturer: 'Bachmann',
      livery: 'BR Lined Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lner',
      historicalBackground: "The newest main line steam locomotive in Britain, built by the A1 Steam Locomotive Trust between 1994 and 2008 at Darlington. She is a Peppercorn A1 class 4-6-2 Pacific, the 50th of the class, completing the original order that was never fulfilled. Tornado has since worked numerous main line specials and appeared on BBC's Top Gear. She cost approximately £3 million to build entirely through donations.",
      goesWellWith: 'BR Mk1 coaches, LNER teak coaches, support coach, BR maroon stock',
      refImage: ''
    },

    // ===================== STEAM - GWR =====================
    {
      name: "GWR Castle Class 5029 'Nunney Castle'",
      altNames: ['Nunney Castle', 'Castle Class', '5029'],
      manufacturer: 'Dapol',
      livery: 'GWR Lined Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-gwr',
      historicalBackground: "The Castle class 4-6-0 locomotives were designed by Charles Collett and introduced in 1923. They were the GWR's premier express passenger engines, working prestigious services such as the Cornish Riviera Express and the Cheltenham Flyer. 171 were built between 1923 and 1950, and the class proved so successful they outlasted many later designs. Eight survive in preservation.",
      goesWellWith: 'GWR chocolate & cream coaches, GWR restaurant car, GWR Siphon G milk vans, Collett coaches',
      refImage: ''
    },
    {
      name: "GWR King Class 6000 'King George V'",
      altNames: ['King George V', 'King Class', '6000', 'KGV'],
      manufacturer: 'Heljan',
      livery: 'GWR Brunswick Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-gwr',
      historicalBackground: "The King class were the most powerful 4-6-0 express passenger locomotives in Britain when introduced in 1927. Designed by Charles Collett, 30 were built at Swindon Works. No. 6000 King George V visited the United States for the Baltimore & Ohio Railroad centenary celebrations in 1927, returning with a commemorative bell that she still carries. Three Kings survive in preservation.",
      goesWellWith: 'GWR centenary coaches, GWR Super Saloons, restaurant cars, Cornish Riviera stock',
      refImage: ''
    },
    {
      name: "GWR Hall Class 4953 'Pitchford Hall'",
      altNames: ['Pitchford Hall', 'Hall Class', '4953', 'GWR Hall'],
      manufacturer: 'Bachmann',
      livery: 'GWR Lined Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-gwr',
      historicalBackground: "The Hall class 4-6-0 was designed by Charles Collett as a mixed-traffic locomotive, introduced in 1928. 259 were built and they became the backbone of GWR intermediate services, equally at home on passenger or freight duties. The Modified Halls followed from 1944. Eleven Halls survive in preservation.",
      goesWellWith: 'GWR chocolate & cream coaches, GWR auto trailer, mixed freight wagons, GWR brake van',
      refImage: ''
    },
    {
      name: "GWR 57xx Class 0-6-0PT Pannier Tank",
      altNames: ['Pannier Tank', '57xx', 'GWR Pannier', '5700'],
      manufacturer: 'Bachmann',
      livery: 'GWR Lined Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-gwr',
      historicalBackground: "The humble pannier tank was the workhorse of the Great Western Railway. The 57xx class was the most numerous class of any on the GWR system, with 863 locomotives built between 1929 and 1950 at Swindon. They handled shunting, branch line, and short-distance freight duties across the entire GWR network. Their distinctive side tanks gave them a unique silhouette. Many survive on heritage railways.",
      goesWellWith: 'GWR auto trailer, GWR brake van, open mineral wagons, GWR goods stock, private owner wagons',
      refImage: ''
    },
    {
      name: "GWR 14xx Class 0-4-2T No. 1450",
      altNames: ['14xx', '1450', 'GWR Auto Tank', '1400 class'],
      manufacturer: 'Dapol',
      livery: 'GWR Lined Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-gwr',
      historicalBackground: "The 14xx class (originally 48xx) were small 0-4-2 tank engines designed by Charles Collett for auto-train (push-pull) branch line work. 75 were built between 1932 and 1936. They were commonly paired with GWR auto trailers on rural branch lines across the Western Region. Four survive in preservation.",
      goesWellWith: 'GWR auto trailer, branch line goods wagons, GWR brake van',
      refImage: ''
    },

    // ===================== STEAM - LMS =====================
    {
      name: "LMS Coronation Class 6229 'Duchess of Hamilton'",
      altNames: ['Duchess of Hamilton', 'Coronation Class', 'Duchess Class', '6229', '46229'],
      manufacturer: 'Hornby',
      livery: 'LMS Crimson Lake',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lms',
      historicalBackground: "The Coronation class (also known as Duchess class) were Sir William Stanier's masterpiece, the most powerful express passenger locomotives to run on British metals. 38 were built between 1937 and 1948. No. 6229 visited the USA in 1939 disguised as 6220 Coronation for a publicity tour, and was stranded there by the outbreak of WWII, not returning until 1943. She is now preserved at the National Railway Museum.",
      goesWellWith: 'LMS Coronation Scot coaches, LMS Period III stock, TPO vehicles, LMS restaurant cars',
      refImage: ''
    },
    {
      name: "LMS Jubilee Class 5690 'Leander'",
      altNames: ['Leander', 'Jubilee Class', '5690', '45690'],
      manufacturer: 'Bachmann',
      livery: 'LMS Crimson Lake',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lms',
      historicalBackground: "The Jubilee class 4-6-0 was designed by Sir William Stanier and introduced in 1934 for express passenger duties on secondary main lines. 191 were built. Named after admirals, colonies, and other imperial subjects, they were capable and elegant machines. Four survive in preservation, with Leander being a regular main line performer.",
      goesWellWith: 'LMS Period III coaches, LMS brake third, LMS restaurant cars, mixed goods stock',
      refImage: ''
    },
    {
      name: "LMS Black Five 4-6-0 No. 45407",
      altNames: ['Black Five', 'Black 5', 'Stanier Class 5', '45407', '5407'],
      manufacturer: 'Bachmann',
      livery: 'BR Lined Black',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lms',
      historicalBackground: "The Stanier Class 5 4-6-0, universally known as the 'Black Five', was the most successful and numerous mixed-traffic locomotive class on the LMS and later British Railways. 842 were built between 1934 and 1951. Capable of handling everything from express passengers to heavy freight, they were found on virtually every line in the LMS/London Midland Region. 18 survive in preservation.",
      goesWellWith: 'LMS Period III coaches, BR Mk1 coaches, mixed freight wagons, brake vans, TPO vehicles',
      refImage: ''
    },
    {
      name: "LMS Stanier 8F 2-8-0",
      altNames: ['Stanier 8F', '8F', '48151', '48773', 'LMS 8F'],
      manufacturer: 'Bachmann',
      livery: 'BR Black Late Crest',
      categoryId: 'locomotives',
      subcategoryId: 'steam-lms',
      historicalBackground: "The Stanier 8F was designed by Sir William Stanier as a heavy freight locomotive for the LMS, introduced in 1935. Such was their success that 852 were built, and they were adopted by the War Department during WWII, serving in the Middle East, Italy, and across Europe. They became the standard heavy freight locomotive of the LMS and later British Railways.",
      goesWellWith: '16-ton mineral wagons, brake vans, tank wagons, open wagons, hopper wagons, mixed freight',
      refImage: ''
    },

    // ===================== STEAM - SOUTHERN =====================
    {
      name: "SR Merchant Navy Class 35028 'Clan Line'",
      altNames: ['Clan Line', 'Merchant Navy', '35028', 'Bulleid Pacific'],
      manufacturer: 'Hornby',
      livery: 'BR Brunswick Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-southern',
      historicalBackground: "The Merchant Navy class was designed by Oliver Bulleid for the Southern Railway, introduced in 1941. Originally built with an innovative air-smoothed casing and chain-driven valve gear, they were later rebuilt in more conventional form between 1956 and 1959. 30 were built. No. 35028 Clan Line is the sole operational survivor and is maintained by the Merchant Navy Locomotive Preservation Society.",
      goesWellWith: 'Bulleid coaches, BR Mk1 coaches, Golden Arrow Pullman cars, boat train stock',
      refImage: ''
    },
    {
      name: "SR West Country Class 34027 'Taw Valley'",
      altNames: ['Taw Valley', 'West Country', 'Battle of Britain', '34027', 'Light Pacific'],
      manufacturer: 'Hornby',
      livery: 'SR Malachite Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-southern',
      historicalBackground: "The West Country and Battle of Britain classes were lighter versions of the Merchant Navy, designed by Bulleid for use on routes with weight restrictions. 110 were built between 1945 and 1951. Like their larger sisters, many were rebuilt. They worked services across the Southern Region including the prestigious Golden Arrow and Atlantic Coast Express.",
      goesWellWith: 'Maunsell coaches, Bulleid coaches, BR Mk1 coaches, SR utility vans',
      refImage: ''
    },
    {
      name: "SR Schools Class V 926 'Repton'",
      altNames: ['Repton', 'Schools Class', '926', '30926', 'V Class'],
      manufacturer: 'Hornby',
      livery: 'SR Malachite Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-southern',
      historicalBackground: "The Schools class V were the most powerful 4-4-0 locomotives in Europe when introduced by Richard Maunsell in 1930. 40 were built, all named after English public schools. They worked the restricted-loading Hastings line and other secondary main line services. Three survive in preservation.",
      goesWellWith: 'Maunsell coaches, SR restriction 1 stock, Hastings line coaches',
      refImage: ''
    },

    // ===================== STEAM - BR =====================
    {
      name: "BR Standard Class 9F 92220 'Evening Star'",
      altNames: ['Evening Star', '9F', '92220', 'BR 9F'],
      manufacturer: 'Bachmann',
      livery: 'BR Lined Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-br',
      historicalBackground: "The last steam locomotive built by British Railways, completed at Swindon Works in March 1960. The 9F class 2-10-0 were designed by R.A. Riddles as heavy freight locomotives, but proved equally capable on express passenger duties. 251 were built. Evening Star was the only 9F to receive lined green livery, marking her special status as the last of the line. She is preserved at the National Railway Museum.",
      goesWellWith: 'BR 21-ton hoppers, BR brake vans, 16-ton minerals, tank wagons, Mk1 coaches for mixed traffic',
      refImage: ''
    },
    {
      name: "BR Standard Class 7 70000 'Britannia'",
      altNames: ['Britannia', 'Class 7', '70000', 'Britannia class'],
      manufacturer: 'Hornby',
      livery: 'BR Lined Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-br',
      historicalBackground: "The first of the British Railways Standard classes, No. 70000 Britannia was completed at Crewe Works in 1951. The Britannia class 4-6-2 Pacifics were designed by R.A. Riddles to be a modern, efficient express passenger locomotive. 55 were built. They revolutionised timekeeping on the Great Eastern main line and worked across the BR network.",
      goesWellWith: 'BR Mk1 coaches, BR maroon stock, BR brake vans, mixed freight stock',
      refImage: ''
    },
    {
      name: "BR Standard Class 4MT 2-6-4T No. 80104",
      altNames: ['80104', 'Standard 4MT Tank', 'BR Standard Tank', '4MT Tank'],
      manufacturer: 'Bachmann',
      livery: 'BR Lined Black',
      categoryId: 'locomotives',
      subcategoryId: 'steam-br',
      historicalBackground: "The BR Standard Class 4 2-6-4 tank locomotives were designed by R.A. Riddles for suburban and branch line passenger duties. Built between 1951 and 1957, 155 were constructed. They were versatile and popular engines that served across the British Railways network on suburban, branch, and secondary services. 15 survive in preservation.",
      goesWellWith: 'BR Mk1 suburban coaches, push-pull stock, branch line freight wagons, brake vans',
      refImage: ''
    },

    // ===================== STEAM - PRE-GROUPING =====================
    {
      name: "LSWR T9 Class 4-4-0 No. 120",
      altNames: ['T9 Class', '120', 'LSWR Greyhound', 'Drummond T9'],
      manufacturer: 'Dapol',
      livery: 'LSWR Sage Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-pre-grouping',
      historicalBackground: "Known as 'Greyhounds' for their turn of speed, the T9 class were designed by Dugald Drummond for the London & South Western Railway, introduced in 1899. 66 were built. They handled express passenger services between Waterloo and the South West. No. 120 is the sole survivor, preserved at the Bodmin & Wenford Railway.",
      goesWellWith: 'LSWR corridor coaches, LSWR non-corridor stock, pre-grouping goods wagons, brake vans',
      refImage: ''
    },
    {
      name: "GNR Stirling Single 4-2-2 No. 1",
      altNames: ['Stirling Single', 'GNR No 1', 'Stirling 4-2-2'],
      manufacturer: 'Hornby',
      livery: 'GNR Stirling Green',
      categoryId: 'locomotives',
      subcategoryId: 'steam-pre-grouping',
      historicalBackground: "Patrick Stirling's magnificent 4-2-2 singles were the express engines of the Great Northern Railway from 1870. With their iconic 8-foot driving wheels, they hauled the East Coast expresses including the 'Race to the North' services. No. 1 is preserved at the National Railway Museum and is the oldest surviving standard gauge locomotive in the national collection.",
      goesWellWith: 'Pre-grouping six-wheel coaches, GNR corridor stock, vintage goods wagons',
      refImage: ''
    },

    // ===================== DIESEL =====================
    {
      name: "BR Class 55 'Deltic'",
      altNames: ['Deltic', 'Class 55', 'D9009', 'Alycidon', 'D9000', 'Royal Scots Grey'],
      manufacturer: 'Heljan',
      livery: 'BR Two-Tone Green',
      categoryId: 'locomotives',
      subcategoryId: 'diesel',
      historicalBackground: "The Class 55 Deltics were the most powerful single-unit diesel locomotives in the UK when introduced in 1961. 22 were built by English Electric at Vulcan Foundry. Named after racehorses and regiments, they dominated East Coast Main Line expresses for over 20 years, replacing Gresley Pacifics. Their distinctive Napier Deltic engines produced a unique sound. Six survive in preservation.",
      goesWellWith: 'BR Mk1 coaches, Mk2 coaches, BR blue/grey coaching stock, TPO vehicles, parcels stock',
      refImage: ''
    },
    {
      name: "BR Class 37",
      altNames: ['Class 37', 'English Electric Type 3', '37521', '37401', 'Tractor'],
      manufacturer: 'Heljan',
      livery: 'BR Large Logo Blue',
      categoryId: 'locomotives',
      subcategoryId: 'diesel',
      historicalBackground: "The Class 37 is one of the most successful and long-lived British diesel locomotive designs. 309 were built by English Electric at the Vulcan Foundry and Robert Stephenson & Hawthorns between 1960 and 1965. Incredibly versatile, they were found on passenger, freight, and engineering duties across the entire BR network. Many remain in service with freight operators and on heritage railways today.",
      goesWellWith: 'BR Mk1 coaches, Mk2 coaches, CDA china clay wagons, tank wagons, VDA vans, mixed freight',
      refImage: ''
    },
    {
      name: "BR Class 47",
      altNames: ['Class 47', 'Brush Type 4', '47500', '47401', '47810'],
      manufacturer: 'Heljan',
      livery: 'BR InterCity Executive',
      categoryId: 'locomotives',
      subcategoryId: 'diesel',
      historicalBackground: "The Class 47, built by Brush Traction at Loughborough, was the backbone of BR's main line diesel fleet. 512 were built between 1962 and 1968, making them the most numerous class of main line diesel in Britain. They hauled everything from express passengers to heavy freight and were found across the entire network. A significant number survive in preservation and some remain in commercial service.",
      goesWellWith: 'BR Mk1, Mk2, Mk3 coaches, InterCity stock, Freightliner flats, general freight',
      refImage: ''
    },
    {
      name: "BR Class 40",
      altNames: ['Class 40', 'English Electric Type 4', 'Whistler', 'D200', '40122'],
      manufacturer: 'Heljan',
      livery: 'BR Green',
      categoryId: 'locomotives',
      subcategoryId: 'diesel',
      historicalBackground: "The Class 40 was one of the first generation of main line diesel locomotives on British Railways. 200 were built by English Electric between 1958 and 1962. Known as 'Whistlers' for their distinctive turbocharger sound, they hauled express services on the London Midland and Eastern Regions. Their split-headcode boxes gave them a distinctive appearance.",
      goesWellWith: 'BR Mk1 coaches, BR maroon stock, parcels vans, mixed freight, TPO vehicles',
      refImage: ''
    },
    {
      name: "BR Class 66",
      altNames: ['Class 66', '66001', 'Shed', 'EWS 66', 'Freightliner 66'],
      manufacturer: 'Bachmann',
      livery: 'EWS Maroon & Gold',
      categoryId: 'locomotives',
      subcategoryId: 'diesel',
      historicalBackground: "The Class 66 is the most numerous diesel locomotive class currently operating in Britain. Built by EMD in London, Ontario, Canada, over 450 have been delivered since 1998 to various freight operators including EWS, Freightliner, GBRf, and DRS. They are the standard heavy freight locomotive of the modern railway, handling everything from coal to containers to aggregates.",
      goesWellWith: 'HTA coal hoppers, Freightliner flats, JNA wagons, MHA ballast wagons, tank wagons',
      refImage: ''
    },
    {
      name: "BR Class 08 Shunter",
      altNames: ['Class 08', 'Gronk', '08 Shunter', 'BR Shunter', 'D3000'],
      manufacturer: 'Hornby',
      livery: 'BR Green',
      categoryId: 'locomotives',
      subcategoryId: 'diesel',
      historicalBackground: "The Class 08 0-6-0 diesel-electric shunter is the most numerous locomotive class ever built for British Railways, with 996 examples constructed between 1952 and 1962. They are a familiar sight in goods yards and depots across the entire network. Many remain in industrial and heritage railway use today.",
      goesWellWith: 'Any freight wagons, brake vans, yard stock, fuel tankers',
      refImage: ''
    },

    // ===================== MULTIPLE UNITS =====================
    {
      name: "GWR Railcar No. 22",
      altNames: ['GWR Railcar', 'AEC Railcar', 'GWR Diesel Railcar'],
      manufacturer: 'Dapol',
      livery: 'GWR Chocolate & Cream',
      categoryId: 'locomotives',
      subcategoryId: 'multiple-units',
      historicalBackground: "The GWR diesel railcars were pioneering self-propelled vehicles introduced from 1933 to reduce operating costs on branch lines and cross-country routes. Built by AEC and Park Royal, they were streamlined and modern in appearance. They represented the GWR's forward-thinking approach to efficient rail travel and paved the way for later DMU designs.",
      goesWellWith: 'GWR branch line stock, GWR auto trailers, platform accessories',
      refImage: ''
    },
    {
      name: "BR Class 101 DMU",
      altNames: ['Class 101', 'Metro-Cammell DMU', 'First generation DMU'],
      manufacturer: 'Bachmann',
      livery: 'BR Green',
      categoryId: 'locomotives',
      subcategoryId: 'multiple-units',
      historicalBackground: "The Class 101 was a first-generation diesel multiple unit built by Metro-Cammell from 1956. They were designed to replace steam-hauled local and branch line services. Remarkably durable, some remained in service until 2003 — over 45 years. They were a familiar sight on secondary routes across the network.",
      goesWellWith: 'Branch line platforms, rural station buildings, lineside accessories',
      refImage: ''
    },

    // ===================== ROLLING STOCK =====================
    {
      name: "LNER Teak Corridor Coach (Composite)",
      altNames: ['LNER Teak Coach', 'Gresley Coach', 'LNER Corridor'],
      manufacturer: 'Bachmann',
      livery: 'LNER Teak',
      categoryId: 'rolling-stock',
      subcategoryId: 'rs-lner',
      historicalBackground: "The LNER teak coaches were the standard main line passenger stock on the East Coast, designed by Nigel Gresley. Their distinctive varnished teak finish gave ECML services a refined and elegant appearance that was widely admired. Gresley's coaches introduced articulation and many modern amenities.",
      goesWellWith: 'LNER A3, A4, V2 class locomotives, LNER dining cars, LNER brake composites',
      refImage: ''
    },
    {
      name: "GWR Collett Composite Coach",
      altNames: ['GWR Coach', 'Collett Coach', 'Chocolate & Cream Coach'],
      manufacturer: 'Dapol',
      livery: 'GWR Chocolate & Cream',
      categoryId: 'rolling-stock',
      subcategoryId: 'rs-gwr',
      historicalBackground: "The iconic chocolate and cream livery of Great Western Railway coaches is one of the most recognisable in British railway history. Collett's coaches were well-appointed and comfortable vehicles. The GWR was the only one of the Big Four companies to retain a two-tone passenger livery throughout the grouping era.",
      goesWellWith: 'GWR Castle class, King class, Hall class, GWR restaurant car, GWR pannier tanks',
      refImage: ''
    },
    {
      name: "BR Mk1 FK (First Corridor) Coach",
      altNames: ['BR Mk1', 'Mk1 Coach', 'Mark 1 Coach', 'BR Coach'],
      manufacturer: 'Bachmann',
      livery: 'BR Maroon',
      categoryId: 'rolling-stock',
      subcategoryId: 'rs-br',
      historicalBackground: "The BR Mk1 coach was the first standard design produced by British Railways after nationalisation in 1948. Over 4,600 were built between 1951 and 1963 at several works including Wolverton, Swindon, and York. They formed the backbone of BR passenger services for decades and many survive in preservation and on heritage railways today.",
      goesWellWith: 'BR Standard classes, Class 47, Class 37, Class 55, Mk1 BSK, Mk1 restaurant cars',
      refImage: ''
    },
    {
      name: "BR 16-Ton Mineral Wagon",
      altNames: ['16 ton mineral', 'Coal wagon', 'BR mineral wagon'],
      manufacturer: 'Bachmann',
      livery: 'BR Bauxite',
      categoryId: 'rolling-stock',
      subcategoryId: 'rs-br',
      historicalBackground: "The 16-ton mineral wagon was the standard coal wagon of British Railways, replacing the older pre-grouping private owner designs. Over 200,000 were built and they were a ubiquitous sight across the network, hauling coal from collieries to power stations, depots, and factories.",
      goesWellWith: 'BR 9F, 8F, Class 37, Class 47, BR brake vans, any freight locomotive',
      refImage: ''
    },
    {
      name: "Private Owner Coal Wagon",
      altNames: ['PO wagon', 'Private owner', 'Coal wagon PO'],
      manufacturer: 'Dapol',
      livery: 'Various Private Owner Liveries',
      categoryId: 'rolling-stock',
      subcategoryId: 'rs-pre-grouping',
      historicalBackground: "Private owner wagons were a distinctive feature of British railways before nationalisation. Collieries, steel works, gas companies, and coal merchants operated thousands of their own wagons, each with distinctive liveries and bold lettering advertising their owners. They were abolished under nationalisation when all wagons came under BR ownership.",
      goesWellWith: 'Pre-grouping locomotives, GWR pannier tanks, other PO wagons, brake vans',
      refImage: ''
    }
  ],

  // ============================================================
  //  Search function: fuzzy-match model names and alt names
  // ============================================================

  searchModels(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    const results = [];

    for (const model of this.models) {
      let score = 0;
      let matched = false;

      // Check primary name
      const nameLower = model.name.toLowerCase();
      if (nameLower.includes(q)) {
        score = nameLower.indexOf(q) === 0 ? 100 : 80 - nameLower.indexOf(q);
        matched = true;
      }

      // Check alt names
      if (!matched) {
        for (const alt of (model.altNames || [])) {
          const altLower = alt.toLowerCase();
          if (altLower.includes(q)) {
            const idx = altLower.indexOf(q);
            score = idx === 0 ? 90 : 60 - idx;
            matched = true;
            break;
          }
        }
      }

      if (matched) {
        results.push({ ...model, score });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 8);
  },

  // Look up a single model by exact name
  findModel(name) {
    return this.models.find(m => m.name === name) || null;
  }
};
