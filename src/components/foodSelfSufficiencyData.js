export const EDUCATION = {
  whyStorage: {
    es: "Almacenar alimentos te protege contra emergencias: pérdida de empleo, desastres naturales, inflación. Cuando tienes comida guardada, el dinero deja de ser urgente — puedes esperar a mejores precios y no comprar por desesperación.",
    en: "Storing food protects you against emergencies: job loss, natural disasters, inflation. When you have food stored, money stops being urgent — you can wait for better prices and never buy out of desperation."
  },
  whyVariety: {
    es: "Solo arroz y frijoles te dan carbohidratos y algo de proteína, pero te faltan vitaminas, minerales y grasas esenciales. Sin variedad, tu cuerpo se debilita. Cada color de comida aporta algo diferente: verduras = vitaminas, grasas = energía duradera, frutas = defensas.",
    en: "Only rice and beans give you carbs and some protein, but you lack vitamins, minerals, and essential fats. Without variety, your body weakens. Each food color brings something different: vegetables = vitamins, fats = lasting energy, fruits = defenses."
  },
  whySeasoning: {
    es: "Comer lo mismo todos los días sin sabor lleva al abandono del plan. La sal, ajo, cebolla, comino, y hierbas transforman comidas simples. Un frasco de condimentos cuesta poco pero salva tu motivación.",
    en: "Eating the same thing every day without flavor leads to abandoning the plan. Salt, garlic, onion, cumin, and herbs transform simple meals. A jar of seasonings costs little but saves your motivation."
  },
  whyPlanning: {
    es: "Planificar tus comidas semanales evita: comprar de más, olvidar ingredientes, tirar comida echada a perder, y comer por impulso. Un plan de 15 minutos cada domingo te ahorra dinero y estrés toda la semana.",
    en: "Planning your weekly meals prevents: overbuying, forgetting ingredients, throwing away spoiled food, and impulse eating. A 15-minute plan every Sunday saves you money and stress all week."
  }
}

export const SECURITY_LEVELS = [
  {
    level: 1,
    color: "red",
    emoji: "🟥",
    titleEs: "1 SEMANA — Estabilidad Básica",
    titleEn: "1 WEEK — Basic Stability",
    goalEs: "Sin hambre. Comer 3 veces al día con lo mínimo.",
    goalEn: "No hunger. Eat 3 times a day with the bare minimum.",
    detailsEs: [
      "Solo granos básicos (arroz, frijoles, maíz)",
      "Comidas simples: arroz + frijoles + tortilla",
      "Huevos si el presupuesto lo permite",
      "Sal y azúcar básicos",
      "Té de hierbas para acompañar"
    ],
    detailsEn: [
      "Only basic grains (rice, beans, corn)",
      "Simple meals: rice + beans + tortilla",
      "Eggs if budget allows",
      "Basic salt and sugar",
      "Herbal tea to accompany"
    ],
    staples: { es: "Arroz (5kg), Frijoles (3kg), Harina de maíz (3kg), Sal (0.5kg), Azúcar (1kg), Aceite (1L), Té de Hierbas (2 cajas)", en: "Rice (5kg), Beans (3kg), Corn flour (3kg), Salt (0.5kg), Sugar (1kg), Oil (1L), Herbal Tea (2 boxes)" }
  },
  {
    level: 2,
    color: "orange",
    emoji: "🟧",
    titleEs: "1 MES — Seguridad Alimentaria",
    titleEn: "1 MONTH — Food Security",
    goalEs: "Cobertura completa de básicos con algo de variedad.",
    goalEn: "Full staple coverage with some variety.",
    detailsEs: [
      "Arroz, frijoles, maíz, pasta, avena",
      "Huevos y pollo incluidos",
      "Cebolla, ajo, tomate para sabor",
      "Condimentos: comino, consomé de pollo",
      "Leche en polvo para nutrición",
      "Bananos o fruta de temporada"
    ],
    detailsEn: [
      "Rice, beans, corn, pasta, oats",
      "Eggs and chicken included",
      "Onion, garlic, tomato for flavor",
      "Seasonings: cumin, chicken bouillon",
      "Powdered milk for nutrition",
      "Bananas or seasonal fruit"
    ],
    staples: { es: "Arroz (10kg), Frijoles (5kg), Harina maíz (5kg), Pasta (2kg), Avena (2kg), Aceite (2L), Huevos (30), Pollo (3kg), Leche polvo (1kg), Sal (1kg), Azúcar (2kg), Té de Hierbas (4 cajas), Condimentos", en: "Rice (10kg), Beans (5kg), Corn flour (5kg), Pasta (2kg), Oats (2kg), Oil (2L), Eggs (30), Chicken (3kg), Milk powder (1kg), Salt (1kg), Sugar (2kg), Herbal Tea (4 boxes), Seasonings" }
  },
  {
    level: 3,
    color: "yellow",
    emoji: "🟨",
    titleEs: "3 MESES — Buffer de Almacenamiento",
    titleEn: "3 MONTHS — Storage Buffer",
    goalEs: "Compras al por mayor. Rotación de inventario. Menos dependencia del mercado.",
    goalEn: "Bulk buying. Inventory rotation. Reduced market dependence.",
    detailsEs: [
      "Staples comprados en bolsas grandes (25-50 libras)",
      "Rotación: lo primero que entra es lo primero que sale",
      "Atún y sardinas en lata como respaldo de proteína",
      "Verduras de larga duración: repollo, zanahoria, papa",
      "Mantequilla/margarina para grasas",
      "Hierbas secas y especias para variedad"
    ],
    detailsEn: [
      "Staples bought in bulk bags (25-50 lbs)",
      "Rotation: first in, first out",
      "Canned tuna and sardines as protein backup",
      "Long-lasting vegetables: cabbage, carrots, potatoes",
      "Butter/margarine for fats",
      "Dried herbs and spices for variety"
    ],
    staples: { es: "Arroz (25kg), Frijoles (12kg), Harina maíz (10kg), Pasta (5kg), Avena (5kg), Aceite (5L), Huevos (90), Pollo (10kg), Atún (12 latas), Leche polvo (3kg), Sal (2kg), Azúcar (5kg), Té de Hierbas (10 cajas), Especias variadas", en: "Rice (25kg), Beans (12kg), Corn flour (10kg), Pasta (5kg), Oats (5kg), Oil (5L), Eggs (90), Chicken (10kg), Tuna (12 cans), Milk powder (3kg), Salt (2kg), Sugar (5kg), Herbal Tea (10 boxes), Various spices" }
  },
  {
    level: 4,
    color: "green",
    emoji: "🟩",
    titleEs: "6 MESES — Estabilidad Nutricional",
    titleEn: "6 MONTHS — Nutritional Stability",
    goalEs: "Balance nutricional mejora. Proteína diversificada. Preservación activa.",
    goalEn: "Nutritional balance improves. Diversified protein. Active preservation.",
    detailsEs: [
      "Lentejas, garbanzos para proteína vegetal",
      "Congelación de carnes y verduras",
      "Encurtidos caseros (zanahoria, repollo)",
      "Frutas enlatadas o deshidratadas",
      "Granos variados: maíz palomero, trigo",
      "Levadura para pan casero"
    ],
    detailsEn: [
      "Lentils, chickpeas for plant protein",
      "Freezing meats and vegetables",
      "Homemade pickles (carrot, cabbage)",
      "Canned or dried fruits",
      "Varied grains: popcorn corn, wheat",
      "Yeast for homemade bread"
    ],
    staples: { es: "Arroz (50kg), Frijoles (25kg), Lentejas (5kg), Garbanzos (5kg), Harinas variadas (15kg), Aceite (8L), Huevos (180), Pollo (20kg), Res/Cerdo (10kg), Atún/Sardinas (24 latas), Leche polvo (5kg), Frutas deshidratadas (3kg), Verduras preservadas", en: "Rice (50kg), Beans (25kg), Lentils (5kg), Chickpeas (5kg), Various flours (15kg), Oil (8L), Eggs (180), Chicken (20kg), Beef/Pork (10kg), Tuna/Sardines (24 cans), Milk powder (5kg), Dried fruits (3kg), Preserved vegetables" }
  },
  {
    level: 5,
    color: "blue",
    emoji: "🟦",
    titleEs: "1 AÑO — Seguridad Total",
    titleEn: "1 YEAR — Total Security",
    goalEs: "Sistema de almacenamiento de largo plazo. Compra estratégica. Costos optimizados.",
    goalEn: "Long-term storage system. Strategic purchasing. Optimized costs.",
    detailsEs: [
      "Sistema FIFO consolidado",
      "Compra en temporada baja (mejores precios)",
      "Mermeladas y conservas caseras",
      "Granos sellados al vacío en porciones",
      "Hierbas medicinales (manzanilla, menta, jengibre)",
      "Suplementos básicos: multivitamínicos"
    ],
    detailsEn: [
      "Consolidated FIFO system",
      "Off-season buying (best prices)",
      "Homemade jams and preserves",
      "Vacuum-sealed grains in portions",
      "Medicinal herbs (chamomile, mint, ginger)",
      "Basic supplements: multivitamins"
    ],
    staples: { es: "Arroz (100kg), Frijoles (50kg), Lentejas (10kg), Garbanzos (10kg), Harinas (30kg), Aceite (15L), Huevos (360), Carnes variadas (50kg), Pescado enlatado (48 latas), Leche polvo (12kg), Frutas/verduras preservadas, Miel (3kg), Especias, Hierbas medicinales", en: "Rice (100kg), Beans (50kg), Lentils (10kg), Chickpeas (10kg), Flours (30kg), Oil (15L), Eggs (360), Various meats (50kg), Canned fish (48 cans), Milk powder (12kg), Preserved fruits/vegetables, Honey (3kg), Spices, Medicinal herbs" }
  },
  {
    level: 6,
    color: "purple",
    emoji: "🟪",
    titleEs: "3 AÑOS — Resiliencia Completa",
    titleEn: "3 YEARS — Complete Resilience",
    goalEs: "Almacenamiento profundo. Sistema de rotación. Plan a prueba de crisis.",
    goalEn: "Deep storage. Rotation system. Crisis-proof planning.",
    detailsEs: [
      "Almacenamiento en tambores sellados con absorbentes de oxígeno",
      "Huerta familiar establecida",
      "Granos y legumbres en cantidad para 3 años",
      "Sistema de purificación de agua",
      "Semillas para replantar",
      "Intercambio comunitario de alimentos",
      "Plan de contingencia documentado"
    ],
    detailsEn: [
      "Sealed drum storage with oxygen absorbers",
      "Established family garden",
      "Grains and legumes in quantity for 3 years",
      "Water purification system",
      "Seeds for replanting",
      "Community food exchange",
      "Documented contingency plan"
    ],
    staples: { es: "Arroz (300kg), Frijoles (150kg), Lentejas (30kg), Garbanzos (30kg), Harinas (100kg), Aceite (50L) sellado, Carnes enlatadas, Leche polvo (36kg), Miel (10kg), Sal (10kg), Azúcar (25kg), Semillas para huerta, Sistema de agua, Suplementos, Hierbas medicinales y condimentos en bulk", en: "Rice (300kg), Beans (150kg), Lentils (30kg), Chickpeas (30kg), Flours (100kg), Sealed oil (50L), Canned meats, Milk powder (36kg), Honey (10kg), Salt (10kg), Sugar (25kg), Garden seeds, Water system, Supplements, Bulk herbs and spices" }
  }
]

