// ================= LEVEL DATA & CULTURAL CONTENT =================
PEOPLE.kumhar = { female: false, cloth: '#a0522d', cloth2: '#f2e6c8', skin: '#9a5c2e', name: B('कुम्हार काका', 'Potter Kaka'), s: 1, mustache: true, grey: true };
PEOPLE.basor = { female: true, cloth: '#16a085', cloth2: C.tur, skin: '#9a5c2e', name: B('बाँस वाली मौसी', 'Bamboo-weaver Mausi'), s: .97 };
PEOPLE.dancer1 = { female: true, cloth: '#e2401c', cloth2: '#ffd23f', skin: '#b8743f', name: B('लोक नर्तकी', 'Folk Dancer'), s: .98 };
PEOPLE.dancer2 = { female: true, cloth: '#1f3a93', cloth2: '#ff9f1c', skin: '#9a5c2e', name: B('लोक नर्तकी', 'Folk Dancer'), s: .96 };
PEOPLE.dholak = { female: false, cloth: '#f2e6c8', cloth2: C.red, skin: '#9a5c2e', name: B('ढोलक वाले भैया', 'Dholak Bhaiya'), s: 1 };

const DAYS = [
  B('तैयारी', 'Preparation'), B('दिन 1 · नहाय-खाय', 'Day 1 · Nahay-Khay'), B('दिन 2 · खरना', 'Day 2 · Kharna'),
  B('दिन 3 · संध्या अर्घ्य', 'Day 3 · Sandhya Arghya'), B('दिन 4 · उषा अर्घ्य', 'Day 4 · Usha Arghya'), B('महापर्व सम्पन्न', 'Festival Complete')
];

// goal helpers
const G = {
  got: (id, n, t) => ({ t, of: n, n: w => w.got[id] || 0, find: w => w.findItem(id) }),
  gotAny: (ids, t) => ({ t, of: ids.length, n: w => ids.filter(i => (w.got[i] || 0) > 0).length, find: w => { for (const i of ids) if (!(w.got[i] > 0)) return w.findItem(i); return null; } }),
  talk: (n, t = B('गाँव वालों से बात करें', 'Talk to villagers')) => ({ t, of: n, n: w => w.talked.size, find: w => w.findNpc() }),
  spot: (kind, n, t) => ({ t, of: n, n: w => w.spotDone(kind), find: w => w.findSpot(kind) }),
  esc: (who, t) => ({ t, of: 1, n: w => w.escDone[who] ? 1 : 0, find: w => w.findEsc(who) })
};

