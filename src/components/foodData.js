
export const FOOD_CATEGORIES = {
  staples: { en: "Core Staples", es: "Alimentos Básicos", icon: "🌾" },
  proteins: { en: "Proteins", es: "Proteínas", icon: "🍗" },
  fats: { en: "Fats & Oils", es: "Grasas y Aceites", icon: "🛢️" },
  vegetables: { en: "Vegetables", es: "Vegetales", icon: "🥦" },
  fruits: { en: "Fruits", es: "Frutas", icon: "🍎" },
  dairy: { en: "Dairy", es: "Lácteos", icon: "🥛" },
  seasonings: { en: "Seasonings & Spices", es: "Condimentos y Especias", icon: "🧂" },
  others: { en: "Other Essentials", es: "Otros Esenciales", icon: "🧺" }
};

export const FOOD_ITEMS = [
  // STAPLES
  {
    id: "rice",
    category: "staples",
    nameEn: "Rice",
    nameEs: "Arroz",
    unit: "kg",
    baseQty: 5,
    caloriesPerUnit: 1300, // per kg cooked is less, but raw is ~3600. Let's use raw weight.
    storage: "Dry",
    shelfLifeEn: "6-12 months",
    shelfLifeEs: "6-12 meses",
    tipEn: "Store in airtight containers to prevent pests.",
    tipEs: "Almacenar en recipientes herméticos para evitar plagas.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "beans",
    category: "staples",
    nameEn: "Beans",
    nameEs: "Frijoles",
    unit: "kg",
    baseQty: 2.5,
    caloriesPerUnit: 3400,
    storage: "Dry",
    shelfLifeEn: "6-12 months",
    shelfLifeEs: "6-12 meses",
    tipEn: "Soak overnight to reduce cooking time and gas usage.",
    tipEs: "Remojar durante la noche para reducir el tiempo de cocción y el uso de gas.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "corn_flour",
    category: "staples",
    nameEn: "Corn Flour (Maseca)",
    nameEs: "Harina de Maíz",
    unit: "kg",
    baseQty: 4,
    caloriesPerUnit: 3600,
    storage: "Dry",
    shelfLifeEn: "6-9 months",
    shelfLifeEs: "6-9 meses",
    tipEn: "Essential for tortillas and tamales in HN.",
    tipEs: "Esencial para tortillas y tamales en Honduras.",
    relevance: ["HN"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "bread",
    category: "staples",
    nameEn: "Bread / Toast",
    nameEs: "Pan / Tostadas",
    unit: "loaves",
    baseQty: 4,
    caloriesPerUnit: 1200,
    storage: "Dry/Cold",
    shelfLifeEn: "1-2 weeks",
    shelfLifeEs: "1-2 semanas",
    tipEn: "Can be frozen to extend life up to 3 months.",
    tipEs: "Se puede congelar para extender su vida hasta 3 meses.",
    relevance: ["US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "pasta",
    category: "staples",
    nameEn: "Pasta",
    nameEs: "Pasta",
    unit: "kg",
    baseQty: 1.5,
    caloriesPerUnit: 3500,
    storage: "Dry",
    shelfLifeEn: "1-2 years",
    shelfLifeEs: "1-2 años",
    tipEn: "Cook 'al dente' to keep a lower glycemic index.",
    tipEs: "Cocinar 'al dente' para mantener un índice glucémico más bajo.",
    relevance: ["HN", "US"],
    tierRelevance: ["lower-middle", "middle"]
  },
  {
    id: "oats",
    category: "staples",
    nameEn: "Oats",
    nameEs: "Avena",
    unit: "kg",
    baseQty: 1,
    caloriesPerUnit: 3800,
    storage: "Dry",
    shelfLifeEn: "6-12 months",
    shelfLifeEs: "6-12 meses",
    tipEn: "Great for filling breakfasts and fiber.",
    tipEs: "Excelente para desayunos saciantes y fibra.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },

  // PROTEINS
  {
    id: "eggs",
    category: "proteins",
    nameEn: "Eggs",
    nameEs: "Huevos",
    unit: "units",
    baseQty: 45,
    caloriesPerUnit: 70,
    storage: "Cold",
    shelfLifeEn: "3-5 weeks",
    shelfLifeEs: "3-5 semanas",
    tipEn: "Check freshness by placing in water; if it sinks, it's fresh.",
    tipEs: "Verifica la frescura poniéndolos en agua; si se hunden, están frescos.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "chicken",
    category: "proteins",
    nameEn: "Chicken",
    nameEs: "Pollo",
    unit: "kg",
    baseQty: 3,
    caloriesPerUnit: 2300,
    storage: "Frozen",
    shelfLifeEn: "6-9 months (frozen)",
    shelfLifeEs: "6-9 meses (congelado)",
    tipEn: "Buy whole chickens to use bones for nutrient-rich broth.",
    tipEs: "Compra pollos enteros para usar los huesos en caldos nutritivos.",
    relevance: ["HN", "US"],
    tierRelevance: ["lower-middle", "middle"]
  },
  {
    id: "canned_tuna",
    category: "proteins",
    nameEn: "Canned Tuna/Sardines",
    nameEs: "Atún/Sardinas en lata",
    unit: "cans",
    baseQty: 4,
    caloriesPerUnit: 150,
    storage: "Dry",
    shelfLifeEn: "2-5 years",
    shelfLifeEs: "2-5 años",
    tipEn: "High protein and healthy fats, no cooking required.",
    tipEs: "Alta proteína y grasas saludables, no requiere cocción.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },

  // FATS
  {
    id: "oil",
    category: "fats",
    nameEn: "Cooking Oil",
    nameEs: "Aceite de Cocina",
    unit: "liters",
    baseQty: 0.75,
    caloriesPerUnit: 8000,
    storage: "Dry",
    shelfLifeEn: "1 year",
    shelfLifeEs: "1 año",
    tipEn: "Keep away from heat and light to prevent rancidity.",
    tipEs: "Mantener alejado del calor y la luz para evitar la rancidez.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "butter",
    category: "fats",
    nameEn: "Butter / Margarine",
    nameEs: "Mantequilla / Margarina",
    unit: "kg",
    baseQty: 0.5,
    caloriesPerUnit: 7000,
    storage: "Cold",
    shelfLifeEn: "1-3 months",
    shelfLifeEs: "1-3 meses",
    tipEn: "Adds essential fats and flavor to simple meals.",
    tipEs: "Añade grasas esenciales y sabor a comidas sencillas.",
    relevance: ["US"],
    tierRelevance: ["lower-middle", "middle"]
  },

  // VEGETABLES
  {
    id: "onions",
    category: "vegetables",
    nameEn: "Onions",
    nameEs: "Cebollas",
    unit: "kg",
    baseQty: 2,
    caloriesPerUnit: 400,
    storage: "Dry/Dark",
    shelfLifeEn: "1-2 months",
    shelfLifeEs: "1-2 meses",
    tipEn: "Store in a cool, dark place away from potatoes.",
    tipEs: "Almacenar en un lugar fresco y oscuro, lejos de las papas.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "tomatoes",
    category: "vegetables",
    nameEn: "Tomatoes",
    nameEs: "Tomates",
    unit: "kg",
    baseQty: 3,
    caloriesPerUnit: 180,
    storage: "Dry/Cold",
    shelfLifeEn: "1 week",
    shelfLifeEs: "1 semana",
    tipEn: "Do not refrigerate until fully ripe for best flavor.",
    tipEs: "No refrigerar hasta que estén maduros para mejor sabor.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "cabbage",
    category: "vegetables",
    nameEn: "Cabbage",
    nameEs: "Repollo",
    unit: "units",
    baseQty: 1,
    caloriesPerUnit: 250,
    storage: "Cold",
    shelfLifeEn: "2-3 weeks",
    shelfLifeEs: "2-3 semanas",
    tipEn: "Very cost-effective vegetable that lasts a long time.",
    tipEs: "Vegetal muy económico que dura mucho tiempo.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "carrots",
    category: "vegetables",
    nameEn: "Carrots",
    nameEs: "Zanahorias",
    unit: "kg",
    baseQty: 2,
    caloriesPerUnit: 400,
    storage: "Cold",
    shelfLifeEn: "3-4 weeks",
    shelfLifeEs: "3-4 semanas",
    tipEn: "Store in the crisper drawer to maintain crunch.",
    tipEs: "Almacenar en el cajón de verduras para mantener la textura.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },

  // FRUITS
  {
    id: "bananas",
    category: "fruits",
    nameEn: "Bananas",
    nameEs: "Bananos / Guineos",
    unit: "dozen",
    baseQty: 2,
    caloriesPerUnit: 1000,
    storage: "Dry",
    shelfLifeEn: "3-7 days",
    shelfLifeEs: "3-7 días",
    tipEn: "When overripe, peel and freeze for smoothies or baking.",
    tipEs: "Cuando estén muy maduros, pela y congela para batidos o repostería.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },

  // DAIRY
  {
    id: "milk_powder",
    category: "dairy",
    nameEn: "Milk Powder",
    nameEs: "Leche en Polvo",
    unit: "kg",
    baseQty: 1,
    caloriesPerUnit: 4900,
    storage: "Dry",
    shelfLifeEn: "6-12 months",
    shelfLifeEs: "6-12 meses",
    tipEn: "More stable and economical than liquid milk.",
    tipEs: "Más estable y económica que la leche líquida.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "cheese",
    category: "dairy",
    nameEn: "Cheese (Local/Hard)",
    nameEs: "Queso (Local/Duro)",
    unit: "kg",
    baseQty: 0.5,
    caloriesPerUnit: 4000,
    storage: "Cold",
    shelfLifeEn: "2-4 weeks",
    shelfLifeEs: "2-4 semanas",
    tipEn: "In HN, dry cheese lasts longer without constant refrigeration.",
    tipEs: "En Honduras, el queso seco dura más sin refrigeración constante.",
    relevance: ["HN", "US"],
    tierRelevance: ["lower-middle", "middle"]
  },

  // SEASONINGS
  {
    id: "salt",
    category: "seasonings",
    nameEn: "Salt",
    nameEs: "Sal",
    unit: "kg",
    baseQty: 0.5,
    caloriesPerUnit: 0,
    storage: "Dry",
    shelfLifeEn: "Indefinite",
    shelfLifeEs: "Indefinida",
    tipEn: "Vital for food preservation and health in moderation.",
    tipEs: "Vital para la preservación de alimentos y salud en moderación.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "sugar",
    category: "seasonings",
    nameEn: "Sugar",
    nameEs: "Azúcar",
    unit: "kg",
    baseQty: 1.5,
    caloriesPerUnit: 3800,
    storage: "Dry",
    shelfLifeEn: "Indefinite",
    shelfLifeEs: "Indefinida",
    tipEn: "Keep in a dry place to prevent clumping.",
    tipEs: "Mantener en un lugar seco para evitar que se apelmace.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "garlic",
    category: "seasonings",
    nameEn: "Garlic",
    nameEs: "Ajo",
    unit: "heads",
    baseQty: 4,
    caloriesPerUnit: 10,
    storage: "Dry/Dark",
    shelfLifeEn: "2-3 months",
    shelfLifeEs: "2-3 meses",
    tipEn: "Natural antibiotic and essential flavor base.",
    tipEs: "Antibiótico natural y base esencial de sabor.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "bouillon",
    category: "seasonings",
    nameEn: "Bouillon Cubes",
    nameEs: "Cubitos de Pollo/Res",
    unit: "pack (12ct)",
    baseQty: 1,
    caloriesPerUnit: 200,
    storage: "Dry",
    shelfLifeEn: "1-2 years",
    shelfLifeEs: "1-2 años",
    tipEn: "Easy way to add flavor to rice, beans, and soups.",
    tipEs: "Forma fácil de dar sabor a arroz, frijoles y sopas.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },

  // OTHERS
  {
    id: "herbal_tea",
    category: "others",
    nameEn: "Herbal Tea / Infusions",
    nameEs: "Té de Hierbas / Infusiones",
    unit: "box (20ct)",
    baseQty: 2,
    caloriesPerUnit: 0,
    storage: "Dry",
    shelfLifeEn: "1-2 years",
    shelfLifeEs: "1-2 años",
    tipEn: "Chamomile, Hibiscus, or Mint are healthy, soothing, and LDS-approved alternatives.",
    tipEs: "Manzanilla, Rosa de Jamaica o Menta son alternativas saludables, relajantes y aprobadas.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "cocoa_powder",
    category: "others",
    nameEn: "Cocoa Powder",
    nameEs: "Cocoa / Chocolate en Polvo",
    unit: "kg",
    baseQty: 0.25,
    caloriesPerUnit: 2300,
    storage: "Dry",
    shelfLifeEn: "1-2 years",
    shelfLifeEs: "1-2 años",
    tipEn: "Rich in antioxidants and great for hot chocolate or baking.",
    tipEs: "Rica en antioxidantes e ideal para chocolate caliente o repostería.",
    relevance: ["HN", "US"],
    tierRelevance: ["survival", "lower-middle", "middle"]
  },
  {
    id: "wheat_flour",
    category: "others",
    nameEn: "Wheat Flour",
    nameEs: "Harina de Trigo",
    unit: "kg",
    baseQty: 2,
    caloriesPerUnit: 3600,
    storage: "Dry",
    shelfLifeEn: "6-12 months",
    shelfLifeEs: "6-12 meses",
    tipEn: "Use for baleadas (HN) or homemade bread/pancakes.",
    tipEs: "Usa para baleadas (HN) o pan/panqueques caseros.",
    relevance: ["HN", "US"],
    tierRelevance: ["lower-middle", "middle"]
  }
];

export const TIER_CONFIG = {
  survival: {
    varietyFactor: 0.7,
    costFactor: 0.8,
    varietyEn: "High-Calorie Essentials",
    varietyEs: "Esenciales de alta caloría"
  },
  "lower-middle": {
    varietyFactor: 1.0,
    costFactor: 1.0,
    varietyEn: "Standard Balanced Diet",
    varietyEs: "Dieta balanceada estándar"
  },
  middle: {
    varietyFactor: 1.3,
    costFactor: 1.5,
    varietyEn: "Diverse & Nutrient-Rich",
    varietyEs: "Diversa y rica en nutrientes"
  }
};

export const LOCATION_COSTS = {
  HN: {
    basePerPersonUSD: 60,
    currency: "HNL",
    labels: { en: "Honduras Prices", es: "Precios de Honduras" }
  },
  US: {
    basePerPersonUSD: 250,
    currency: "USD",
    labels: { en: "US Prices", es: "Precios de EE.UU." }
  }
};
