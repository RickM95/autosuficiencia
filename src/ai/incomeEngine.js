const INCOME_OPTIONS = {
  zeroCapital: [
    {
      id: 'vendor_helper',
      category: 'zeroCapital',
      titleEs: 'Ayudante de vendedor ambulante',
      titleEn: 'Street vendor assistant',
      descriptionEs: 'Ayudar a vendedores en mercados o calles durante horas pico. No necesitas experiencia, solo presentarte y ofrecer tu ayuda.',
      descriptionEn: 'Help street vendors in markets or streets during peak hours. No experience needed, just show up and offer help.',
      stepsEs: [
        'Identifica las calles o mercados más transitados de tu área entre 5–7pm',
        'Acércate a vendedores que se vean ocupados y ofrece ayudar por unas horas',
        'Acuerda un pago diario antes de empezar (espera L100–300 por turno)',
      ],
      stepsEn: [
        'Identify busiest streets or markets in your area between 5–7pm',
        'Approach busy-looking vendors and offer to help for a few hours',
        'Agree on daily pay before starting (expect $4–12 per shift)',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: [],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Muchos vendedores necesitan ayuda pero no lo anuncian. Llegar temprano y ser constante aumenta tus chances.',
      realityNotesEn: 'Most vendors need help but don\'t advertise it. Arriving early and being consistent increases your chances.',
    },
    {
      id: 'cleaning_service',
      category: 'zeroCapital',
      titleEs: 'Limpieza de casas o negocios',
      titleEn: 'Home or business cleaning',
      descriptionEs: 'Ofrecer limpieza básica en casas, pequeñas oficinas o talleres. Solo necesitas escoba, trapo y disposición.',
      descriptionEn: 'Offer basic cleaning at homes, small offices or workshops. You only need a broom, rag and willingness.',
      stepsEs: [
        'Camina por tu colonia y ofrece limpieza en casas que veas descuidadas o con jardín',
        'Pregunta en pequeñas tiendas, talleres o consultorios si necesitan limpieza semanal',
        'Cobra L100–200 por limpieza básica de 2–3 horas',
      ],
      stepsEn: [
        'Walk through your neighborhood and offer cleaning at homes that look unkept',
        'Ask at small shops, workshops or clinics if they need weekly cleaning',
        'Charge $4–8 for a basic 2–3 hour clean',
      ],
      timeToFirstIncomeEs: 'Mismo día o siguiente',
      timeToFirstIncomeEn: 'Same or next day',
      requiredResources: ['Escoba', 'Trapo', 'Agua'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'La limpieza es una necesidad constante. Una vez que consigues 2–3 clientes regulares, tienes ingreso semanal asegurado.',
      realityNotesEn: 'Cleaning is a constant need. Once you get 2–3 regular clients, you have weekly income secured.',
    },
    {
      id: 'yard_work',
      category: 'zeroCapital',
      titleEs: 'Trabajo de jardinería básica',
      titleEn: 'Basic yard work',
      descriptionEs: 'Cortar césped, limpiar patios, podar arbustos. Muchas personas mayores necesitan ayuda con esto semanalmente.',
      descriptionEn: 'Mow lawns, clean yards, trim bushes. Many elderly people need weekly help with this.',
      stepsEs: [
        'Consigue un machete o tijeras de podar (puedes pedir prestadas)',
        'Ofrece en tu colonia: "le corto su césped por L150"',
        'Deja tu número en 3–4 casas con jardín grande',
      ],
      stepsEn: [
        'Get a machete or pruning shears (you can borrow them)',
        'Offer in your neighborhood: "I\'ll mow your lawn for $6"',
        'Leave your number at 3–4 houses with large yards',
      ],
      timeToFirstIncomeEs: '1–2 días',
      timeToFirstIncomeEn: '1–2 days',
      requiredResources: ['Machete o tijeras'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'En temporada de lluvia el césped crece rápido y la demanda aumenta. Aprovecha los fines de semana.',
      realityNotesEn: 'In rainy season grass grows fast and demand increases. Weekends are prime time.',
    },
    {
      id: 'construction_helper',
      category: 'zeroCapital',
      titleEs: 'Ayudante de construcción',
      titleEn: 'Construction helper',
      descriptionEs: 'Las obras pequeñas siempre necesitan manos extras para cargar materiales, mezclar cemento y limpiar.',
      descriptionEn: 'Small construction sites always need extra hands to carry materials, mix cement and clean up.',
      stepsEs: [
        'Identifica construcciones o remodelaciones en tu área',
        'Pregunta directamente al maestro de obra si necesitan ayudante',
        'Ofrece trabajar el día completo por L200–400',
      ],
      stepsEn: [
        'Spot construction or remodeling sites in your area',
        'Ask the foreman directly if they need a helper',
        'Offer to work a full day for $8–16',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: ['Guantes (opcional)', 'Agua'],
      riskLevel: 'Medio',
      riskLevelEn: 'Medium',
      realityNotesEs: 'Trabajo físicamente exigente pero bien pagado. Lleva tu propia agua y comida. Llega temprano (6am).',
      realityNotesEn: 'Physically demanding but well-paid work. Bring your own water and food. Arrive early (6am).',
    },
    {
      id: 'car_wash',
      category: 'zeroCapital',
      titleEs: 'Lavadero de carros móvil',
      titleEn: 'Mobile car wash',
      descriptionEs: 'Ofrecer lavado de carros a domicilio con cubeta, jabón y agua. Los fines de semana hay mucha demanda.',
      descriptionEn: 'Offer mobile car washing with a bucket, soap and water. Weekends have high demand.',
      stepsEs: [
        'Consigue una cubeta, jabón, esponja y un trapo de secar',
        'Ofrece en la calle o colonia: "le lavo su carro en su casa por L100"',
        'Lava 3–4 carros por día los sábados y domingos',
      ],
      stepsEn: [
        'Get a bucket, soap, sponge and drying cloth',
        'Offer on the street or neighborhood: "I\'ll wash your car at home for $4"',
        'Wash 3–4 cars per day on Saturdays and Sundays',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: ['Cubeta', 'Jabón', 'Esponja', 'Trapo'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Los fines de semana son los mejores días. Ofrece lavado interior + exterior por L150.',
      realityNotesEn: 'Weekends are the best days. Offer interior + exterior wash for $6.',
    },
    {
      id: 'loading_help',
      category: 'zeroCapital',
      titleEs: 'Cargador en mercados o pulperías',
      titleEn: 'Loader at markets or shops',
      descriptionEs: 'Mercados y pulperías necesitan gente para cargar y descargar mercadería, especialmente en días de entrega.',
      descriptionEn: 'Markets and corner stores need people to load and unload goods, especially on delivery days.',
      stepsEs: [
        'Ve al mercado local o pulperías grandes entre 6–8am (hora de entrega)',
        'Ofrece ayudar a cargar mercadería por L50–100 por hora',
        'Vuelve los mismos días cada semana para volverte conocido',
      ],
      stepsEn: [
        'Go to the local market or large corner stores between 6–8am (delivery time)',
        'Offer to help load goods for $2–4 per hour',
        'Come back the same days each week so they know you',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: [],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Trabajo irregular pero constante. Si llegas temprano varios días, los comerciantes te van a buscar.',
      realityNotesEn: 'Irregular but steady work. If you show up early consistently, vendors will seek you out.',
    },
  ],
  microTrade: [
    {
      id: 'resell_goods',
      category: 'microTrade',
      titleEs: 'Reventa de productos básicos',
      titleEn: 'Basic goods reselling',
      descriptionEs: 'Compra productos al por mayor en el mercado y véndelos en tu colonia. Jabón, velas, fósforos, pilas, huevos.',
      descriptionEn: 'Buy products wholesale at the market and sell them in your neighborhood. Soap, candles, matches, batteries, eggs.',
      stepsEs: [
        'Identifica productos pequeños que se vendan rápido: huevos, jabón, pilas, velas',
        'Compra una cantidad pequeña en el mercado mayorista (inicia con L200)',
        'Vende puerta a puerta en tu colonia cobrando L5–10 más de lo que pagaste',
      ],
      stepsEn: [
        'Identify small products that sell fast: eggs, soap, batteries, candles',
        'Buy a small quantity at the wholesale market (start with $8)',
        'Sell door to door in your neighborhood, charging $0.20–0.40 more than you paid',
      ],
      timeToFirstIncomeEs: '1–2 días',
      timeToFirstIncomeEn: '1–2 days',
      requiredResources: ['Capital inicial L200–500'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Compra solo lo que puedas vender en 2–3 días. Los huevos y pilas siempre se venden.',
      realityNotesEn: 'Only buy what you can sell in 2–3 days. Eggs and batteries always sell.',
    },
    {
      id: 'street_snacks',
      category: 'microTrade',
      titleEs: 'Venta de snacks en la calle',
      titleEn: 'Street snacks sales',
      descriptionEs: 'Vender fruta picada, baleadas, o dulces en esquinas concurridas o cerca de escuelas.',
      descriptionEn: 'Sell cut fruit, baleadas, or candy on busy corners or near schools.',
      stepsEs: [
        'Compra ingredientes básicos para baleadas o fruta de temporada (inicia con L150)',
        'Prepara 20–30 unidades y véndelas cerca de una escuela u oficina a la hora de salida',
        'Ofrece precio bajo (L10–20 por unidad) para vender rápido',
      ],
      stepsEn: [
        'Buy basic ingredients for baleadas or seasonal fruit (start with $6)',
        'Prepare 20–30 units and sell near a school or office at closing time',
        'Offer low price ($0.40–0.80 per unit) to sell fast',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: ['Capital inicial L150–300'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Las baleadas son las más vendidas. La hora de salida de escuelas (12pm y 4pm) es la mejor.',
      realityNotesEn: 'Baleadas sell the most. School closing hours (12pm and 4pm) are best.',
    },
    {
      id: 'used_items',
      category: 'microTrade',
      titleEs: 'Venta de artículos usados',
      titleEn: 'Used item sales',
      descriptionEs: 'Compra ropa, zapatos, o electrodomésticos usados baratos y revéndelos en mercados o WhatsApp.',
      descriptionEn: 'Buy cheap used clothes, shoes or appliances and resell them at markets or on WhatsApp.',
      stepsEs: [
        'Visita ventas de garage o mercados de pulga y compra ropa o cosas en buen estado',
        'Toma fotos con tu teléfono y publícalo en grupos de WhatsApp de tu colonia',
        'Vende cada artículo con L20–50 de ganancia',
      ],
      stepsEn: [
        'Visit garage sales or flea markets and buy clothes or items in good condition',
        'Take photos with your phone and post in neighborhood WhatsApp groups',
        'Sell each item with $1–2 profit',
      ],
      timeToFirstIncomeEs: '1–7 días',
      timeToFirstIncomeEn: '1–7 days',
      requiredResources: ['Capital inicial L200–500', 'Teléfono con WhatsApp'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Ropa de niños en buen estado se vende rápido. Zapatos también.',
      realityNotesEn: 'Kids clothes in good condition sell fast. Shoes too.',
    },
    {
      id: 'water_ice',
      category: 'microTrade',
      titleEs: 'Venta de agua o hielo',
      titleEn: 'Water or ice sales',
      descriptionEs: 'En épocas de calor, vender bolsas de agua fría o hielo es negocio seguro en colonias sin acceso fácil.',
      descriptionEn: 'In hot seasons, selling cold water bags or ice is a reliable business in neighborhoods without easy access.',
      stepsEs: [
        'Compra hielo en fábrica (L30–50 por bolsa grande) o embolsa agua purificada',
        'Ofrece en tu colonia: "agua fría, hielo" — usa un carretón o hielera',
        'Vende cada bolsa de agua a L5–10 o el hielo por libra a L10',
      ],
      stepsEn: [
        'Buy ice at the factory ($1–2 per large bag) or bag purified water',
        'Offer in your neighborhood: "cold water, ice" — use a cart or cooler',
        'Sell each water bag for $0.20–0.40 or ice per pound at $0.40',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: ['Capital inicial L100–200', 'Hielera o carretón'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'En temporada de calor (marzo–mayo) se vende todo. No necesitas permiso para cantidades pequeñas.',
      realityNotesEn: 'In hot season (March–May) it all sells. No permit needed for small quantities.',
    },
  ],
  serviceBased: [
    {
      id: 'phone_assis',
      category: 'serviceBased',
      titleEs: 'Asistente con teléfono para adultos mayores',
      titleEn: 'Phone assistant for elderly',
      descriptionEs: 'Muchas personas mayores necesitan ayuda para usar WhatsApp, hacer llamadas, o trámites en el celular.',
      descriptionEn: 'Many elderly people need help with WhatsApp, phone calls, or cell phone procedures.',
      stepsEs: [
        'Pregunta en tu colonia si hay adultos mayores que vivan solos',
        'Ofrece: "le ayudo con su teléfono — recargas, WhatsApp, llamadas — por L50"',
        'Visita 2–3 veces por semana para mantener el servicio',
      ],
      stepsEn: [
        'Ask in your neighborhood if there are elderly people living alone',
        'Offer: "I\'ll help with your phone — top-ups, WhatsApp, calls — for $2"',
        'Visit 2–3 times per week to maintain the service',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: ['Paciencia', 'Saber usar WhatsApp básico'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Muchos ancianos tienen teléfono pero no saben usarlo. Con 5–6 clientes semanales tienes ingreso estable.',
      realityNotesEn: 'Many elderly have phones but don\'t know how to use them. With 5–6 weekly clients you have steady income.',
    },
    {
      id: 'delivery_helper',
      category: 'serviceBased',
      titleEs: 'Repartidor de compras locales',
      titleEn: 'Local delivery person',
      descriptionEs: 'Las tiendas y comedores necesitan repartir pedidos. Si tienes bicicleta o moto, puedes ofrecer delivery.',
      descriptionEn: 'Shops and small restaurants need to deliver orders. If you have a bike or motorcycle, you can offer delivery.',
      stepsEs: [
        'Ofrece a 3–4 comedores o tiendas de tu área: "le hago los deliveries por L20–30 por viaje"',
        'Ten tu número listo para cuando llamen',
        'Prioriza horarios de comida (11am–1pm y 6–8pm)',
      ],
      stepsEn: [
        'Offer 3–4 small restaurants or shops: "I\'ll do deliveries for $1 per trip"',
        'Have your number ready for when they call',
        'Prioritize meal hours (11am–1pm and 6–8pm)',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: ['Bicicleta o moto', 'Teléfono'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Si tienes bicicleta, puedes repartir para varias tiendas a la vez. Acuerda pago semanal fijo si hay demanda.',
      realityNotesEn: 'If you have a bike, you can deliver for multiple shops. Arrange weekly fixed pay if there\'s demand.',
    },
    {
      id: 'basic_repairs',
      category: 'serviceBased',
      titleEs: 'Reparaciones básicas',
      titleEn: 'Basic repairs',
      descriptionEs: 'Reparar sillas, mesas, puertas, cambiar cerraduras, arreglar fugas. Aprende rápido viendo tutoriales.',
      descriptionEn: 'Fix chairs, tables, doors, change locks, fix leaks. Learn quickly from tutorials.',
      stepsEs: [
        'Mira 2–3 videos en YouTube de reparaciones básicas (cerraduras, fugas, muebles)',
        'Ofrece en tu colonia "arreglo sillas, mesas, puertas — L50–100"',
        'Compra herramientas básicas con tus primeras ganancias',
      ],
      stepsEn: [
        'Watch 2–3 YouTube videos on basic repairs (locks, leaks, furniture)',
        'Offer in your neighborhood "I fix chairs, tables, doors — $2–4"',
        'Buy basic tools with your first earnings',
      ],
      timeToFirstIncomeEs: '1–3 días',
      timeToFirstIncomeEn: '1–3 days',
      requiredResources: ['Destornillador', 'Martillo', 'Clavos (L100 inicial)'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Las reparaciones simples son muy solicitadas. Una vez que haces un buen trabajo, el voz a voz trae más clientes.',
      realityNotesEn: 'Simple repairs are highly demanded. Once you do good work, word-of-mouth brings more clients.',
    },
    {
      id: 'errand_service',
      category: 'serviceBased',
      titleEs: 'Mandadero',
      titleEn: 'Errand runner',
      descriptionEs: 'Ir al banco, pagar servicios, hacer filas, comprar mercado. Mucha gente mayor o muy ocupada paga por esto.',
      descriptionEn: 'Go to the bank, pay bills, stand in lines, buy groceries. Many elderly or busy people pay for this.',
      stepsEs: [
        'Ofrece en tu colonia: "le hago sus mandados — banco, pagos, compras — L50 por hora"',
        'Ten una libreta para anotar los encargos',
        'Deja recibos de todo lo que compras o pagas',
      ],
      stepsEn: [
        'Offer in your neighborhood: "I\'ll run your errands — bank, payments, shopping — $2 per hour"',
        'Keep a notebook to track errands',
        'Keep receipts for everything you buy or pay',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: ['Libreta', 'Bolígrafo'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'La confianza lo es todo. Empieza con vecinos conocidos y pide referencias.',
      realityNotesEn: 'Trust is everything. Start with known neighbors and ask for referrals.',
    },
  ],
  resourceBased: [
    {
      id: 'whatsapp_catalog',
      category: 'resourceBased',
      titleEs: 'Catálogo WhatsApp',
      titleEn: 'WhatsApp catalog sales',
      descriptionEs: 'Vender productos a través de catálogos en WhatsApp: ropa, cosméticos, productos del hogar. Muchas empresas dan catálogos digitales.',
      descriptionEn: 'Sell products through WhatsApp catalogs: clothes, cosmetics, home products. Many companies provide digital catalogs.',
      stepsEs: [
        'Pide un catálogo digital a una empresa local (ropa, cosméticos, hogar)',
        'Reenvía las fotos a grupos de WhatsApp de tu colonia con precios',
        'Entrega personalmente y cobra al entregar',
      ],
      stepsEn: [
        'Request a digital catalog from a local company (clothes, cosmetics, home)',
        'Forward photos to neighborhood WhatsApp groups with prices',
        'Deliver personally and collect payment on delivery',
      ],
      timeToFirstIncomeEs: '1–3 días',
      timeToFirstIncomeEn: '1–3 days',
      requiredResources: ['Teléfono con WhatsApp', 'Grupos de WhatsApp'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'No necesitas invertir si trabajas con catálogo. Solo compras cuando ya tienes el pedido y el pago.',
      realityNotesEn: 'You don\'t need to invest if working with a catalog. Only buy when you have the order and payment.',
    },
    {
      id: 'food_prep',
      category: 'resourceBased',
      titleEs: 'Comida preparada casera',
      titleEn: 'Home-cooked meals',
      descriptionEs: 'Si tienes cocina, prepara almuerzos y véndelos a trabajadores cerca de tu casa. Comida sencilla pero abundante.',
      descriptionEn: 'If you have a kitchen, prepare lunches and sell to workers near your home. Simple but abundant food.',
      stepsEs: [
        'Cocina 10–15 almuerzos (arroz, frijoles, carne/huevo, tortillas)',
        'Ofrece a trabajadores de construcción o talleres cercanos a la hora del almuerzo',
        'Cobra L40–60 por almuerzo completo',
      ],
      stepsEn: [
        'Cook 10–15 lunches (rice, beans, meat/egg, tortillas)',
        'Offer to construction workers or nearby shops at lunchtime',
        'Charge $1.50–2.50 per complete lunch',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: ['Cocina', 'Gas', 'Ingredientes básicos'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Comienza con una sola opción de menú para no desperdiciar comida. Los trabajadores valoran comida casera abundante.',
      realityNotesEn: 'Start with one menu option to avoid food waste. Workers value abundant homemade food.',
    },
    {
      id: 'bike_taxi',
      category: 'resourceBased',
      titleEs: 'Taxi en bicicleta (bici-taxi)',
      titleEn: 'Bike taxi (bici-taxi)',
      descriptionEs: 'Si tienes bicicleta, puedes llevar personas distancias cortas en tu colonia por una tarifa pequeña.',
      descriptionEn: 'If you have a bike, you can carry people short distances in your neighborhood for a small fee.',
      stepsEs: [
        'Consigue una bicicleta en buen estado (puede ser prestada)',
        'Ofrece viajes cortos en tu colonia: "la llevo a la esquina por L10–20"',
        'Enfócate en horas pico (7–8am, 12pm, 5–6pm)',
      ],
      stepsEn: [
        'Get a bike in good condition (can be borrowed)',
        'Offer short rides in your neighborhood: "I\'ll take you for $0.40–0.80"',
        'Focus on peak hours (7–8am, 12pm, 5–6pm)',
      ],
      timeToFirstIncomeEs: 'Mismo día',
      timeToFirstIncomeEn: 'Same day',
      requiredResources: ['Bicicleta'],
      riskLevel: 'Medio',
      riskLevelEn: 'Medium',
      realityNotesEs: 'No necesitas permiso municipal para distancias cortas en tu colonia. Sé visible y consistente.',
      realityNotesEn: 'No municipal permit needed for short distances in your neighborhood. Be visible and consistent.',
    },
  ],
  skillBuilding: [
    {
      id: 'learn_barber',
      category: 'skillBuilding',
      titleEs: 'Aprender barbería básica',
      titleEn: 'Learn basic barbering',
      descriptionEs: 'Cortes de cabello básicos. Con una máquina y práctica puedes empezar a cobrar en tu colonia.',
      descriptionEn: 'Basic haircuts. With clippers and practice you can start charging in your neighborhood.',
      stepsEs: [
        'Consigue una máquina de cortar (L300–500 usada)',
        'Practica con familiares o amigos gratis',
        'Ofrece cortes a L30–50 hasta que tengas experiencia, luego sube a L80',
      ],
      stepsEn: [
        'Get clippers ($12–20 used)',
        'Practice on family or friends for free',
        'Offer cuts at $1–2 until you have experience, then raise to $3',
      ],
      timeToFirstIncomeEs: '1–2 semanas',
      timeToFirstIncomeEn: '1–2 weeks',
      requiredResources: ['Máquina de cortar pelo', 'Tijeras', 'Capa'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Los cortes de cabello son una necesidad constante. Con 5 clientes por semana recuperas la inversión en un mes.',
      realityNotesEn: 'Haircuts are a constant need. With 5 clients per week you recover the investment in a month.',
    },
    {
      id: 'learn_sewing',
      category: 'skillBuilding',
      titleEs: 'Aprender costura básica',
      titleEn: 'Learn basic sewing',
      descriptionEs: 'Remendar ropa, hacer dobladillos, cambiar cierres. Una máquina de coser usada y práctica.',
      descriptionEn: 'Mend clothes, make hems, change zippers. A used sewing machine and practice.',
      stepsEs: [
        'Consigue una máquina de coser usada (L500–1000) o prestada',
        'Aprende costuras básicas en YouTube (3–4 videos)',
        'Ofrece: "arreglo su ropa — dobladillos, cierres, remiendos — L30–60"',
      ],
      stepsEn: [
        'Get a used sewing machine ($20–40) or borrow one',
        'Learn basic stitches on YouTube (3–4 videos)',
        'Offer: "I mend clothes — hems, zippers, patches — $1–2"',
      ],
      timeToFirstIncomeEs: '1–3 semanas',
      timeToFirstIncomeEn: '1–3 weeks',
      requiredResources: ['Máquina de coser', 'Hilo', 'Agujas', 'Tijeras'],
      riskLevel: 'Bajo',
      riskLevelEn: 'Low',
      realityNotesEs: 'Siempre hay ropa que remendar. Ofrece en tu colonia y deja muestras de tu trabajo.',
      realityNotesEn: 'There\'s always clothes to mend. Offer in your neighborhood and leave samples of your work.',
    },
  ],
}

const HND_SPECIFIC_NOTES = {
  currencyEs: 'Todos los precios están en Lempiras (L). L100 ≈ $4 USD.',
  currencyEn: 'All prices are in Lempiras (L). L100 ≈ $4 USD.',
  timingEs: 'El mejor momento para buscar trabajo informal es temprano en la mañana (6–8am) o a la hora de la comida (11am–1pm).',
  timingEn: 'Best time to look for informal work is early morning (6–8am) or lunchtime (11am–1pm).',
  transportEs: 'Si no tienes para el bus, empieza en tu propia colonia. Camina 15–20 minutos alrededor.',
  transportEn: 'If you can\'t afford bus fare, start in your own neighborhood. Walk 15–20 minutes around.',
  safetyEs: 'Trabaja en áreas que conozcas. No cargues todo tu dinero contigo. Guarda tus ganancias en cuanto puedas.',
  safetyEn: 'Work in areas you know. Don\'t carry all your money. Save your earnings as soon as you can.',
}

function assessUserContext(memory, context = {}) {
  const inputs = memory.userInputs || []
  const allText = inputs.map(u => u.content).join(' ').toLowerCase()

  const hasPhone = /\b(tel[eé]fono|celular|phone|cell(phone)?|m[oó]vil|smartphone|android)\b/i.test(allText) || context.hasPhone
  const hasBike = /\b(bici|bicicleta|bike|bicycle)\b/i.test(allText) || context.hasBike
  const hasKitchen = /\b(cocina|kitchen|cocinar|cook(ing)?)\b/i.test(allText) || context.hasKitchen
  const hasTransport = /\b(moto|motorcycle|carro|vehicle|auto|coche|transport|car|van|camioneta|pickup)\b/i.test(allText) || context.hasTransport

  const hasSkills = /\b(carpinter[íi]a|carpentry|costura|sewing|cocina|cook(ing)?|plomer[íi]a|plumbing|electricidad|electrical|mec[aá]nica|mechanics|ense[ñn]ar|teaching|construcci[óo]n|construction|pintar|painting|carpenter|seamstress)\b/i.test(allText)

  const mentionedCapital = allText.match(/\b(\d{3,})\b/)
  const hasCapital = mentionedCapital !== null && parseInt(mentionedCapital[1]) >= 200

  const isOverwhelmed = memory.sentiment === 'overwhelmed' || /\b(overwhelm|abrumado|no sé|don't know|lost|perdido|estresado|stressed)\b/i.test(allText)
  const hasNothing = !hasPhone && !hasBike && !hasKitchen && !hasSkills && !hasCapital

  const location = context.location || memory.facts?.location || ''
  const isUrban = /\b(ciudad|city|tegucigalpa|san pedro|sps|la ceiba|comayagua|choluteca|santa rosa|villa)\b/i.test(location) || context.isUrban

  return {
    hasPhone, hasBike, hasKitchen, hasTransport,
    hasSkills, hasCapital, hasNothing,
    isOverwhelmed, isUrban,
    location, allText,
  }
}

function categoryPriority(userState) {
  if (userState.isOverwhelmed) {
    return ['zeroCapital']
  }
  if (userState.hasNothing) {
    return ['zeroCapital']
  }
  if (userState.hasCapital && userState.hasPhone) {
    return ['microTrade', 'zeroCapital', 'serviceBased', 'resourceBased']
  }
  if (userState.hasBike || userState.hasTransport) {
    return ['serviceBased', 'zeroCapital', 'microTrade', 'resourceBased']
  }
  if (userState.hasPhone) {
    return ['serviceBased', 'zeroCapital', 'resourceBased', 'microTrade']
  }
  if (userState.hasKitchen) {
    return ['resourceBased', 'zeroCapital', 'serviceBased']
  }
  return ['zeroCapital', 'serviceBased', 'microTrade', 'resourceBased']
}

function filterOptionsByUser(options, userState, maxOptions) {
  const filtered = []
  const priorities = categoryPriority(userState)
  const optIndex = {} // track how many taken per category

  while (filtered.length < maxOptions) {
    let added = false
    for (const category of priorities) {
      if (filtered.length >= maxOptions) break
      const pool = options[category] || []
      const idx = optIndex[category] || 0
      if (idx >= pool.length) continue
      const opt = pool[idx]
      optIndex[category] = idx + 1
      if (userState.hasNothing && opt.requiredResources.length > 1) continue
      if (userState.isOverwhelmed && opt.requiredResources.length > 0) continue
      filtered.push(opt)
      added = true
    }
    if (!added) break
  }

  return filtered
}

export function generateIncomeOptions(memory, context = {}) {
  const userState = assessUserContext(memory, context)
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en

  const maxOptions = userState.isOverwhelmed ? 2 : 4
  const selected = filterOptionsByUser(INCOME_OPTIONS, userState, maxOptions)

  return {
    immediateOptions: selected.filter(o => {
      const time = lang === 'es' ? o.timeToFirstIncomeEs : o.timeToFirstIncomeEn
      return /(mismo día|same day|siguiente|next|1–2 días|1–2 days)/i.test(time)
    }),
    shortTermOptions: selected.filter(o => {
      const time = lang === 'es' ? o.timeToFirstIncomeEs : o.timeToFirstIncomeEn
      return !/(mismo día|same day)/i.test(time)
    }),
    allOptions: selected,
    userState,
    notes: {
      currency: t(HND_SPECIFIC_NOTES.currencyEs, HND_SPECIFIC_NOTES.currencyEn),
      timing: t(HND_SPECIFIC_NOTES.timingEs, HND_SPECIFIC_NOTES.timingEn),
      transport: t(HND_SPECIFIC_NOTES.transportEs, HND_SPECIFIC_NOTES.transportEn),
      safety: t(HND_SPECIFIC_NOTES.safetyEs, HND_SPECIFIC_NOTES.safetyEn),
    },
  }
}

export function generateIncomeResponse(memory, context = {}) {
  const lang = memory.language || 'es'
  const t = (es, en) => lang === 'es' ? es : en
  const result = generateIncomeOptions(memory, context)
  const { allOptions, userState, notes } = result

  const lines = []

  if (userState.isOverwhelmed) {
    lines.push(t(
      `No te preocupes por todo a la vez. Vamos a enfocarnos en algo peque\u00f1o que puedas hacer HOY para generar algo de ingreso.\n`,
      `Don't worry about everything at once. Let's focus on something small you can do TODAY to generate some income.\n`
    ))
  } else {
    lines.push(t(
      `Basado en tu situaci\u00f3n, aqu\u00ed hay opciones pr\u00e1cticas que puedes empezar r\u00e1pido:\n`,
      `Based on your situation, here are practical options you can start quickly:\n`
    ))
  }

  for (const opt of allOptions) {
    const title = lang === 'es' ? opt.titleEs : opt.titleEn
    const desc = lang === 'es' ? opt.descriptionEs : opt.descriptionEn
    const steps = lang === 'es' ? opt.stepsEs : opt.stepsEn
    const time = lang === 'es' ? opt.timeToFirstIncomeEs : opt.timeToFirstIncomeEn
    const risk = lang === 'es' ? opt.riskLevel : opt.riskLevelEn
    const reality = lang === 'es' ? opt.realityNotesEs : opt.realityNotesEn

    lines.push(`**${title}**`)
    lines.push(desc)
    lines.push('')
    for (let i = 0; i < steps.length; i++) {
      lines.push(`${i + 1}. ${steps[i]}`)
    }
    lines.push('')
    lines.push(t(`\u23f1 Tiempo: ${time}`, `\u23f1 Time: ${time}`))
    lines.push(t(`\u26a0 Riesgo: ${risk}`, `\u26a0 Risk: ${risk}`))
    lines.push(t(`\ud83d\udca1 ${reality}`, `\ud83d\udca1 ${reality}`))
    lines.push('')
    if (opt.requiredResources.length > 0) {
      const res = opt.requiredResources.join(', ')
      lines.push(t(`Necesitas: ${res}`, `You need: ${res}`))
      lines.push('')
    }
  }

  if (allOptions.length === 0) {
    lines.push(t(
      `Basado en lo que me has contado, lo m\u00e1s pr\u00e1ctico es empezar con trabajos sencillos como los que mencion\u00e9 arriba. ¿Quieres que te gu\u00ede paso a paso?`,
      `Based on what you've shared, the most practical thing is to start with simple work like what I mentioned above. Want me to guide you step by step?`
    ))
  }

  if (!userState.isOverwhelmed && allOptions.length <= 3) {
    lines.push(t(
      `¿Quieres que te explique alguno de estos con m\u00e1s detalle o prefieres explorar otras opciones?`,
      `Would you like me to explain any of these in more detail or explore other options?`
    ))
  }

  lines.push('')
  lines.push(t(
    `\ud83d\udcb0 ${HND_SPECIFIC_NOTES.currencyEs}`,
    `\ud83d\udcb0 ${HND_SPECIFIC_NOTES.currencyEn}`
  ))

  return {
    text: lines.join('\n'),
    options: result,
    userState,
  }
}