export const INCOME_PLANS = {
  survival: {
    es: {
      title: "Estrategia de Supervivencia",
      description: "Cada compra cuenta. El objetivo es agregar UNA cosa extra cada semana sin descuidar lo básico.",
      focus: "Compra semanal. Calorías al menor costo posible.",
      strategy: [
        "Semana 1: Arroz (5kg) + Frijoles (3kg) + Sal",
        "Semana 2: Aceite (1L) + Azúcar (1kg)",
        "Semana 3: Huevos (15) + Té de Hierbas (2 cajas)",
        "Semana 4: Harina de maíz (3kg) + Avena (1kg)",
        "Semana 5: Pasta (1kg) + Consomé de pollo",
        "Semana 6: Cebolla + Ajo + Tomates",
        "Semana 7: Atún en lata (4 unidades)",
        "Semana 8: Leche en polvo (1kg)"
      ],
      rule: "Regla de oro: Nunca dejes de comprar arroz y frijoles. Todo lo demás se añade encima de esa base."
    },
    en: {
      title: "Survival Strategy",
      description: "Every purchase counts. The goal is to add ONE extra thing each week without neglecting basics.",
      focus: "Weekly purchasing. Cheapest calories possible.",
      strategy: [
        "Week 1: Rice (5kg) + Beans (3kg) + Salt",
        "Week 2: Oil (1L) + Sugar (1kg)",
        "Week 3: Eggs (15) + Herbal Tea (2 boxes)",
        "Week 4: Corn flour (3kg) + Oats (1kg)",
        "Week 5: Pasta (1kg) + Chicken bouillon",
        "Week 6: Onion + Garlic + Tomatoes",
        "Week 7: Canned tuna (4 units)",
        "Week 8: Powdered milk (1kg)"
      ],
      rule: "Golden rule: Never stop buying rice and beans. Everything else is added on top of that base."
    }
  },
  "lower-middle": {
    es: {
      title: "Estrategia de Crecimiento",
      description: "Tienes un poco más de margen. El objetivo es construir reservas mensuales con variedad.",
      focus: "Compra mensual. Construcción de despensa con proteína variada.",
      strategy: [
        "Mes 1: Arroz (10kg) + Frijoles (5kg) + Aceite (2L) + Especias básicas",
        "Mes 2: Harina maíz (5kg) + Pasta (2kg) + Atún (6 latas) + Leche polvo (1kg)",
        "Mes 3: Pollo (5kg congelado) + Huevos (30) + Verduras (cebolla, ajo, zanahoria)",
        "Mes 4: Avena (3kg) + Azúcar (3kg) + Té de Hierbas (4 cajas) + Fruta temporada",
        "Mes 5: Lentejas (3kg) + Garbanzos (3kg) + Arroz extra (10kg)",
        "Mes 6: Repollo + Papas + Zanahorias (stock rotativo) + Carne res (3kg)",
        "Mes 7: Mantequilla/Margarina + Queso duro + Mermelada",
        "Mes 8: Revisión y reabastecimiento de lo consumido"
      ],
      rule: "Regla de oro: Cada mes, compra 1 proteína nueva y 1 vegetal nuevo además de tu lista base."
    },
    en: {
      title: "Growth Strategy",
      description: "You have a bit more margin. The goal is to build monthly reserves with variety.",
      focus: "Monthly purchasing. Pantry building with varied protein.",
      strategy: [
        "Month 1: Rice (10kg) + Beans (5kg) + Oil (2L) + Basic spices",
        "Month 2: Corn flour (5kg) + Pasta (2kg) + Tuna (6 cans) + Milk powder (1kg)",
        "Month 3: Chicken (5kg frozen) + Eggs (30) + Vegetables (onion, garlic, carrot)",
        "Month 4: Oats (3kg) + Sugar (3kg) + Herbal Tea (4 boxes) + Seasonal fruit",
        "Month 5: Lentils (3kg) + Chickpeas (3kg) + Extra rice (10kg)",
        "Month 6: Cabbage + Potatoes + Carrots (rotating stock) + Beef (3kg)",
        "Month 7: Butter/Margarine + Hard cheese + Jam",
        "Month 8: Review and restock what was consumed"
      ],
      rule: "Golden rule: Each month, buy 1 new protein and 1 new vegetable in addition to your base list."
    }
  },
  middle: {
    es: {
      title: "Estrategia de Eficiencia y Calidad",
      description: "Puedes construir reservas más rápido y enfocarte en calidad nutricional.",
      focus: "Eficiencia + calidad. Reservas grandes. Nutrición superior.",
      strategy: [
        "Mes 1-2: Despensa base completa (arroz 25kg, frijoles 12kg, harinas 10kg, aceite 5L)",
        "Mes 3-4: Congelador: pollo (10kg), res (10kg), pescado (5kg), verduras congeladas",
        "Mes 5-6: Enlatados: atún, sardinas, leche evaporada, vegetales enlatados",
        "Mes 7-8: Granos especiales: lentejas, garbanzos, quinua, avena integral",
        "Mes 9-10: Conservas: mermeladas, encurtidos, salsas, miel",
        "Mes 11-12: Equipo: selladora al vacío, contenedores herméticos, estantes"
      ],
      rule: "Regla de oro: Compra en bulk, divide en porciones, sella al vacío. La calidad de almacenamiento determina cuánto dura tu comida."
    },
    en: {
      title: "Efficiency & Quality Strategy",
      description: "You can build reserves faster and focus on nutritional quality.",
      focus: "Efficiency + quality. Large reserves. Superior nutrition.",
      strategy: [
        "Month 1-2: Complete base pantry (rice 25kg, beans 12kg, flours 10kg, oil 5L)",
        "Month 3-4: Freezer: chicken (10kg), beef (10kg), fish (5kg), frozen vegetables",
        "Month 5-6: Canned: tuna, sardines, evaporated milk, canned vegetables",
        "Month 7-8: Specialty grains: lentils, chickpeas, quinoa, whole oats",
        "Month 9-10: Preserves: jams, pickles, sauces, honey",
        "Month 11-12: Equipment: vacuum sealer, airtight containers, shelving"
      ],
      rule: "Golden rule: Buy in bulk, divide into portions, vacuum seal. Storage quality determines how long your food lasts."
    }
  }
}