const LEVELS = [
  { // ---------------- 1 ----------------
    id: 1, day: 0, title: B('मेरा सुंदर गाँव', 'My Beautiful Village'), sub: B('छठ की तैयारी शुरू!', 'Preparations begin!'),
    width: 3300, pal: 'day', ground: 'village', track: 0, amb: { birds: 1, wind: .3 }, art: 'sun',
    scenery: [
      { k: 'house', x: 120, w: 170, h: 120, seed: 1 }, { k: 'tree', x: 470, s: 1, kind: 'mango' }, { k: 'house', x: 620, w: 200, h: 130, seed: 2 },
      { k: 'tree', x: 1000, s: 1.1, kind: 'peepal' }, { k: 'house', x: 1130, w: 160, h: 115, seed: 3 }, { k: 'pond', x: 1330, w: 180 },
      { k: 'tree', x: 1560, s: .9, kind: 'banana' }, { k: 'house', x: 1780, w: 190, h: 125, seed: 4 }, { k: 'tree', x: 2190, s: 1.05, kind: 'mango' },
      { k: 'house', x: 2380, w: 170, h: 120, seed: 5 }, { k: 'tree', x: 2720, s: .9, kind: 'banana' }, { k: 'house', x: 2900, w: 180, h: 125, seed: 6 }, { k: 'tree', x: 3200, s: 1, kind: 'peepal' }
    ],
    plats: [{ x: 790, y: GY - 42, w: 110, kind: 'charpai' }, { x: 1600, y: GY - 70, w: 90, kind: 'hay' }, { x: 2040, y: GY - 60, w: 70, kind: 'crate' }, { x: 2110, y: GY - 122, w: 70, kind: 'crate' }, { x: 2160, y: GY - 184, w: 110, kind: 'branch' }],
    items: [['flower', 320], ['flower', 720], ['flower', 845, GY - 80], ['flower', 1060], ['flower', 1420], ['flower', 1645, GY - 110], ['flower', 2215, GY - 188], ['flower', 2620], ['flower', 1180], ['flower', 2830],
    ['soop', 2145, GY - 160], ['daura', 2560], ['diya', 420], ['diya', 1700], ['diya', 3080]],
    npcs: [{ who: 'maa', x: 260, lines: [B('अरे बेटा! इस बार छठ महापर्व हमारे गाँव में बहुत धूमधाम से मनेगा।', 'Beta! This year Chhath Mahaparv will be grand in our village.'), B('पर कल रात की आँधी ने सारी तैयारी बिखेर दी। गेंदे के फूल, सूप, दउरा और दीये ढूँढ़ लाओ।', 'But last night\'s storm scattered everything. Please find marigolds, the soop, the daura and diyas.')] },
    { who: 'dadi', x: 1230, lines: [B('आओ मेरे लाल! छठ सूर्य देव और छठी मइया की पूजा है।', 'Come, my dear! Chhath is the worship of Surya Dev and Chhathi Maiya.'), B('इसमें कोई मूर्ति नहीं होती — हम सीधे सूर्य, जल और प्रकृति को धन्यवाद देते हैं।', 'There is no idol — we thank the Sun, water and nature directly.'), B('मेरी पहेली हल करोगे? मेरे घर के पास वाले चिह्न पर आओ।', 'Will you solve my riddle? Come to the sign near my house.')] },
    { who: 'golu', x: 1960, lines: [B('भैया/दीदी! आँधी में सूप उड़कर पेड़ पर अटक गया है!', 'Look! The storm blew the soop up into the tree!'), B('पेटियों पर कूदकर ऊपर जाओ — स्पेस दबाओ!', 'Jump up the crates — press Space!')] },
    { who: 'kaki', x: 2700, lines: [B('दरवाज़ों को आम के पत्तों और गेंदे के तोरण से सजाओ, तब पर्व का रंग आएगा।', 'Decorate doors with mango-leaf and marigold torans — that\'s when the festival feels real.')] },
    { who: 'munni', x: 3050, lines: [B('मुझे छठ के गीत बहुत पसंद हैं! पूरा गाँव साथ गाता है।', 'I love Chhath songs! The whole village sings together.')] }],
    spots: [{ kind: 'door', x: 720, label: B('दरवाज़ा सजाएँ', 'Decorate door') }, { kind: 'door', x: 1875, label: B('दरवाज़ा सजाएँ', 'Decorate door') }, { kind: 'door', x: 2990, label: B('दरवाज़ा सजाएँ', 'Decorate door') },
    { kind: 'quiz', x: 1320, mini: 'symbols', need: w => w.talked.has('dadi'), needMsg: B('पहले दादी से बात करो', 'Talk to Dadi first'), label: B('दादी की पहेली', 'Dadi\'s Riddle') }],
    goals: [G.got('flower', 8, B('गेंदे के फूल इकट्ठा करें', 'Collect marigolds')), G.gotAny(['soop', 'daura', 'diya'], B('सूप, दउरा और दीया ढूँढ़ें', 'Find soop, daura & diya')),
    G.talk(4), G.spot('door', 3, B('दरवाज़े सजाएँ', 'Decorate doors')), G.spot('quiz', 1, B('दादी की पहेली हल करें', 'Solve Dadi\'s riddle'))],
    card: {
      title: B('छठ महापर्व क्या है?', 'What is Chhath Mahaparv?'), pic: 'sun',
      facts: [B('छठ चार दिनों का पर्व है जो सूर्य देव और छठी मइया को समर्पित है।', 'Chhath is a four-day festival devoted to Surya Dev and Chhathi Maiya.'),
      B('यह मुख्य रूप से बिहार, झारखंड, पूर्वी उत्तर प्रदेश और नेपाल के मिथिला क्षेत्र में मनाया जाता है।', 'It is celebrated mainly in Bihar, Jharkhand, eastern Uttar Pradesh and the Mithila region of Nepal.'),
      B('यह कार्तिक शुक्ल षष्ठी को पड़ता है — "छठ" शब्द "षष्ठी" (छठा दिन) से आया है।', 'It falls on Kartik Shukla Shashthi — "Chhath" comes from "Shashthi", the sixth day.'),
      B('इसमें कोई मूर्ति नहीं होती; लोग सीधे सूर्य, जल और प्रकृति की उपासना करते हैं।', 'No idol is used; people worship the Sun, water and nature directly.')]
    }
  },
  { // ---------------- 2 ----------------
    id: 2, day: 1, title: B('नहाय-खाय', 'Nahay-Khay'), sub: B('पहला दिन: स्नान और शुद्धता', 'Day 1: Holy bath and purity'),
    width: 2700, pal: 'noon', ground: 'village', track: 1, amb: { birds: .8, river: .4 }, art: 'fish', bgRiver: true,
    scenery: [{ k: 'house', x: 100, w: 260, h: 140, seed: 2 }, { k: 'wall', x: 360, w: 520 }, { k: 'tulsi', x: 600 }, { k: 'tree', x: 960, s: 1, kind: 'banana' }, { k: 'vine', x: 1080, w: 360 }, { k: 'tree', x: 1560, s: 1, kind: 'mango' },
    { k: 'house', x: 1700, w: 180, h: 120, seed: 7 }, { k: 'tree', x: 2050, s: .9, kind: 'banana' }, { k: 'aangan', x: 2160, w: 420 }, { k: 'chulha', x: 2420 }],
    plats: [{ x: 1080, y: GY - 76, w: 120, kind: 'vine' }, { x: 1250, y: GY - 130, w: 120, kind: 'vine' }, { x: 1830, y: GY - 50, w: 90, kind: 'charpai' }],
    items: [['lauki', 1140, GY - 110], ['lauki', 1310, GY - 165], ['chana', 1870, GY - 85], ['rice', 1650], ['ghee', 2250]],
    npcs: [{ who: 'papa', x: 300, pose: 'work', lines: [B('आज नहाय-खाय है। व्रती ने सुबह गंगा में पवित्र स्नान किया है।', 'Today is Nahay-Khay. The vrati took a holy dip in the Ganga this morning.'), B('पूरे घर को अच्छे से साफ़ करना है — झाड़ू वाले निशानों पर E दबाओ।', 'The whole house must be spotless — press E at the dusty spots.')] },
    { who: 'chachi', x: 1500, lines: [B('बगीचे से लौकी तोड़ लाओ — बेल पर कूदकर!', 'Pick bottle gourds from the garden — jump onto the vine!')] },
    { who: 'dadi', x: 2000, lines: [B('आज व्रती सात्विक भोजन करती हैं — लौकी की सब्ज़ी, चने की दाल और अरवा चावल।', 'Today the vrati eats a pure satvik meal — lauki curry, chana dal and arwa rice.'), B('बिना लहसुन-प्याज़ के, सेंधा नमक और घी के साथ, मिट्टी के चूल्हे पर पकता है।', 'No onion or garlic — cooked with rock salt and ghee on a mud chulha.')] },
    { who: 'maa', x: 2380, pose: 'work', lines: [B('सब सामग्री ले आए? चलो कद्दू-भात बनाते हैं!', 'Got all the ingredients? Let\'s make kaddu-bhaat!')] }],
    spots: [{ kind: 'sweep', x: 180 }, { kind: 'sweep', x: 330 }, { kind: 'sweep', x: 470 }, { kind: 'sweep', x: 640 }, { kind: 'sweep', x: 800 },
    { kind: 'cook', x: 2470, mini: 'recipe', arg: 'nahay', need: w => ['lauki', 'chana', 'rice', 'ghee'].every(i => w.got[i] > 0) && w.spotDone('sweep') >= 5, needMsg: B('पहले घर साफ़ करें और सब सामग्री लाएँ', 'Clean the house and gather all ingredients first'), label: B('भोजन बनाएँ', 'Cook the meal') }],
    goals: [G.spot('sweep', 5, B('घर की सफ़ाई करें', 'Clean the house')), G.gotAny(['lauki', 'chana', 'rice', 'ghee'], B('ताज़ी सामग्री लाएँ', 'Gather fresh ingredients')), G.talk(4), G.spot('cook', 1, B('कद्दू-भात बनाएँ', 'Cook kaddu-bhaat'))],
    card: {
      title: B('नहाय-खाय — पहला दिन', 'Nahay-Khay — Day 1'), pic: 'river',
      facts: [B('"नहाय-खाय" का अर्थ है "नहाना और खाना"। व्रती नदी या तालाब में पवित्र स्नान करते हैं।', '"Nahay-Khay" means "bathe and eat". Devotees (vratis) take a holy dip in a river or pond.'),
      B('घर को पूरी तरह साफ़ किया जाता है — शुद्धता इस पर्व का हृदय है।', 'The home is cleaned thoroughly — purity is the heart of this festival.'),
      B('व्रती एक बार सात्विक भोजन करते हैं: कद्दू (लौकी) की सब्ज़ी, चने की दाल और अरवा चावल।', 'The vrati eats one satvik meal: kaddu (bottle gourd) curry, chana dal and arwa rice.'),
      B('यह भोजन बिना लहसुन-प्याज़, सेंधा नमक और घी से बनता है।', 'It is cooked without onion or garlic, using rock salt and ghee.')]
    }
  },
  { // ---------------- 3 ----------------
    id: 3, day: 2, title: B('खरना', 'Kharna'), sub: B('दूसरा दिन: गुड़ की खीर का प्रसाद', 'Day 2: Jaggery kheer prasad'),
    width: 2500, pal: 'after', ground: 'village', track: 1, amb: { birds: .5, wind: .2 }, art: 'lotus',
    scenery: [{ k: 'house', x: 80, w: 220, h: 130, seed: 3 }, { k: 'tree', x: 420, s: 1.05, kind: 'mango' }, { k: 'shelf', x: 560 }, { k: 'house', x: 760, w: 180, h: 120, seed: 8 },
    { k: 'cow', x: 1100 }, { k: 'tree', x: 1350, s: 1, kind: 'peepal' }, { k: 'wall', x: 1500, w: 300 }, { k: 'aangan', x: 1820, w: 520 }, { k: 'chulha', x: 2150 }, { k: 'tree', x: 2420, s: .9, kind: 'banana' }],
    plats: [{ x: 540, y: GY - 60, w: 100, kind: 'shelf' }, { x: 560, y: GY - 130, w: 80, kind: 'shelf' }, { x: 1580, y: GY - 48, w: 110, kind: 'charpai' }],
    items: [['atta', 590, GY - 100], ['gur', 600, GY - 165], ['milk', 1160], ['rice', 1630, GY - 85], ['leaf', 1400]],
    npcs: [{ who: 'maa', x: 300, lines: [B('आज खरना है। व्रती दिन भर उपवास रखती हैं।', 'Today is Kharna. The vrati fasts the whole day.'), B('शाम को गुड़ की खीर (रसियाव) और रोटी का प्रसाद बनेगा — नए मिट्टी के चूल्हे पर, आम की लकड़ी से।', 'In the evening we make gur kheer (rasiyaw) and roti — on a new mud chulha with mango wood.')] },
    { who: 'kaki', x: 1250, lines: [B('गाय का शुद्ध दूध ले जाओ बेटा।', 'Take this pure cow\'s milk, beta.')] },
    { who: 'chacha', x: 1750, lines: [B('रसोई के बर्तन सजाने में मदद करो — चमकते निशानों पर E दबाओ।', 'Help arrange the kitchen pots — press E at the shining marks.')] },
    { who: 'dadi', x: 2050, lines: [B('खरना का प्रसाद खाने के बाद 36 घंटे का निर्जला व्रत शुरू होता है — बिना पानी के भी!', 'After eating the Kharna prasad, a 36-hour nirjala fast begins — without even water!'), B('यह तपस्या, धैर्य और श्रद्धा का पर्व है।', 'It is a festival of discipline, patience and faith.')] }],
    spots: [{ kind: 'arrange', x: 1880 }, { kind: 'arrange', x: 1960 }, { kind: 'arrange', x: 2280 },
    { kind: 'cook', x: 2190, mini: 'recipe', arg: 'kheer', need: w => ['gur', 'milk', 'rice', 'atta'].every(i => w.got[i] > 0), needMsg: B('पहले गुड़, दूध, चावल और आटा लाएँ', 'Bring jaggery, milk, rice and flour first'), label: B('खीर-रोटी बनाएँ', 'Make kheer & roti') }],
    goals: [G.gotAny(['gur', 'milk', 'rice', 'atta', 'leaf'], B('प्रसाद की सामग्री लाएँ', 'Collect prasad ingredients')), G.spot('arrange', 3, B('रसोई सजाएँ', 'Arrange the kitchen')), G.talk(4), G.spot('cook', 1, B('खरना प्रसाद बनाएँ', 'Prepare Kharna prasad'))],
    card: {
      title: B('खरना — दूसरा दिन', 'Kharna — Day 2'), pic: 'kheer',
      facts: [B('खरना (लोहंडा) के दिन व्रती पूरे दिन उपवास रखते हैं।', 'On Kharna (Lohanda), the vrati fasts through the day.'),
      B('शाम को गुड़-चावल-दूध की खीर (रसियाव) और रोटी का प्रसाद मिट्टी के चूल्हे पर बनता है।', 'In the evening, kheer of jaggery, rice and milk (rasiyaw) and roti are cooked on a mud chulha.'),
      B('पूजा के बाद व्रती प्रसाद ग्रहण करते हैं और परिवार-पड़ोसियों में बाँटते हैं।', 'After worship, the vrati eats the prasad and it is shared with family and neighbours.'),
      B('इसके बाद 36 घंटे का निर्जला व्रत शुरू होता है।', 'Then the 36-hour nirjala (waterless) fast begins.')]
    }
  },
  { // ---------------- 4 ----------------
    id: 4, day: 2, title: B('प्रसाद का महा-अभियान', 'The Great Prasad Adventure'), sub: B('सूप के लिए सब कुछ इकट्ठा करें', 'Gather everything for the soop'),
    width: 3700, pal: 'day', ground: 'village', track: 4, amb: { birds: 1, crowd: .3 }, art: 'peacock',
    scenery: [{ k: 'house', x: 60, w: 200, h: 125, seed: 1 }, { k: 'chulha', x: 340 }, { k: 'field', x: 560, w: 300 }, { k: 'canefield', x: 1080, w: 260 }, { k: 'tree', x: 1460, s: 1, kind: 'banana' }, { k: 'tree', x: 1540, s: 1.1, kind: 'banana' },
    { k: 'palm', x: 1830 }, { k: 'stall', x: 2050, w: 380, label: B('हाट', 'Village Haat') }, { k: 'field', x: 2560, w: 240 }, { k: 'bamboo', x: 2900 }, { k: 'potter', x: 3130 }, { k: 'tree', x: 3330, s: 1, kind: 'mango' }, { k: 'aangan', x: 3420, w: 260 }],
    plats: [{ x: 1470, y: GY - 74, w: 90, kind: 'hay' }, { x: 1760, y: GY - 60, w: 70, kind: 'crate' }, { x: 1820, y: GY - 120, w: 70, kind: 'crate' }, { x: 1790, y: GY - 182, w: 110, kind: 'branch' }],
    items: [['rice', 680], ['sugarcane', 1160], ['banana', 1515, GY - 108], ['coconut', 1845, GY - 186], ['apple', 2120], ['orange', 2230], ['lemon', 2340], ['ginger', 2600], ['turmeric', 2720], ['soop', 2960], ['daura', 3040], ['diya', 3190], ['flower', 3330]],
    npcs: [{ who: 'maa', x: 250, pose: 'work', lines: [B('सबसे पहले ठेकुआ! आटा, गुड़ और घी से बनता है, लकड़ी के साँचे में दबाकर।', 'First, thekua! Made of flour, jaggery and ghee, pressed in a wooden mould.'), B('चूल्हे के पास E दबाकर मेरी मदद करो।', 'Press E by the chulha to help me.')] },
    { who: 'golu', x: 1250, lines: [B('ईख (गन्ना) छठ में बहुत ज़रूरी है — घाट पर इसका मंडप बनता है।', 'Sugarcane is essential in Chhath — a canopy of it is made at the ghat.')] },
    { who: 'chachi', x: 2180, lines: [B('हाट में मौसमी फल मिलेंगे — केला, नारियल, डाभ नींबू, संतरा, सेब।', 'The haat has seasonal fruits — banana, coconut, big lemon, orange, apple.')] },
    { who: 'basor', x: 2860, lines: [B('ये सूप और दउरा मैंने बाँस से बुने हैं। छठ हम कारीगरों का भी पर्व है!', 'I wove this soop and daura from bamboo. Chhath is our artisans\' festival too!')] },
    { who: 'kumhar', x: 3240, lines: [B('मिट्टी के दीये लो — प्लास्टिक नहीं, मिट्टी! प्रकृति से प्रकृति तक।', 'Take clay diyas — not plastic, clay! From nature, back to nature.')] }],
    spots: [{ kind: 'thekua', x: 370, mini: 'thekua', label: B('ठेकुआ बनाएँ', 'Make thekua'), give: 'thekua' },
    { kind: 'soop', x: 3460, mini: 'soop', need: w => w.got.thekua > 0 && w.goals[1].n(w) >= 13, needMsg: B('पहले सारी सामग्री इकट्ठा करें', 'Collect all the items first'), label: B('सूप सजाएँ', 'Arrange the soop') }],
    goals: [G.spot('thekua', 1, B('ठेकुआ बनाएँ', 'Make thekua')),
    G.gotAny(['rice', 'sugarcane', 'banana', 'coconut', 'apple', 'orange', 'lemon', 'ginger', 'turmeric', 'soop', 'daura', 'diya', 'flower'], B('प्रसाद सामग्री इकट्ठा करें', 'Collect offerings')),
    G.talk(5), G.spot('soop', 1, B('सूप में प्रसाद सजाएँ', 'Arrange prasad in the soop'))],
    card: {
      title: B('छठ का प्रसाद', 'The Prasad of Chhath'), pic: 'soop',
      facts: [B('ठेकुआ छठ का सबसे खास प्रसाद है — गेहूँ का आटा, गुड़ और घी, साँचे में दबाकर तला जाता है।', 'Thekua is Chhath\'s special prasad — wheat flour, jaggery and ghee, pressed in a mould and fried.'),
      B('सूप और दउरा बाँस से बनते हैं, जिन्हें स्थानीय कारीगर बुनते हैं।', 'The soop and daura are woven from bamboo by local artisans.'),
      B('प्रसाद में मौसमी फल-सब्ज़ियाँ चढ़ती हैं — ईख, केला, नारियल, डाभ नींबू, अदरक और हल्दी के पौधे।', 'Seasonal produce is offered — sugarcane, banana, coconut, big citrus, ginger and turmeric plants.'),
      B('प्रकृति ने जो दिया, वही धन्यवाद के रूप में अर्पित किया जाता है।', 'What nature gives is offered back with gratitude.')]
    }
  },
  { // ---------------- 5 ----------------
    id: 5, day: 3, title: B('पवित्र घाट की सफ़ाई', 'Clean the Sacred Ghat'), sub: B('आँधी ने घाट पर कचरा बिखेर दिया!', 'The storm littered the ghat!'),
    width: 3100, pal: 'noon', ground: 'ghat', track: 5, amb: { river: 1, birds: .6, wind: .4 }, art: 'tree', bgRiver: true,
    scenery: [{ k: 'tree', x: 120, s: 1.1, kind: 'peepal' }, { k: 'temple', x: 420 }, { k: 'pillar', x: 700 }, { k: 'boat', x: 980 }, { k: 'pillar', x: 1300 }, { k: 'tree', x: 1600, s: 1, kind: 'banana' }, { k: 'pillar', x: 1900 }, { k: 'boat', x: 2250 }, { k: 'pillar', x: 2500 }, { k: 'tree', x: 2950, s: 1, kind: 'peepal' }],
    plats: [{ x: 560, y: GY - 40, w: 160, kind: 'step' }, { x: 600, y: GY - 80, w: 80, kind: 'step' }, { x: 1700, y: GY - 40, w: 160, kind: 'step' }, { x: 1740, y: GY - 80, w: 80, kind: 'step' }],
    items: [['plastic', 250], ['bag', 420], ['plastic', 640, GY - 115], ['bag', 860], ['plastic', 1100], ['bag', 1380], ['plastic', 1540], ['bag', 1780, GY - 115], ['plastic', 2050], ['bag', 2350], ['plastic', 2620], ['bag', 2800]],
    npcs: [{ who: 'papa', x: 330, pose: 'work', lines: [B('आँधी ने प्लास्टिक और पॉलीथीन बिखेर दिए! गंगा माँ को साफ़ रखना हमारी पूजा है।', 'The storm scattered plastic everywhere! Keeping Mother Ganga clean is our worship.'), B('सारा कचरा उठाओ, फिर घाट सजाएँगे।', 'Pick up all the waste, then we\'ll decorate.')] },
    { who: 'pandit', x: 1450, lines: [B('छठ प्रकृति का पर्व है — सूर्य, जल और धरती की पूजा।', 'Chhath is nature\'s festival — worship of sun, water and earth.'), B('स्वच्छ नदी ही सच्चा अर्घ्य है।', 'A clean river is the truest offering.')] },
    { who: 'golu', x: 2150, lines: [B('मैंने घाट के लिए दीये रखे हैं — इन्हें जलाओ!', 'I placed diyas for the ghat — light them!')] }],
    spots: [{ kind: 'decor', x: 700 }, { kind: 'decor', x: 1300 }, { kind: 'decor', x: 1900 }, { kind: 'cane', x: 880 }, { kind: 'cane', x: 1620 }, { kind: 'cane', x: 2420 },
    { kind: 'diya', x: 1000 }, { kind: 'diya', x: 1200 }, { kind: 'diya', x: 2000 }, { kind: 'diya', x: 2700 },
    { kind: 'river', x: 2840, mini: 'clean', need: w => (w.got.plastic || 0) + (w.got.bag || 0) >= 12, needMsg: B('पहले घाट का सारा कचरा उठाएँ', 'Pick up all the litter on the ghat first'), label: B('नदी साफ़ करें', 'Clean the river') }],
    goals: [{ t: B('प्लास्टिक कचरा उठाएँ', 'Pick up plastic waste'), of: 12, n: w => (w.got.plastic || 0) + (w.got.bag || 0), find: w => w.findItem('plastic') ?? w.findItem('bag') },
    G.spot('decor', 3, B('फूलों से सजाएँ', 'Restore flower decorations')), G.spot('cane', 3, B('ईख का मंडप लगाएँ', 'Arrange sugarcane')), G.spot('diya', 4, B('दीये जलाएँ', 'Light diyas')), G.spot('river', 1, B('नदी साफ़ करें', 'Clean the river'))],
    card: {
      title: B('स्वच्छ घाट, स्वच्छ नदी', 'Clean Ghat, Clean River'), pic: 'clean',
      facts: [B('छठ को सबसे पर्यावरण-अनुकूल पर्वों में गिना जाता है — इसमें सूर्य, जल और धरती की पूजा होती है।', 'Chhath is counted among the most eco-friendly festivals — it honours sun, water and earth.'),
      B('पर्व से पहले पूरा समुदाय मिलकर घाट और जलाशय साफ़ करता है।', 'Before the festival, the whole community cleans ghats and water bodies together.'),
      B('बाँस, मिट्टी और पत्तों का उपयोग करें — प्लास्टिक और पॉलीथीन से बचें।', 'Use bamboo, clay and leaves — avoid plastic and polythene.'),
      B('नदी में कचरा न डालें; स्वच्छ जल ही जीवन है।', 'Never throw waste in rivers; clean water is life.')]
    }
  },
  { // ---------------- 6 ----------------
    id: 6, day: 3, title: B('संध्या अर्घ्य', 'Sandhya Arghya'), sub: B('डूबते सूर्य को अर्घ्य', 'Offering to the setting sun'),
    width: 3300, pal: 'after', palTo: 'sunset', ground: 'ghat', track: 2, amb: { river: .8, crowd: .6 }, art: 'diyas', bgRiver: true, sunset: true,
    scenery: [{ k: 'house', x: 60, w: 220, h: 130, seed: 2 }, { k: 'tree', x: 450, s: 1, kind: 'mango' }, { k: 'tree', x: 900, s: 1, kind: 'banana' }, { k: 'temple', x: 1250 }, { k: 'tree', x: 1600, s: 1.1, kind: 'peepal' },
    { k: 'pillar', x: 2000 }, { k: 'kosi', x: 2250 }, { k: 'crowd', x: 2400, w: 700 }, { k: 'pillar', x: 2700 }, { k: 'kosi', x: 3050 }],
    plats: [{ x: 1150, y: GY - 40, w: 140, kind: 'step' }, { x: 1900, y: GY - 40, w: 160, kind: 'step' }],
    items: [['flower', 700], ['flower', 1210, GY - 70], ['flower', 1800]],
    npcs: [{ who: 'vrati', x: 330, esc: true, target: 2850, lines: [B('बेटा, घाट तक मेरे साथ चलोगे? सूरज ढलने से पहले पहुँचना है।', 'Beta, will you walk with me to the ghat? We must reach before sunset.')], escLines: [B('चलो, सूर्य देव प्रतीक्षा कर रहे हैं।', 'Come, Surya Dev awaits.')] },
    { who: 'papa', x: 1450, lines: [B('दउरा सिर पर सम्मान से उठाते हैं — इसमें पूरे परिवार की श्रद्धा है।', 'We carry the daura on our heads with respect — it holds the whole family\'s devotion.')] },
    { who: 'dadi', x: 2550, pose: 'pray', lines: [B('देखो, महिलाएँ छठ गीत गा रही हैं। डूबते सूर्य को भी हम धन्यवाद देते हैं।', 'Listen, the women are singing Chhath geet. We thank even the setting sun.'), B('जो डूबता है, वही फिर उगता है — यही जीवन है।', 'What sets will rise again — that is life.')] }],
    spots: [{ kind: 'daura', x: 200, mini: 'daura', label: B('दउरा सजाएँ', 'Decorate the daura') },
    { kind: 'pickup', x: 260, need: w => w.spotDone('daura') > 0, needMsg: B('पहले दउरा सजाएँ', 'Decorate the daura first'), label: B('दउरा उठाएँ', 'Lift the daura') },
    { kind: 'place', x: 2900, need: w => w.carry === 'daura', needMsg: B('दउरा लेकर आएँ', 'Bring the daura'), label: B('घाट पर दउरा रखें', 'Place daura at the ghat') }],
    goals: [G.spot('daura', 1, B('दउरा सजाएँ', 'Decorate the daura')), G.esc('vrati', B('व्रती माँ को घाट तक ले जाएँ', 'Walk the vrati to the ghat')), G.spot('place', 1, B('दउरा घाट तक ले जाएँ', 'Carry the daura to the ghat')), G.talk(3)],
    cine: 'sunset',
    card: {
      title: B('संध्या अर्घ्य — तीसरा दिन', 'Sandhya Arghya — Day 3'), pic: 'sunset',
      facts: [B('तीसरे दिन शाम को परिवार दउरा सिर पर लेकर घाट जाते हैं।', 'On the third evening, families carry the daura on their heads to the ghat.'),
      B('व्रती जल में खड़े होकर सूप से डूबते सूर्य को जल और दूध का अर्घ्य देते हैं।', 'Standing in water, vratis offer water and milk from the soop to the setting sun.'),
      B('डूबते सूर्य की पूजा बहुत कम पर्वों में होती है — यह बीते दिन के लिए कृतज्ञता है।', 'Few festivals worship the setting sun — it is gratitude for the day that passed.'),
      B('रात को कई घरों में "कोसी भरना" होता है — ईख का मंडप और दीये।', 'At night many families do "Kosi bharna" — a canopy of sugarcane with diyas.')]
    }
  },
  { // ---------------- 7 ----------------
    id: 7, day: 4, title: B('उषा अर्घ्य', 'Usha Arghya'), sub: B('उगते सूर्य को प्रणाम', 'Salutations to the rising sun'),
    width: 3000, pal: 'predawn', ground: 'ghat', track: 3, amb: { river: .9, wind: .3, crowd: .2 }, art: 'chariot', bgRiver: true, dark: true,
    scenery: [{ k: 'house', x: 60, w: 200, h: 125, seed: 5 }, { k: 'tree', x: 400, s: 1, kind: 'peepal' }, { k: 'house', x: 650, w: 170, h: 115, seed: 6 }, { k: 'tree', x: 1100, s: 1, kind: 'banana' }, { k: 'temple', x: 1500 },
    { k: 'kosi', x: 1900 }, { k: 'pillar', x: 2150 }, { k: 'crowd', x: 2250, w: 600 }, { k: 'pillar', x: 2700 }],
    plats: [{ x: 900, y: GY - 44, w: 120, kind: 'charpai' }, { x: 1650, y: GY - 40, w: 160, kind: 'step' }, { x: 1690, y: GY - 80, w: 80, kind: 'step' }],
    items: [['diya', 300], ['diya', 520], ['diya', 760], ['diya', 960, GY - 80], ['diya', 1200], ['diya', 1420], ['diya', 1730, GY - 115], ['diya', 1980], ['diya', 2200], ['diya', 2450]],
    npcs: [{ who: 'dadi', x: 220, esc: true, target: 2700, lines: [B('भोर होने वाली है। अँधेरे में दीयों की रोशनी का पीछा करो — मैं तुम्हारे साथ चलूँगी।', 'Dawn is near. Follow the glowing diyas in the dark — I\'ll walk with you.')], escLines: [B('धीरे-धीरे, बेटा। सूर्य देव आने वाले हैं।', 'Slowly, beta. Surya Dev is coming.')] },
    { who: 'chacha', x: 1300, lines: [B('पूरा गाँव भोर से पहले घाट पर इकट्ठा होता है।', 'The whole village gathers at the ghat before dawn.')] },
    { who: 'maa', x: 2550, pose: 'pray', lines: [B('उगते सूर्य को अर्घ्य देकर व्रत का पारण होगा। घाट पर दीये जलाओ!', 'After the arghya to the rising sun, the fast is completed. Light the diyas at the ghat!')] }],
    spots: [{ kind: 'light', x: 2800, mini: 'light', need: w => w.escDone.dadi, needMsg: B('पहले दादी को घाट तक लाएँ', 'Bring Dadi to the ghat first'), label: B('घाट के दीये जलाएँ', 'Light the ghat diyas') }],
    goals: [G.got('diya', 10, B('दीयों का पीछा करें', 'Follow the glowing diyas')), G.esc('dadi', B('दादी को घाट तक ले जाएँ', 'Walk Dadi to the ghat')), G.talk(3), G.spot('light', 1, B('दीये जलाएँ', 'Light the diyas'))],
    cine: 'sunrise',
    card: {
      title: B('उषा अर्घ्य — चौथा दिन', 'Usha Arghya — Day 4'), pic: 'chariot',
      facts: [B('चौथे दिन भोर से पहले परिवार फिर घाट पर पहुँचते हैं।', 'On the fourth day, families return to the ghat before dawn.'),
      B('उगते सूर्य को अर्घ्य दिया जाता है — नई आशा और नई शुरुआत का प्रतीक।', 'Arghya is offered to the rising sun — a symbol of hope and new beginnings.'),
      B('इसके बाद व्रती "पारण" करते हैं — प्रसाद ग्रहण कर व्रत तोड़ते हैं।', 'Then the vrati performs "parana" — breaking the fast with prasad.'),
      B('पुराणों में सूर्य देव सात घोड़ों के रथ पर चलते हैं; उनके सारथी अरुण हैं।', 'In the Puranas, Surya Dev rides a chariot of seven horses, driven by Aruna.')]
    }
  },
  { // ---------------- 8 ----------------
    id: 8, day: 5, title: B('भव्य छठ महापर्व', 'The Grand Chhath Mahaparv'), sub: B('पूरा गाँव उत्सव में!', 'The whole village celebrates!'),
    width: 3000, pal: 'dawn', ground: 'village', track: 4, amb: { crowd: 1, birds: 1, river: .3 }, art: 'grand', bgRiver: true, festive: true,
    scenery: [{ k: 'house', x: 60, w: 200, h: 125, seed: 1 }, { k: 'kosi', x: 380 }, { k: 'tree', x: 560, s: 1, kind: 'mango' }, { k: 'stage', x: 800, w: 420 }, { k: 'house', x: 1330, w: 180, h: 120, seed: 4 },
    { k: 'tree', x: 1650, s: 1, kind: 'banana' }, { k: 'kosi', x: 1800 }, { k: 'house', x: 2000, w: 200, h: 125, seed: 3 }, { k: 'tree', x: 2350, s: 1.1, kind: 'peepal' }, { k: 'kosi', x: 2600 }, { k: 'house', x: 2700, w: 180, h: 120, seed: 6 }],
    plats: [{ x: 820, y: GY - 50, w: 380, kind: 'stage' }, { x: 1550, y: GY - 44, w: 110, kind: 'charpai' }],
    items: [['memory', 240], ['memory', 700], ['memory', 1000, GY - 90], ['memory', 1450], ['memory', 1600, GY - 80], ['memory', 1900], ['memory', 2250], ['memory', 2850]],
    npcs: [{ who: 'dancer1', x: 900, pose: 'dance', lines: [B('झिझिया और जट-जटिन मिथिला के लोकनृत्य हैं — आओ, साथ नाचो!', 'Jhijhiya and Jat-Jatin are Mithila folk dances — come, dance with us!')] },
    { who: 'dholak', x: 1010, pose: 'work', lines: [B('ढोलक, मंजीरा और बाँसुरी — यही हमारे गाँव का संगीत है!', 'Dholak, manjira and bansuri — this is our village\'s music!')] },
    { who: 'dancer2', x: 1120, pose: 'dance', lines: [B('आज पूरा गाँव एक परिवार है।', 'Today the whole village is one family.')] },
    { who: 'maa', x: 1300, lines: [B('व्रत पूरा हुआ! अब प्रसाद सबमें बाँटना है — चलो फल और प्रसाद की जोड़ी मिलाओ।', 'The fast is complete! Now we share prasad with everyone — match the offerings!')] },
    { who: 'papa', x: 2100, pose: 'wave', lines: [B('तुमने इस छठ में बहुत सेवा की। सूर्य देव सबको आशीर्वाद दें!', 'You served so well this Chhath. May Surya Dev bless everyone!')] },
    { who: 'dadi', x: 2480, lines: [B('मेरे पास एक मधुबनी चित्र है जो आँधी में बिखर गया — इसे जोड़ दोगे?', 'I have a Madhubani painting the storm broke apart — will you piece it together?')] }],
    spots: [{ kind: 'match', x: 1370, mini: 'match', label: B('प्रसाद बाँटें', 'Share the prasad') }, { kind: 'puzzle', x: 2530, mini: 'madhubani', need: w => w.talked.has('dadi'), needMsg: B('पहले दादी से बात करें', 'Talk to Dadi first'), label: B('मधुबनी पहेली', 'Madhubani puzzle') }],
    goals: [G.got('memory', 8, B('उत्सव की स्मृतियाँ इकट्ठा करें', 'Collect festival memories')), G.talk(6), G.spot('match', 1, B('प्रसाद बाँटें', 'Share the prasad')), G.spot('puzzle', 1, B('मधुबनी चित्र जोड़ें', 'Restore the Madhubani art'))],
    cine: 'finale',
    card: {
      title: B('छठ की सीख', 'The Lessons of Chhath'), pic: 'grand',
      facts: [B('छठ प्रकृति के प्रति कृतज्ञता, अनुशासन, शुद्धता और समानता सिखाता है।', 'Chhath teaches gratitude to nature, discipline, purity and equality.'),
      B('घाट पर अमीर-गरीब सब एक साथ खड़े होकर एक ही सूर्य को अर्घ्य देते हैं।', 'At the ghat, rich and poor stand side by side, offering to the same sun.'),
      B('प्रसाद पड़ोसियों और अजनबियों सबमें बाँटा जाता है।', 'Prasad is shared with neighbours and strangers alike.'),
      B('आज छठ दिल्ली, मुंबई से लेकर मॉरीशस, फ़िजी और अमेरिका तक मनाया जाता है। चैत्र मास में "चैती छठ" भी होता है।', 'Today Chhath is celebrated from Delhi and Mumbai to Mauritius, Fiji and the USA. There is also "Chaiti Chhath" in spring.')]
    }
  }
];

