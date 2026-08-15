// src/data/menuData.js — Complete menu data for seeding Firestore

// ============================================================
// INGREDIENTS (Ingredienti)
// ============================================================
export const INGREDIENTS = [
  // --- Sauces & Cheeses (Salse e Formaggi) ---
  { id: 'salsa_pomodoro',    name_it: 'Salsa di Pomodoro', name_ar: 'Salsa di Pomodoro',       category: 'sauce_cheese', price_tonda: 0,    price_teglia: 0,    is_available: true },
  { id: 'mozzarella',        name_it: 'Mozzarella', name_ar: 'Mozzarella',           category: 'sauce_cheese', price_tonda: 0,    price_teglia: 0,    is_available: true },
  { id: 'bufala',            name_it: 'Bufala', name_ar: 'Bufala',          category: 'sauce_cheese', price_tonda: 2.5,  price_teglia: 4.0,  is_available: true },
  { id: 'mozzarella_cruda',  name_it: 'Mozzarella Cruda', name_ar: 'Mozzarella Cruda',    category: 'sauce_cheese', price_tonda: 1.5,  price_teglia: 2.5,  is_available: true },
  { id: 'gorgonzola',        name_it: 'Gorgonzola', name_ar: 'Gorgonzola',     category: 'sauce_cheese', price_tonda: 1.5,  price_teglia: 2.5,  is_available: true },

  // --- Meats (Carni) ---
  { id: 'prosciutto_cotto',  name_it: 'Prosciutto Cotto', name_ar: 'Prosciutto Cotto',          category: 'meat', price_tonda: 1.5,  price_teglia: 2.5,  is_available: true },
  { id: 'prosciutto_crudo',  name_it: 'Prosciutto Crudo', name_ar: 'Prosciutto Crudo',            category: 'meat', price_tonda: 2.0,  price_teglia: 3.0,  is_available: true },
  { id: 'salame_piccante',   name_it: 'Salame Piccante', name_ar: 'Salame Piccante',          category: 'meat', price_tonda: 1.5,  price_teglia: 2.5,  is_available: true },
  { id: 'salsiccia',         name_it: 'Salsiccia', name_ar: 'Salsiccia',      category: 'meat', price_tonda: 1.5,  price_teglia: 2.5,  is_available: true },
  { id: 'wurstel',           name_it: 'Würstel', name_ar: 'Würstel',   category: 'meat', price_tonda: 1.0,  price_teglia: 1.5,  is_available: true },
  { id: 'kebab',             name_it: 'Kebab', name_ar: 'Kebab',               category: 'meat', price_tonda: 2.0,  price_teglia: 3.5,  is_available: true },

  // --- Vegetables (Verdure) ---
  { id: 'cipolla',           name_it: 'Cipolla', name_ar: 'Cipolla',               category: 'vegetable', price_tonda: 0.5,  price_teglia: 1.0,  is_available: true },
  { id: 'funghi',            name_it: 'Funghi', name_ar: 'Funghi',               category: 'vegetable', price_tonda: 1.0,  price_teglia: 1.5,  is_available: true },
  { id: 'carciofini',        name_it: 'Carciofini', name_ar: 'Carciofini',             category: 'vegetable', price_tonda: 1.0,  price_teglia: 1.5,  is_available: true },
  { id: 'olive',             name_it: 'Olive', name_ar: 'Olive',             category: 'vegetable', price_tonda: 0.5,  price_teglia: 1.0,  is_available: true },
  { id: 'melanzane',         name_it: 'Melanzane', name_ar: 'Melanzane',           category: 'vegetable', price_tonda: 1.0,  price_teglia: 1.5,  is_available: true },
  { id: 'zucchine',          name_it: 'Zucchine', name_ar: 'Zucchine',              category: 'vegetable', price_tonda: 0.5,  price_teglia: 1.0,  is_available: true },
  { id: 'fiori_zucca',       name_it: 'Fiori di Zucca', name_ar: 'Fiori di Zucca',     category: 'vegetable', price_tonda: 1.5,  price_teglia: 2.5,  is_available: true },
  { id: 'peperoni',          name_it: 'Peperoni', name_ar: 'Peperoni',       category: 'vegetable', price_tonda: 0.5,  price_teglia: 1.0,  is_available: true },
  { id: 'cicoria',           name_it: 'Cicoria', name_ar: 'Cicoria',            category: 'vegetable', price_tonda: 1.0,  price_teglia: 1.5,  is_available: true },
  { id: 'pomodori_crudi',    name_it: 'Pomodori Crudi', name_ar: 'Pomodori Crudi',      category: 'vegetable', price_tonda: 0.5,  price_teglia: 1.0,  is_available: true },
  { id: 'patate_julienne',   name_it: 'Patate a Julienne', name_ar: 'Patate a Julienne',    category: 'vegetable', price_tonda: 1.0,  price_teglia: 1.5,  is_available: true },
  { id: 'patate_fritte',     name_it: 'Patate Fritte', name_ar: 'Patate Fritte',      category: 'vegetable', price_tonda: 1.0,  price_teglia: 1.5,  is_available: true },

  // --- Other (Altro) ---
  { id: 'peperoncino',       name_it: 'Peperoncino', name_ar: 'Peperoncino',         category: 'other', price_tonda: 0.0,  price_teglia: 0.0,  is_available: true },
  { id: 'alici',             name_it: 'Alici', name_ar: 'Alici',           category: 'other', price_tonda: 1.5,  price_teglia: 2.5,  is_available: true },
  { id: 'uova',              name_it: 'Uova', name_ar: 'Uova',               category: 'other', price_tonda: 0.5,  price_teglia: 1.0,  is_available: true },
  { id: 'origano',           name_it: 'Origano', name_ar: 'Origano',         category: 'other', price_tonda: 0.0,  price_teglia: 0.0,  is_available: true },
];