export const WEEKLY_MEAL_PLANS = [
  {
    week: 1,
    label: { es: "Semana 1 — Clásicos Básicos", en: "Week 1 — Basic Classics" },
    days: [
      {
        day: { es: "Lunes", en: "Monday" },
        breakfast: { es: "Avena con leche y azúcar", en: "Oats with milk and sugar" },
        lunch: { es: "Arroz + Frijoles + Huevo frito + Plátano", en: "Rice + Beans + Fried egg + Plantain" },
        dinner: { es: "Sopa de verduras con fideos", en: "Vegetable soup with noodles" }
      },
      {
        day: { es: "Martes", en: "Tuesday" },
        breakfast: { es: "Tortillas con huevo revuelto", en: "Tortillas with scrambled eggs" },
        lunch: { es: "Pollo guisado + Arroz + Ensalada de repollo", en: "Stewed chicken + Rice + Cabbage salad" },
        dinner: { es: "Frijoles refritos + Queso + Tortilla", en: "Refried beans + Cheese + Tortilla" }
      },
      {
        day: { es: "Miércoles", en: "Wednesday" },
        breakfast: { es: "Pan tostado con mantequilla y té de hierbas", en: "Toast with butter and herbal tea" },
        lunch: { es: "Pasta con atún y verduras", en: "Pasta with tuna and vegetables" },
        dinner: { es: "Arroz con leche y canela", en: "Rice pudding with cinnamon" }
      },
      {
        day: { es: "Jueves", en: "Thursday" },
        breakfast: { es: "Huevos con cebolla y tomate", en: "Eggs with onion and tomato" },
        lunch: { es: "Sopa de frijoles con arroz y aguacate", en: "Bean soup with rice and avocado" },
        dinner: { es: "Baleadas (tortilla + frijol + huevo)", en: "Baleadas (tortilla + beans + egg)" }
      },
      {
        day: { es: "Viernes", en: "Friday" },
        breakfast: { es: "Avena con banano picado", en: "Oats with sliced banana" },
        lunch: { es: "Arroz con pollo y vegetales", en: "Chicken rice with vegetables" },
        dinner: { es: "Tacos de frijoles con repollo", en: "Bean tacos with cabbage" }
      },
      {
        day: { es: "Sábado", en: "Saturday" },
        breakfast: { es: "Panqueques de harina con miel", en: "Flour pancakes with honey" },
        lunch: { es: "Sopa de res con verduras y arroz", en: "Beef soup with vegetables and rice" },
        dinner: { es: "Arroz frito con huevo y verduras", en: "Fried rice with egg and vegetables" }
      },
      {
        day: { es: "Domingo", en: "Sunday" },
        breakfast: { es: "Huevos estrellados con frijoles", en: "Sunny eggs with beans" },
        lunch: { es: "Pollo asado + Arroz + Ensalada", en: "Roasted chicken + Rice + Salad" },
        dinner: { es: "Sándwich de pollo + Vegetales", en: "Chicken sandwich + Vegetables" }
      }
    ]
  },
  {
    week: 2,
    label: { es: "Semana 2 — Sopas y Guisos", en: "Week 2 — Soups & Stews" },
    days: [
      {
        day: { es: "Lunes", en: "Monday" },
        breakfast: { es: "Cereal caliente (avena/atol)", en: "Hot cereal (oatmeal/atol)" },
        lunch: { es: "Sopa de pollo con arroz y verduras", en: "Chicken soup with rice and vegetables" },
        dinner: { es: "Frijoles con arroz y huevo", en: "Beans with rice and egg" }
      },
      {
        day: { es: "Martes", en: "Tuesday" },
        breakfast: { es: "Tortilla con queso y frijoles", en: "Tortilla with cheese and beans" },
        lunch: { es: "Carne guisada + Papas + Zanahorias", en: "Stewed beef + Potatoes + Carrots" },
        dinner: { es: "Sopa de fideos con huevo", en: "Noodle soup with egg" }
      },
      {
        day: { es: "Miércoles", en: "Wednesday" },
        breakfast: { es: "Huevos con frijoles molidos", en: "Eggs with blended beans" },
        lunch: { es: "Pasta con pollo y crema", en: "Pasta with chicken and cream" },
        dinner: { es: "Ensalada de atún con galletas", en: "Tuna salad with crackers" }
      },
      {
        day: { es: "Jueves", en: "Thursday" },
        breakfast: { es: "Avena con leche y canela", en: "Oats with milk and cinnamon" },
        lunch: { es: "Sopa de res con yuca o papas", en: "Beef soup with cassava or potatoes" },
        dinner: { es: "Arroz con verduras salteadas", en: "Rice with sautéed vegetables" }
      },
      {
        day: { es: "Viernes", en: "Friday" },
        breakfast: { es: "Pan con mantequilla y chocolate caliente", en: "Bread with butter and hot chocolate" },
        lunch: { es: "Pescado frito + Arroz + Ensalada", en: "Fried fish + Rice + Salad" },
        dinner: { es: "Sopa de frijoles con crema", en: "Bean soup with cream" }
      },
      {
        day: { es: "Sábado", en: "Saturday" },
        breakfast: { es: "Huevos rancheros", en: "Ranch eggs" },
        lunch: { es: "Pollo en crema con champiñones + Arroz", en: "Creamy chicken with mushrooms + Rice" },
        dinner: { es: "Sopa de lentejas con arroz", en: "Lentil soup with rice" }
      },
      {
        day: { es: "Domingo", en: "Sunday" },
        breakfast: { es: "Panqueques con fruta", en: "Pancakes with fruit" },
        lunch: { es: "Asado de res + Papas + Verduras asadas", en: "Roast beef + Potatoes + Grilled vegetables" },
        dinner: { es: "Cena ligera: fruta y avena", en: "Light dinner: fruit and oats" }
      }
    ]
  },
  {
    week: 3,
    label: { es: "Semana 3 — Comidas Rápidas Caseras", en: "Week 3 — Homemade Fast Food" },
    days: [
      {
        day: { es: "Lunes", en: "Monday" },
        breakfast: { es: "Huevos picados con jamón", en: "Chopped eggs with ham" },
        lunch: { es: "Hamburguesa casera con papas", en: "Homemade burger with fries" },
        dinner: { es: "Arroz blanco + Frijoles + Aguacate", en: "White rice + Beans + Avocado" }
      },
      {
        day: { es: "Martes", en: "Tuesday" },
        breakfast: { es: "Atole de avena con leche", en: "Oatmeal drink with milk" },
        lunch: { es: "Pollo empanizado + Arroz + Ensalada", en: "Breaded chicken + Rice + Salad" },
        dinner: { es: "Sopa de verduras con huevo", en: "Vegetable soup with egg" }
      },
      {
        day: { es: "Miércoles", en: "Wednesday" },
        breakfast: { es: "Huevos con chorizo y tortillas", en: "Eggs with chorizo and tortillas" },
        lunch: { es: "Pizza casera (pan + salsa + queso + toppings)", en: "Homemade pizza (bread + sauce + cheese + toppings)" },
        dinner: { es: "Ensalada de pasta con atún", en: "Pasta salad with tuna" }
      },
      {
        day: { es: "Jueves", en: "Thursday" },
        breakfast: { es: "Pan con huevo y té de manzanilla", en: "Bread with egg and chamomile tea" },
        lunch: { es: "Sopa de albóndigas con arroz", en: "Meatball soup with rice" },
        dinner: { es: "Frijoles charros con totopos", en: "Charro beans with tortilla chips" }
      },
      {
        day: { es: "Viernes", en: "Friday" },
        breakfast: { es: "Avena con pasas y canela", en: "Oats with raisins and cinnamon" },
        lunch: { es: "Pescado empanizado + Papas + Ensalada", en: "Breaded fish + Potatoes + Salad" },
        dinner: { es: "Quesadillas de frijol y queso", en: "Bean and cheese quesadillas" }
      },
      {
        day: { es: "Sábado", en: "Saturday" },
        breakfast: { es: "Huevos divorciados (rojo + verde)", en: "Divorced eggs (red + green sauce)" },
        lunch: { es: "Pollo a la plancha + Arroz + Verduras", en: "Grilled chicken + Rice + Vegetables" },
        dinner: { es: "Sopa de ajo con huevo y pan", en: "Garlic soup with egg and bread" }
      },
      {
        day: { es: "Domingo", en: "Sunday" },
        breakfast: { es: "Desayuno completo: huevos, frijoles, tortillas, té de hierbas", en: "Full breakfast: eggs, beans, tortillas, herbal tea" },
        lunch: { es: "Lasaña casera con ensalada", en: "Homemade lasagna with salad" },
        dinner: { es: "Fruta de temporada + Yogurt", en: "Seasonal fruit + Yogurt" }
      }
    ]
  },
  {
    week: 4,
    label: { es: "Semana 4 — Internacional Económico", en: "Week 4 — Budget International" },
    days: [
      {
        day: { es: "Lunes", en: "Monday" },
        breakfast: { es: "Chilaquiles (tortilla + salsa + crema)", en: "Chilaquiles (tortilla + sauce + cream)" },
        lunch: { es: "Arroz frito estilo chino con huevo", en: "Chinese-style fried rice with egg" },
        dinner: { es: "Sopa de tomate con pan tostado", en: "Tomato soup with toast" }
      },
      {
        day: { es: "Martes", en: "Tuesday" },
        breakfast: { es: "Huevos tibios con pan", en: "Soft-boiled eggs with bread" },
        lunch: { es: "Curry de lentejas con arroz", en: "Lentil curry with rice" },
        dinner: { es: "Tostadas de pollo y frijol", en: "Chicken and bean tostadas" }
      },
      {
        day: { es: "Miércoles", en: "Wednesday" },
        breakfast: { es: "Cereal con leche y banano", en: "Cereal with milk and banana" },
        lunch: { es: "Pollo agridulce + Arroz + Verduras", en: "Sweet and sour chicken + Rice + Vegetables" },
        dinner: { es: "Frijoles con pasta", en: "Beans with pasta" }
      },
      {
        day: { es: "Jueves", en: "Thursday" },
        breakfast: { es: "Pan tostado con aguacate y huevo", en: "Toast with avocado and egg" },
        lunch: { es: "Pasta Alfredo con pollo", en: "Chicken Alfredo pasta" },
        dinner: { es: "Sopa de frijol negro con crema", en: "Black bean soup with cream" }
      },
      {
        day: { es: "Viernes", en: "Friday" },
        breakfast: { es: "Avena horneada con fruta", en: "Baked oatmeal with fruit" },
        lunch: { es: "Tacos de pollo o res con verduras", en: "Chicken or beef tacos with vegetables" },
        dinner: { es: "Arroz con atún y mayonesa", en: "Rice with tuna and mayonnaise" }
      },
      {
        day: { es: "Sábado", en: "Saturday" },
        breakfast: { es: "Huevos con papas fritas", en: "Eggs with home fries" },
        lunch: { es: "Pollo al horno con verduras asadas", en: "Roasted chicken with grilled vegetables" },
        dinner: { es: "Sándwich cubano (pollo, queso, mostaza)", en: "Cuban sandwich (chicken, cheese, mustard)" }
      },
      {
        day: { es: "Domingo", en: "Sunday" },
        breakfast: { es: "Brunch: huevos, pan, fruta, chocolate", en: "Brunch: eggs, bread, fruit, cocoa" },
        lunch: { es: "Comida especial: pollo o res + 3 acompañantes", en: "Special meal: chicken or beef + 3 sides" },
        dinner: { es: "Cena ligera + Té de hierbas", en: "Light dinner + Herbal tea" }
      }
    ]
  }
]