const BOOK = [
  { t: B('चार दिनों का कैलेंडर', 'The Four-Day Calendar'), cal: true },
  { t: B('छठी मइया कौन हैं?', 'Who is Chhathi Maiya?'), p: [B('छठी मइया को सूर्य देव की बहन माना जाता है। वे संतान की रक्षा करने वाली और परिवार को सुख देने वाली देवी हैं।', 'Chhathi Maiya is regarded as the sister of Surya Dev, a mother goddess who protects children and blesses families.'), B('संध्या अर्घ्य सूर्य की पत्नी प्रत्यूषा और उषा अर्घ्य उषा को भी समर्पित माना जाता है — दिन की अंतिम और पहली किरण।', 'The evening arghya is also linked with Pratyusha and the morning arghya with Usha — the last and first rays of the day.')] },
  { t: B('व्रती और निर्जला व्रत', 'The Vrati and the Nirjala Fast'), p: [B('व्रत रखने वाले को "व्रती" कहते हैं — ज़्यादातर महिलाएँ, पर पुरुष भी व्रत रखते हैं।', 'One who keeps the fast is a "vrati" — mostly women, though men observe it too.'), B('खरना के बाद लगभग 36 घंटे बिना अन्न-जल के व्रत रहता है। बच्चे व्रत नहीं रखते — वे सेवा करते हैं!', 'After Kharna, the fast lasts about 36 hours without food or water. Children don\'t fast — they serve and help!')] },
  { t: B('छठ गीत', 'Chhath Geet'), p: [B('छठ के लोकगीत भोजपुरी, मैथिली और मगही में पीढ़ियों से गाए जाते हैं।', 'Chhath folk songs have been sung for generations in Bhojpuri, Maithili and Magahi.'), B('शारदा सिन्हा जैसी लोकगायिकाओं ने इन्हें घर-घर पहुँचाया। इस खेल का संगीत मूल वाद्य रचनाएँ हैं, जो इन्हीं धुनों से प्रेरित हैं।', 'Folk singers like Sharda Sinha carried them into every home. This game\'s music is original instrumental composition inspired by that tradition.')] },
  { t: B('मधुबनी कला', 'Madhubani Art'), p: [B('मधुबनी (मिथिला) चित्रकला बिहार की प्रसिद्ध लोककला है — दोहरी रेखाएँ, चटक रंग और प्रकृति के चिह्न।', 'Madhubani (Mithila) painting is Bihar\'s famous folk art — double outlines, bright colours and nature motifs.'), B('मछली (समृद्धि), मोर (प्रेम), सूर्य (जीवन), कमल (पवित्रता) इसके प्रिय चिह्न हैं।', 'Fish (prosperity), peacock (love), sun (life) and lotus (purity) are favourite motifs.')] },
  { t: B('समानता का पर्व', 'A Festival of Equality'), p: [B('छठ में पुजारी की आवश्यकता नहीं; हर व्रती स्वयं पूजा करता है।', 'Chhath needs no priest; each vrati performs the worship directly.'), B('बाँस के कारीगर, कुम्हार, किसान — सबका योगदान इस पर्व को पूरा करता है।', 'Bamboo weavers, potters, farmers — everyone\'s contribution completes the festival.')] }
];