// ============================================================
// PRESET PIZZAS (Pizze Predefinite)
// ============================================================
export const PRESET_PIZZAS = [
  {
    id: 'custom_pizza',
    name_it: 'Pizza Personalizzata', name_ar: 'بيتزا مخصصة',
    description_it: 'Crea la tua pizza da zero!',
    description_ar: 'اصنع البيتزا الخاصة بك من الصفر!',
    ingredients: ['salsa_pomodoro','mozzarella'],
    base_price_tonda: 5.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: -1
  },

  {
    id: 'margherita',
    name_it: 'Margherita', name_ar: 'Margherita',
    description_it: 'La regina delle pizze. Pomodoro e mozzarella.',
    description_ar: 'مارغريتا. طماطم وجبنة موتزاريلا.',
    ingredients: ['salsa_pomodoro','mozzarella'],
    base_price_tonda: 5.0,
    base_price_teglia: 13.0,
    is_available: true,
    sort_order: 0
  },
  {
    id: 'capricciosa',
    name_it: 'Capricciosa', name_ar: 'Capricciosa',
    description_it: 'Il grande classico. Pomodoro, mozzarella, prosciutto cotto, funghi, carciofini e olive.',
    description_ar: 'Il grande classico. Pomodoro, mozzarella, prosciutto cotto, funghi, carciofini e olive.',
    ingredients: ['salsa_pomodoro','mozzarella','prosciutto_cotto','funghi','carciofini','olive'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 1
  },
  {
    id: 'diavola',
    name_it: 'Diavola', name_ar: 'Diavola',
    description_it: 'Per chi ama il piccante! Pomodoro, mozzarella e salame piccante.',
    description_ar: 'Per chi ama il piccante! Pomodoro, mozzarella e salame piccante.',
    ingredients: ['salsa_pomodoro','mozzarella','salame_piccante'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 2
  },
  {
    id: 'diavola_extra_piccante',
    name_it: 'Diavola Extra Piccante', name_ar: 'Diavola Extra Piccante',
    description_it: 'Fuoco e fiamme! Come la Diavola ma con peperoncino in più per i veri amanti del piccante.',
    description_ar: 'Fuoco e fiamme! Come la Diavola ma con peperoncino in più per i veri amanti del piccante.',
    ingredients: ['salsa_pomodoro','mozzarella','salame_piccante','peperoncino'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 3
  },
  {
    id: 'napoli_romana',
    name_it: 'Napoli (Romana)', name_ar: 'Napoli (Romana)',
    description_it: 'La tradizione partenopea. Pomodoro, mozzarella, alici e origano.',
    description_ar: 'La tradizione partenopea. Pomodoro, mozzarella, alici e origano.',
    ingredients: ['salsa_pomodoro','mozzarella','alici','origano'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 4
  },
  {
    id: 'alici_mediterranea',
    name_it: 'Alici Mediterranea', name_ar: 'Alici Mediterranea',
    description_it: 'Sapori del Mediterraneo. Pomodoro, mozzarella, alici, olive e origano.',
    description_ar: 'Sapori del Mediterraneo. Pomodoro, mozzarella, alici, olive e origano.',
    ingredients: ['salsa_pomodoro','mozzarella','alici','olive','origano'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 5
  },
  {
    id: 'bufalina',
    name_it: 'Bufalina', name_ar: 'Bufalina',
    description_it: 'Semplicità e qualità. Pomodoro e fresca mozzarella di bufala DOP.',
    description_ar: 'Semplicità e qualità. Pomodoro e fresca mozzarella di bufala DOP.',
    ingredients: ['salsa_pomodoro','bufala'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 6
  },
  {
    id: 'crudo_bufala',
    name_it: 'Crudo e Bufala', name_ar: 'Crudo e Bufala',
    description_it: 'L\'incontro perfetto. Pomodoro, bufala fresca e prosciutto crudo.',
    description_ar: 'التلاقي المثالي. طماطم، بوفالا طازجة وهام خام.',
    ingredients: ['salsa_pomodoro','bufala','prosciutto_crudo'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 7
  },
  {
    id: 'boscaiola',
    name_it: 'Boscaiola', name_ar: 'Boscaiola',
    description_it: 'Profumo di bosco. Pomodoro, mozzarella, salsiccia e funghi.',
    description_ar: 'Profumo di bosco. Pomodoro, mozzarella, salsiccia e funghi.',
    ingredients: ['salsa_pomodoro','mozzarella','salsiccia','funghi'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 8
  },
  {
    id: 'salsiccia_cipolla',
    name_it: 'Salsiccia e Cipolla', name_ar: 'Salsiccia e Cipolla',
    description_it: 'Rustico e saporito. Pomodoro, mozzarella, salsiccia e cipolla.',
    description_ar: 'Rustico e saporito. Pomodoro, mozzarella, salsiccia e cipolla.',
    ingredients: ['salsa_pomodoro','mozzarella','salsiccia','cipolla'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 9
  },
  {
    id: 'salsiccia_cicoria',
    name_it: 'Salsiccia e Cicoria', name_ar: 'Salsiccia e Cicoria',
    description_it: 'Abbinamento tipico romano. Pomodoro, mozzarella, salsiccia e cicoria.',
    description_ar: 'Abbinamento tipico romano. Pomodoro, mozzarella, salsiccia e cicoria.',
    ingredients: ['salsa_pomodoro','mozzarella','salsiccia','cicoria'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 10
  },
  {
    id: 'bismarck',
    name_it: 'Bismarck', name_ar: 'Bismarck',
    description_it: 'Con l\'uovo sopra! Pomodoro, mozzarella, prosciutto cotto e uova.',
    description_ar: 'مع البيض فوقها! طماطم، موتزاريلا، هام وبيض.',
    ingredients: ['salsa_pomodoro','mozzarella','prosciutto_cotto','uova'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 11
  },
  {
    id: 'americana',
    name_it: 'Americana', name_ar: 'Americana',
    description_it: 'Stile americano! Pomodoro, mozzarella, würstel e patatine fritte.',
    description_ar: 'Stile americano! Pomodoro, mozzarella, würstel e patatine fritte.',
    ingredients: ['salsa_pomodoro','mozzarella','wurstel','patate_fritte'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 12
  },
  {
    id: 'ortolana',
    name_it: 'Ortolana (Vegetariana)', name_ar: 'Ortolana (Vegetariana)',
    description_it: 'Fresca e colorata. Pomodoro, mozzarella, peperoni, zucchine e melanzane.',
    description_ar: 'Fresca e colorata. Pomodoro, mozzarella, peperoni, zucchine e melanzane.',
    ingredients: ['salsa_pomodoro','mozzarella','peperoni','zucchine','melanzane'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 13
  },
  {
    id: 'ortolana_piccante',
    name_it: 'Ortolana Piccante', name_ar: 'Ortolana Piccante',
    description_it: 'La versione piccante dell\'Ortolana. Stessa verdura ma con peperoncino!',
    description_ar: 'النسخة الحارة من الأورتولانا. نفس الخضروات لكن مع فلفل حار!',
    ingredients: ['salsa_pomodoro','mozzarella','peperoni','zucchine','melanzane','peperoncino'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 14
  },
  {
    id: 'gorgonzola_salsiccia',
    name_it: 'Gorgonzola e Salsiccia', name_ar: 'Gorgonzola e Salsiccia',
    description_it: 'Cremosa e intensa. Mozzarella, gorgonzola e salsiccia.',
    description_ar: 'Cremosa e intensa. Mozzarella, gorgonzola e salsiccia.',
    ingredients: ['mozzarella','gorgonzola','salsiccia'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 15
  },
  {
    id: 'fiori_zucca_alici',
    name_it: 'Fiori di Zucca e Alici', name_ar: 'Fiori di Zucca e Alici',
    description_it: 'Elegante e raffinata. Mozzarella, fiori di zucca e alici.',
    description_ar: 'Elegante e raffinata. Mozzarella, fiori di zucca e alici.',
    ingredients: ['mozzarella','fiori_zucca','alici'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 16
  },
  {
    id: 'pizza_patate',
    name_it: 'Pizza con Patate', name_ar: 'Pizza con Patate',
    description_it: 'Morbida e golosa. Mozzarella e patate a julienne dorate.',
    description_ar: 'Morbida e golosa. Mozzarella e patate a julienne dorate.',
    ingredients: ['mozzarella','patate_julienne'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 17
  },
  {
    id: 'pugliese',
    name_it: 'Pugliese', name_ar: 'Pugliese',
    description_it: 'Dal sud Italia. Pomodoro, mozzarella, cipolla e origano.',
    description_ar: 'Dal sud Italia. Pomodoro, mozzarella, cipolla e origano.',
    ingredients: ['salsa_pomodoro','mozzarella','cipolla','origano'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 18
  },
  {
    id: 'pizza_kebab',
    name_it: 'Pizza Kebab', name_ar: 'Pizza Kebab',
    description_it: 'Fusion perfetta! Pomodoro, mozzarella e kebab di pollo.',
    description_ar: 'Fusion perfetta! Pomodoro, mozzarella e kebab di pollo.',
    ingredients: ['salsa_pomodoro','mozzarella','kebab'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 19
  },
  {
    id: 'kebab_completa',
    name_it: 'Kebab Completa', name_ar: 'Kebab Completa',
    description_it: 'La pizza kebab completa. Pomodoro, mozzarella, kebab, cipolla, peperoni e salsa yogurt.',
    description_ar: 'La pizza kebab completa. Pomodoro, mozzarella, kebab, cipolla, peperoni e salsa yogurt.',
    ingredients: ['salsa_pomodoro','mozzarella','kebab','cipolla','peperoni'],
    base_price_tonda: 6.0,
    base_price_teglia: 15.0,
    is_available: true,
    sort_order: 20
  },
];

// ============================================================
// FRITTI (Fritti)
// ============================================================
export const FRITTI = [
  { id: 'patatine_fritte',     name_it: 'Patatine Fritte', name_ar: 'Patatine Fritte',        price: 2.0,  description_ar: 'Patatine fritte dorate e croccanti', is_available: true, sort_order: 1 },
  { id: 'mozzarelline_fritte', name_it: 'Mozzarelline Fritte', name_ar: 'Mozzarelline Fritte',    price: 0.5,  description_ar: 'Mozzarelline fritte dorate', is_available: true, sort_order: 2 },
  { id: 'crocchette_patate',   name_it: 'Crocchette di Patate', name_ar: 'Crocchette di Patate',       price: 0.5,  description_ar: 'Crocchette di patate cremose', is_available: true, sort_order: 3 },
  { id: 'olive_ascolane',      name_it: 'Olive Ascolane', name_ar: 'Olive Ascolane',     price: 0.5,  description_ar: 'Olive ripiene e fritte all\'italiana', is_available: true, sort_order: 4 },
  { id: 'supli',               name_it: 'Supplì', name_ar: 'Supplì',              price: 1.0,  description_ar: 'Supplì di riso ripieni di mozzarella', is_available: true, sort_order: 5 },
  { id: 'hotdog',              name_it: 'Hot Dog', name_ar: 'Hot Dog',              price: 2.0,  description_ar: 'Hot dog fritto', is_available: true, sort_order: 6 },
];

// ============================================================
// BEVANDE (Bevande)
// ============================================================
export const BEVANDE = [
  // Water & Soft Drinks
  { id: 'acqua_piccola',       name_it: 'Acqua Piccola', name_ar: 'Acqua Piccola',    price: 1.5,  category: 'water_soft', is_available: true, sort_order: 1 },
  { id: 'acqua_grande_nat',    name_it: 'Acqua Grande Naturale', name_ar: 'Acqua Grande Naturale', price: 2.0, category: 'water_soft', is_available: true, sort_order: 2 },
  { id: 'acqua_grande_friz',   name_it: 'Acqua Grande Frizzante', name_ar: 'Acqua Grande Frizzante',  price: 2.0, category: 'water_soft', is_available: true, sort_order: 3 },
  { id: 'coca_cola_lattina',   name_it: 'Coca-Cola Lattina', name_ar: 'Coca-Cola Lattina',      price: 2.5,  category: 'water_soft', is_available: true, sort_order: 4 },
  { id: 'coca_cola_grande',    name_it: 'Coca-Cola Grande', name_ar: 'Coca-Cola Grande',    price: 3.5,  category: 'water_soft', is_available: true, sort_order: 5 },
  { id: 'fanta_lattina',       name_it: 'Fanta Lattina', name_ar: 'Fanta Lattina',         price: 2.5,  category: 'water_soft', is_available: true, sort_order: 6 },

  // Beer (بيرة)
  { id: 'peroni_piccola',      name_it: 'Peroni Piccola', name_ar: 'Peroni Piccola',        price: 3.0,  category: 'beer', is_available: true, sort_order: 7 },
  { id: 'peroni_grande',       name_it: 'Peroni Grande', name_ar: 'Peroni Grande',        price: 5.0,  category: 'beer', is_available: true, sort_order: 8 },
  { id: 'ichnusa',             name_it: 'Ichnusa', name_ar: 'Ichnusa',             price: 3.5,  category: 'beer', is_available: true, sort_order: 9 },
  { id: 'heineken_piccola',    name_it: 'Heineken Piccola', name_ar: 'Heineken Piccola',        price: 3.5,  category: 'beer', is_available: true, sort_order: 10 },
  { id: 'heineken_grande',     name_it: 'Heineken Grande', name_ar: 'Heineken Grande',        price: 5.5,  category: 'beer', is_available: true, sort_order: 11 },
  { id: 'tennents',            name_it: "Tennent's", name_ar: "Tennent's",            price: 4.0,  category: 'beer', is_available: true, sort_order: 12 },
  { id: 'ceres',               name_it: 'Ceres', name_ar: 'Ceres',              price: 4.0,  category: 'beer', is_available: true, sort_order: 13 },
  { id: 'corona',              name_it: 'Corona', name_ar: 'Corona',             price: 4.5,  category: 'beer', is_available: true, sort_order: 14 },
];

// ============================================================
// KEBAB OPTIONS (Opzioni Kebab)
// ============================================================
export const KEBAB_OPTIONS = {
  serving_styles: [
    { id: 'sandwich_pizza',  name_it: 'Sandwich nel Pane Pizza', name_ar: 'Sandwich nel Pane Pizza' },
    { id: 'sandwich_focaccia', name_it: 'Sandwich nella Focaccia', name_ar: 'Sandwich nella Focaccia' },
    { id: 'piatto',          name_it: 'Sul Piatto', name_ar: 'Sul Piatto' },
  ],
  vegetables: [
    { id: 'lattuga',  name_it: 'Lattuga', name_ar: 'Lattuga' },
    { id: 'cipolla',  name_it: 'Cipolla', name_ar: 'Cipolla' },
    { id: 'pomodoro', name_it: 'Pomodoro', name_ar: 'Pomodoro' },
    { id: 'patate_fritte', name_it: 'Patate Fritte', name_ar: 'Patate Fritte' },
    { id: 'verdure_grigliate', name_it: 'Verdure Grigliate', name_ar: 'Verdure Grigliate' },
  ],
  sauces: [
    { id: 'yogurt',    name_it: 'Yogurt', name_ar: 'Yogurt' },
    { id: 'maionese',  name_it: 'Maionese', name_ar: 'Maionese' },
    { id: 'ketchup',   name_it: 'Ketchup', name_ar: 'Ketchup' },
    { id: 'piccante',  name_it: 'Piccante', name_ar: 'Piccante' },
  ],
  base_price: 5.0,
};

// ============================================================
// TABLES (Tavoli)
// ============================================================
export const TABLES = Array.from({ length: 12 }, (_, i) => ({
  id: `table_${i + 1}`,
  table_number: i + 1,
  status: 'available',
  active_session_id: null,
  seats: i < 4 ? 2 : i < 8 ? 4 : 6,
}));

// ============================================================
// ORDER STATUS CONFIG
// ============================================================
export const ORDER_STATUS = {
  pending:        { label_it: 'In Attesa', label_ar: 'In Attesa',    color: 'amber',  emoji: '⏳', next: 'in_preparation' },
  in_preparation: { label_it: 'In Preparazione', label_ar: 'In Preparazione',   color: 'blue',   emoji: '👨‍🍳', next: 'in_oven' },
  in_oven:        { label_it: 'In Forno', label_ar: 'In Forno',       color: 'orange', emoji: '🔥', next: 'ready' },
  ready:          { label_it: 'Pronto!', label_ar: 'Pronto!',          color: 'green',  emoji: '✅', next: 'served' },
  served:         { label_it: 'Servito', label_ar: 'Servito',     color: 'gray',   emoji: '🍽️', next: null },
};