export const MONTHLY_ROTATION = [
  {
    label: { es: "Rotación Mensual", en: "Monthly Rotation" },
    weeks: [
      { es: "Semana 1: Clásicos básicos — arroz, frijoles, huevo, pollo", en: "Week 1: Basic classics — rice, beans, egg, chicken" },
      { es: "Semana 2: Sopas y guisos — caldos, carnes guisadas, lentejas", en: "Week 2: Soups and stews — broths, braised meats, lentils" },
      { es: "Semana 3: Comidas rápidas caseras — hamburguesas, tacos, pizzas", en: "Week 3: Homemade fast food — burgers, tacos, pizzas" },
      { es: "Semana 4: Internacional económico — arroz frito, curry, pasta", en: "Week 4: Budget international — fried rice, curry, pasta" }
    ]
  },
  {
    label: { es: "Patrón de Proteína Semanal", en: "Weekly Protein Pattern" },
    weeks: [
      { es: "Semana 1: Huevo + Pollo", en: "Week 1: Egg + Chicken" },
      { es: "Semana 2: Res + Pescado/Atún", en: "Week 2: Beef + Fish/Tuna" },
      { es: "Semana 3: Pollo + Huevo + Chorizo", en: "Week 3: Chicken + Egg + Sausage" },
      { es: "Semana 4: Lentejas/Garbanzos + Pollo/Res", en: "Week 4: Lentils/Chickpeas + Chicken/Beef" }
    ]
  }
]

export const RECIPES = [
  {
    id: "arroz-frijoles",
    nameEs: "Arroz con Frijoles y Huevo",
    nameEn: "Rice with Beans and Egg",
    meal: { es: "Desayuno / Almuerzo / Cena", en: "Breakfast / Lunch / Dinner" },
    tier: ["survival", "lower-middle", "middle"],
    cost: { HN: { min: 8, max: 15 }, US: { min: 1.50, max: 3.00 } },
    ingredients: [
      { es: "1 taza de arroz (200g)", en: "1 cup rice (200g)" },
      { es: "½ taza de frijoles cocidos (150g)", en: "½ cup cooked beans (150g)" },
      { es: "2 huevos", en: "2 eggs" },
      { es: "1 cucharada de aceite", en: "1 tablespoon oil" },
      { es: "Sal al gusto", en: "Salt to taste" },
      { es: "Opcional: tortilla de maíz, aguacate", en: "Optional: corn tortilla, avocado" }
    ],
    steps: [
      { es: "Cocina el arroz en 2 tazas de agua con sal hasta que se seque (15-20 min)", en: "Cook rice in 2 cups salted water until dry (15-20 min)" },
      { es: "Calienta los frijoles en una olla pequeña, añade un poco de agua si están muy espesos", en: "Heat beans in a small pot, add water if too thick" },
      { es: "En un sartén, calienta el aceite y fríe los huevos (estrellados o revueltos)", en: "In a pan, heat oil and fry eggs (sunny or scrambled)" },
      { es: "Sirve el arroz, añade los frijoles al lado y coloca los huevos encima", en: "Serve rice, add beans on the side and top with eggs" },
      { es: "Acompaña con tortilla caliente y rodajas de aguacate si tienes", en: "Serve with warm tortilla and avocado slices if available" }
    ],
    storage: { es: "Todos los ingredientes son de despensa básica. El arroz cocido sobrante se refrigera 3-4 días.", en: "All ingredients are basic pantry. Leftover cooked rice keeps 3-4 days refrigerated." }
  },
  {
    id: "pollo-guisado",
    nameEs: "Pollo Guisado con Arroz",
    nameEn: "Stewed Chicken with Rice",
    meal: { es: "Almuerzo / Cena", en: "Lunch / Dinner" },
    tier: ["lower-middle", "middle"],
    cost: { HN: { min: 35, max: 55 }, US: { min: 4.00, max: 7.00 } },
    ingredients: [
      { es: "2 muslos/piernas de pollo (300-400g)", en: "2 chicken thighs/legs (300-400g)" },
      { es: "1 taza de arroz (200g)", en: "1 cup rice (200g)" },
      { es: "½ cebolla picada", en: "½ onion, chopped" },
      { es: "2 dientes de ajo picados", en: "2 garlic cloves, chopped" },
      { es: "1 tomate picado", en: "1 tomato, chopped" },
      { es: "2 cucharadas de aceite", en: "2 tablespoons oil" },
      { es: "1 cubito de consomé de pollo", en: "1 chicken bouillon cube" },
      { es: "½ taza de verduras (zanahoria, papa) en cubos", en: "½ cup cubed vegetables (carrot, potato)" },
      { es: "Sal, pimienta, comino al gusto", en: "Salt, pepper, cumin to taste" },
      { es: "2 tazas de agua", en: "2 cups water" }
    ],
    steps: [
      { es: "Sazona el pollo con sal, pimienta y comino", en: "Season chicken with salt, pepper, and cumin" },
      { es: "Calienta aceite en una olla y dora el pollo por todos lados (5 min)", en: "Heat oil in a pot and brown chicken on all sides (5 min)" },
      { es: "Retira el pollo, en el mismo aceite sofríe cebolla y ajo hasta transparente", en: "Remove chicken, in same oil sauté onion and garlic until translucent" },
      { es: "Agrega el tomate y cocina 2 minutos", en: "Add tomato and cook 2 minutes" },
      { es: "Vuelve a poner el pollo, añade agua, consomé y verduras", en: "Return chicken, add water, bouillon, and vegetables" },
      { es: "Tapa y cocina a fuego medio 20 minutos", en: "Cover and cook on medium heat 20 minutes" },
      { es: "Agrega el arroz lavado y cocina 15-20 minutos más hasta que el arroz esté suave", en: "Add washed rice and cook 15-20 more minutes until rice is tender" },
      { es: "Rectifica sal y sirve caliente", en: "Adjust salt and serve hot" }
    ],
    storage: { es: "Se refrigera hasta 4 días. También se congela hasta 2 meses.", en: "Refrigerates up to 4 days. Also freezes up to 2 months." }
  },
  {
    id: "sopa-frijoles",
    nameEs: "Sopa de Frijoles",
    nameEn: "Bean Soup",
    meal: { es: "Almuerzo / Cena", en: "Lunch / Dinner" },
    tier: ["survival", "lower-middle", "middle"],
    cost: { HN: { min: 10, max: 20 }, US: { min: 1.50, max: 3.00 } },
    ingredients: [
      { es: "1 taza de frijoles cocidos (250g)", en: "1 cup cooked beans (250g)" },
      { es: "1 litro de agua o caldo de pollo", en: "1 liter water or chicken broth" },
      { es: "½ cebolla picada", en: "½ onion, chopped" },
      { es: "2 dientes de ajo", en: "2 garlic cloves" },
      { es: "1 tomate picado", en: "1 tomato, chopped" },
      { es: "½ taza de arroz o fideos", en: "½ cup rice or noodles" },
      { es: "Sal, comino, chile dulce al gusto", en: "Salt, cumin, bell pepper to taste" },
      { es: "Crema o queso para servir (opcional)", en: "Cream or cheese for serving (optional)" }
    ],
    steps: [
      { es: "Licúa la mitad de los frijoles con 1 taza de agua hasta obtener puré", en: "Blend half the beans with 1 cup water until pureed" },
      { es: "En una olla, sofríe cebolla y ajo en un poco de aceite", en: "In a pot, sauté onion and garlic in a little oil" },
      { es: "Agrega tomate y cocina 2 minutos", en: "Add tomato and cook 2 minutes" },
      { es: "Vierte el puré de frijoles y el resto del agua/caldo", en: "Pour in bean puree and remaining water/broth" },
      { es: "Agrega los frijoles enteros restantes y el arroz o fideos", en: "Add remaining whole beans and rice or noodles" },
      { es: "Sazona con sal, comino al gusto. Cocina 15 minutos hasta que el arroz esté listo", en: "Season with salt, cumin. Cook 15 minutes until rice is done" },
      { es: "Sirve caliente con crema, queso y aguacate si tienes", en: "Serve hot with cream, cheese, and avocado if available" }
    ],
    storage: { es: "Se conserva refrigerado 5 días. También se congela bien.", en: "Keeps refrigerated 5 days. Also freezes well." }
  },
  {
    id: "avena-fruta",
    nameEs: "Avena con Fruta",
    nameEn: "Oats with Fruit",
    meal: { es: "Desayuno", en: "Breakfast" },
    tier: ["survival", "lower-middle", "middle"],
    cost: { HN: { min: 5, max: 12 }, US: { min: 0.75, max: 2.00 } },
    ingredients: [
      { es: "½ taza de avena (50g)", en: "½ cup oats (50g)" },
      { es: "1 taza de agua o leche", en: "1 cup water or milk" },
      { es: "1 cucharada de azúcar o miel", en: "1 tablespoon sugar or honey" },
      { es: "1 banano o fruta de temporada picada", en: "1 banana or seasonal fruit, chopped" },
      { es: "Canela al gusto (opcional)", en: "Cinnamon to taste (optional)" }
    ],
    steps: [
      { es: "Hierve el agua o leche en una olla pequeña", en: "Boil water or milk in a small pot" },
      { es: "Agrega la avena y reduce el fuego a medio-bajo", en: "Add oats and reduce heat to medium-low" },
      { es: "Cocina 5 minutos, revolviendo ocasionalmente", en: "Cook 5 minutes, stirring occasionally" },
      { es: "Endulza con azúcar o miel. Añade canela si gustas", en: "Sweeten with sugar or honey. Add cinnamon if desired" },
      { es: "Sirve en un plato hondo, cubre con fruta picada encima", en: "Serve in a bowl, top with chopped fruit" }
    ],
    storage: { es: "Preparación rápida, mejor hacerla fresca. La avena seca dura meses en despensa.", en: "Quick prep, best made fresh. Dry oats last months in pantry." }
  },
  {
    id: "tacos-pollo",
    nameEs: "Tacos de Pollo",
    nameEn: "Chicken Tacos",
    meal: { es: "Almuerzo / Cena", en: "Lunch / Dinner" },
    tier: ["lower-middle", "middle"],
    cost: { HN: { min: 30, max: 50 }, US: { min: 4.00, max: 7.00 } },
    ingredients: [
      { es: "2 tortillas de maíz o harina por persona", en: "2 corn or flour tortillas per person" },
      { es: "200g de pollo desmenuzado", en: "200g shredded chicken" },
      { es: "½ cebolla en rodajas finas", en: "½ onion in thin slices" },
      { es: "1 tomate picado", en: "1 tomato, chopped" },
      { es: "½ taza de repollo picado", en: "½ cup shredded cabbage" },
      { es: "Limón y sal al gusto", en: "Lemon and salt to taste" },
      { es: "Salsa picante o mayonesa (opcional)", en: "Hot sauce or mayonnaise (optional)" }
    ],
    steps: [
      { es: "Calienta las tortillas en un comal o sartén", en: "Heat tortillas on a griddle or pan" },
      { es: "Desmenuza el pollo cocido (puede ser sobrante de pollo guisado)", en: "Shred cooked chicken (can be leftover from stewed chicken)" },
      { es: "Coloca el pollo en el centro de cada tortilla", en: "Place chicken in the center of each tortilla" },
      { es: "Agrega cebolla, tomate, repollo encima", en: "Add onion, tomato, cabbage on top" },
      { es: "Exprime limón, agrega sal y salsa al gusto", en: "Squeeze lemon, add salt and sauce to taste" },
      { es: "Dobla y sirve inmediatamente", en: "Fold and serve immediately" }
    ],
    storage: { es: "Mejor comer fresco. Los ingredientes preparados se guardan por separado en el refri.", en: "Best eaten fresh. Prepared ingredients stored separately in fridge." }
  },
  {
    id: "lentejas-curry",
    nameEs: "Curry de Lentejas",
    nameEn: "Lentil Curry",
    meal: { es: "Almuerzo / Cena", en: "Lunch / Dinner" },
    tier: ["survival", "lower-middle", "middle"],
    cost: { HN: { min: 15, max: 25 }, US: { min: 2.00, max: 4.00 } },
    ingredients: [
      { es: "1 taza de lentejas (200g)", en: "1 cup lentils (200g)" },
      { es: "2 tazas de agua", en: "2 cups water" },
      { es: "½ cebolla picada", en: "½ onion, chopped" },
      { es: "2 dientes de ajo picados", en: "2 garlic cloves, chopped" },
      { es: "1 tomate picado", en: "1 tomato, chopped" },
      { es: "1 cucharadita de curry en polvo o comino", en: "1 teaspoon curry powder or cumin" },
      { es: "2 cucharadas de aceite", en: "2 tablespoons oil" },
      { es: "Sal al gusto", en: "Salt to taste" },
      { es: "Arroz blanco para acompañar", en: "White rice to accompany" }
    ],
    steps: [
      { es: "Lava las lentejas y remójalas 30 minutos (opcional, acelera cocción)", en: "Wash lentils and soak 30 minutes (optional, speeds cooking)" },
      { es: "En una olla, calienta aceite y sofríe cebolla y ajo hasta dorar", en: "In a pot, heat oil and sauté onion and garlic until golden" },
      { es: "Agrega tomate y cocina 2 minutos", en: "Add tomato and cook 2 minutes" },
      { es: "Añade el curry o comino y revuelve 30 segundos", en: "Add curry or cumin and stir 30 seconds" },
      { es: "Vierte las lentejas y el agua. Lleva a hervor", en: "Pour in lentils and water. Bring to a boil" },
      { es: "Reduce fuego, tapa y cocina 20-25 minutos hasta que las lentejas estén suaves", en: "Reduce heat, cover and cook 20-25 minutes until lentils are soft" },
      { es: "Rectifica sal. Sirve caliente sobre arroz blanco", en: "Adjust salt. Serve hot over white rice" }
    ],
    storage: { es: "Se refrigera hasta 5 días. Mejora el sabor al día siguiente.", en: "Refrigerates up to 5 days. Flavor improves next day." }
  },
  {
    id: "huevos-revueltos",
    nameEs: "Huevos Revueltos con Verduras",
    nameEn: "Scrambled Eggs with Vegetables",
    meal: { es: "Desayuno / Cena", en: "Breakfast / Dinner" },
    tier: ["survival", "lower-middle", "middle"],
    cost: { HN: { min: 10, max: 18 }, US: { min: 1.50, max: 3.00 } },
    ingredients: [
      { es: "3 huevos", en: "3 eggs" },
      { es: "¼ de cebolla picada", en: "¼ onion, chopped" },
      { es: "¼ de tomate picado", en: "¼ tomato, chopped" },
      { es: "1 cucharada de aceite", en: "1 tablespoon oil" },
      { es: "Sal y pimienta al gusto", en: "Salt and pepper to taste" },
      { es: "Opcional: ¼ taza de frijoles refritos, tortillas", en: "Optional: ¼ cup refried beans, tortillas" }
    ],
    steps: [
      { es: "Bate los huevos en un tazón con sal y pimienta", en: "Beat eggs in a bowl with salt and pepper" },
      { es: "Calienta el aceite en un sartén a fuego medio", en: "Heat oil in a pan over medium heat" },
      { es: "Sofríe la cebolla hasta transparente (2 min)", en: "Sauté onion until translucent (2 min)" },
      { es: "Agrega el tomate y cocina 1 minuto más", en: "Add tomato and cook 1 more minute" },
      { es: "Vierte los huevos batidos y revuelve constantemente con espátula", en: "Pour in beaten eggs and stir constantly with a spatula" },
      { es: "Cocina hasta que los huevos estén firmes pero aún suaves (2-3 min)", en: "Cook until eggs are set but still soft (2-3 min)" },
      { es: "Sirve con frijoles y tortillas calientes", en: "Serve with beans and warm tortillas" }
    ],
    storage: { es: "Mejor comer fresco. Los huevos crudos duran semanas en refri.", en: "Best eaten fresh. Raw eggs last weeks in fridge." }
  },
  {
    id: "baleadas",
    nameEs: "Baleadas",
    nameEn: "Baleadas (Honduran Tortillas)",
    meal: { es: "Desayuno / Almuerzo / Cena", en: "Breakfast / Lunch / Dinner" },
    tier: ["survival", "lower-middle", "middle"],
    cost: { HN: { min: 5, max: 15 }, US: { min: 1.00, max: 2.50 } },
    ingredients: [
      { es: "2 tortillas de harina", en: "2 flour tortillas" },
      { es: "½ taza de frijoles refritos", en: "½ cup refried beans" },
      { es: "2 cucharadas de crema o mantequilla", en: "2 tablespoons cream or butter" },
      { es: "Queso rallado (opcional)", en: "Grated cheese (optional)" },
      { es: "Huevo picado (opcional)", en: "Chopped egg (optional)" }
    ],
    steps: [
      { es: "Calienta las tortillas en un comal o sartén", en: "Heat tortillas on a griddle or pan" },
      { es: "Unta frijoles refritos calientes sobre la tortilla", en: "Spread hot refried beans on the tortilla" },
      { es: "Agrega crema encima de los frijoles", en: "Add cream on top of the beans" },
      { es: "Añade queso rallado y/o huevo picado si tienes", en: "Add grated cheese and/or chopped egg if available" },
      { es: "Dobla la tortilla por la mitad y sirve", en: "Fold tortilla in half and serve" }
    ],
    storage: { es: "Mejor fresca. Los ingredientes por separado duran días en refri.", en: "Best fresh. Separate ingredients last days in fridge." }
  },
  {
    id: "arroz-leche",
    nameEs: "Arroz con Leche",
    nameEn: "Rice Pudding",
    meal: { es: "Postre / Cena / Desayuno", en: "Dessert / Dinner / Breakfast" },
    tier: ["survival", "lower-middle", "middle"],
    cost: { HN: { min: 10, max: 18 }, US: { min: 1.50, max: 3.00 } },
    ingredients: [
      { es: "1 taza de arroz (200g)", en: "1 cup rice (200g)" },
      { es: "2 tazas de leche (o 4 cdas leche polvo + agua)", en: "2 cups milk (or 4 tbsp milk powder + water)" },
      { es: "2 tazas de agua", en: "2 cups water" },
      { es: "½ taza de azúcar (100g)", en: "½ cup sugar (100g)" },
      { es: "1 rama de canela o 1 cdita canela molida", en: "1 cinnamon stick or 1 tsp ground cinnamon" },
      { es: "Pasitas (opcional)", en: "Raisins (optional)" }
    ],
    steps: [
      { es: "Lava el arroz y ponlo en una olla con agua y canela", en: "Wash rice and put in a pot with water and cinnamon" },
      { es: "Cocina a fuego medio hasta que el arroz absorba casi toda el agua (15 min)", en: "Cook on medium until rice has absorbed almost all water (15 min)" },
      { es: "Agrega la leche y el azúcar, revuelve bien", en: "Add milk and sugar, stir well" },
      { es: "Cocina a fuego bajo 15-20 minutos, revolviendo ocasionalmente para que no se pegue", en: "Cook on low 15-20 minutes, stirring occasionally to prevent sticking" },
      { es: "Cuando esté cremoso, retira del fuego", en: "When creamy, remove from heat" },
      { es: "Sirve caliente o frío, espolvorea canela encima", en: "Serve hot or cold, sprinkle cinnamon on top" }
    ],
    storage: { es: "Se refrigera hasta 5 días. Se come frío o se recalienta.", en: "Refrigerates up to 5 days. Eaten cold or reheated." }
  }
]

export const STORAGE_GUIDE = [
  {
    category: { es: "Granos (arroz, frijoles, lentejas)", en: "Grains (rice, beans, lentils)" },
    method: { es: "Recipientes herméticos de plástico o vidrio. Contenedores con tapa sellada. Tambores con empaques de goma para largo plazo.", en: "Airtight plastic or glass containers. Containers with sealed lids. Drums with rubber gaskets for long-term." },
    pestPrevention: { es: "Congela los granos 48 horas antes de almacenar para matar huevos de insectos. Hojas de laurel o ajo entero dentro del contenedor repelen gorgojos.", en: "Freeze grains 48 hours before storing to kill insect eggs. Bay leaves or whole garlic inside containers repel weevils." },
    shelfLife: { es: "Arroz blanco: 1-2 años. Arroz integral: 6 meses (se pone rancio). Frijoles secos: 1-3 años. Lentejas: 2-3 años.", en: "White rice: 1-2 years. Brown rice: 6 months (goes rancid). Dry beans: 1-3 years. Lentils: 2-3 years." }
  },
  {
    category: { es: "Aceites y grasas", en: "Oils and fats" },
    method: { es: "Botellas de vidrio oscuro o plástico opaco. Lugar fresco y oscuro. No cerca de la estufa.", en: "Dark glass bottles or opaque plastic. Cool, dark place. Not near the stove." },
    pestPrevention: { es: "Los aceites no atraen insectos si están sellados. Revisa que la tapa cierre bien.", en: "Oils don't attract insects if sealed. Check that lids close tightly." },
    shelfLife: { es: "Aceite vegetal: 1 año. Aceite de oliva: 1-2 años. Manteca: 1 año congelada.", en: "Vegetable oil: 1 year. Olive oil: 1-2 years. Lard: 1 year frozen." }
  },
  {
    category: { es: "Enlatados", en: "Canned goods" },
    method: { es: "Lugar fresco y seco. No apilar demasiado pesado. Revisar fechas periódicamente.", en: "Cool, dry place. Don't stack too heavy. Check dates periodically." },
    pestPrevention: { es: "Las latas son a prueba de plagas mientras no estén abolladas o oxidadas. Limpia el polvo regularmente.", en: "Cans are pest-proof unless dented or rusty. Dust regularly." },
    shelfLife: { es: "Atún y sardinas: 2-5 años. Verduras enlatadas: 2-5 años. Leche evaporada: 1 año.", en: "Tuna and sardines: 2-5 years. Canned vegetables: 2-5 years. Evaporated milk: 1 year." }
  },
  {
    category: { es: "Especias y condimentos", en: "Spices and seasonings" },
    method: { es: "Frascos pequeños de vidrio con tapa hermética. Lejos de la luz directa y calor.", en: "Small glass jars with airtight lids. Away from direct light and heat." },
    pestPrevention: { es: "Revisa que no haya humedad. No guardes especias sobre la estufa.", en: "Check for moisture. Don't store spices above the stove." },
    shelfLife: { es: "Sal: indefinida. Azúcar: indefinida. Especias molidas: 1-2 años. Especias enteras: 3-4 años.", en: "Salt: indefinite. Sugar: indefinite. Ground spices: 1-2 years. Whole spices: 3-4 years." }
  },
  {
    category: { es: "Congelados", en: "Frozen foods" },
    method: { es: "Bolsas para congelador con todo el aire extraído. Etiqueta con fecha y contenido. No abrir hasta usar.", en: "Freezer bags with all air removed. Label with date and contents. Don't open until use." },
    pestPrevention: { es: "El congelador previene toda plaga. Mantén la temperatura a -18°C o menos.", en: "Freezer prevents all pests. Keep temperature at 0°F (-18°C) or below." },
    shelfLife: { es: "Pollo: 6-9 meses. Res: 6-12 meses. Verduras: 8-12 meses. Pan: 3 meses.", en: "Chicken: 6-9 months. Beef: 6-12 months. Vegetables: 8-12 months. Bread: 3 months." }
  },
  {
    category: { es: "Verduras frescas de larga duración", en: "Long-lasting fresh vegetables" },
    method: { es: "Papas y cebollas en lugar fresco, oscuro y separados (las papas hacen madurar la cebolla). Zanahorias en refri en bolsa perforada. Repollo en refri envuelto en plástico.", en: "Potatoes and onions in cool, dark place, separate (potatoes ripen onions). Carrots in fridge in perforated bag. Cabbage in fridge wrapped in plastic." },
    pestPrevention: { es: "Revisa semanalmente y retira cualquier pieza que empiece a pudrirse para que no contamine las demás.", en: "Check weekly and remove any piece starting to rot so it doesn't contaminate others." },
    shelfLife: { es: "Papas: 2-3 meses. Cebollas: 1-2 meses. Repollo: 2-3 semanas. Zanahorias: 3-4 semanas. Ajos: 2-3 meses.", en: "Potatoes: 2-3 months. Onions: 1-2 months. Cabbage: 2-3 weeks. Carrots: 3-4 weeks. Garlic: 2-3 months." }
  }
]

export const ANTI_OVERWHELM = [
  {
    title: { es: "Cocina una vez, come varias veces", en: "Cook once, eat multiple times" },
    tip: { es: "Cuando cocines arroz, haz el doble. El arroz sobrante sirve para: arroz frito al día siguiente, sopa de arroz, o arroz con leche. Ahorras tiempo, gas y esfuerzo.", en: "When cooking rice, make double. Leftover rice works for: fried rice next day, rice soup, or rice pudding. You save time, gas, and effort." },
    example: { es: "Ejemplo: Domingo cocinas 4 tazas de arroz. Comes 1 taza con pollo. Lunes: arroz frito con huevo. Martes: sopa de arroz. Miércoles: arroz con leche.", en: "Example: Sunday cook 4 cups rice. Eat 1 cup with chicken. Monday: fried rice with egg. Tuesday: rice soup. Wednesday: rice pudding." }
  },
  {
    title: { es: "Batch cooking (cocción por lotes)", en: "Batch cooking" },
    tip: { es: "Dedica 2 horas cada domingo a preparar: frijoles (una olla grande), arroz (suficiente para 3 días), pollo cocido desmenuzado. Durante la semana solo calientas y combinas.", en: "Dedicate 2 hours every Sunday to prepare: beans (a large pot), rice (enough for 3 days), shredded cooked chicken. During the week you just heat and combine." },
    example: { es: "Batch dominical: frijoles (2lb) + arroz (4 tazas) + pollo (4 muslos). Con eso tienes base para: tacos, sopas, guisos, baleadas toda la semana.", en: "Sunday batch: beans (2lb) + rice (4 cups) + chicken (4 thighs). This gives you base for: tacos, soups, stews, baleadas all week." }
  },
  {
    title: { es: "Rotación de alimentos", en: "Food rotation" },
    tip: { es: "Usa el método FIFO (First In, First Out). Cuando compres nuevo arroz, ponlo detrás del viejo. Siempre usa primero lo que compraste primero. Así nada se vence.", en: "Use FIFO method (First In, First Out). When buying new rice, place it behind the old. Always use what you bought first. Nothing expires." },
    example: { es: "Pon los productos nuevos atrás o abajo, los viejos adelante o arriba. Un marcador permanente para escribir la fecha de compra en cada contenedor ayuda mucho.", en: "Place new products in back or bottom, old ones in front or top. A permanent marker to write the purchase date on each container helps a lot." }
  }
]

export const BEHAVIORAL_GUIDANCE = [
  { es: "Empieza pequeño. No necesitas comprar todo el mes 1 hoy. Compra 1 cosa extra cada semana.", en: "Start small. You don't need to buy everything for month 1 today. Buy 1 extra thing each week." },
  { es: "Consistencia sobre perfección. Comer arroz y frijoles 6 días a la semana es mejor que tener un plan perfecto 3 días y rendirte.", en: "Consistency over perfection. Eating rice and beans 6 days a week is better than having a perfect plan for 3 days and giving up." },
  { es: "Una mejora por semana. Elige UNA cosa pequeña para mejorar esta semana: agregar una verdura, aprender una receta nueva, o mejorar tu almacenamiento.", en: "One improvement per week. Choose ONE small thing to improve this week: add a vegetable, learn a new recipe, or improve storage." },
  { es: "No te compares. Tu camino es único. Tal vez hoy solo puedes comprar arroz. La próxima semana tal vez ya puedes comprar frijoles también. Eso es progreso.", en: "Don't compare. Your journey is unique. Maybe today you can only buy rice. Next week maybe you can buy beans too. That's progress." },
  { es: "Celebra las pequeñas victorias. Completaste tu primera semana sin hambre? Celebra. Compraste tu primer kilo de arroz extra? Celebra.", en: "Celebrate small wins. Completed your first week without hunger? Celebrate. Bought your first extra kilo of rice? Celebrate." },
  { es: "El plan es una guía, no una camisa de fuerza. Si una semana no puedes comprar lo planeado, no pasa nada. Haz lo que puedas y sigue adelante.", en: "The plan is a guide, not a straitjacket. If one week you can't buy what was planned, it's okay. Do what you can and move forward." }
]
