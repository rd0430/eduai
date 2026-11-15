import React, { useState } from 'react';
import { Calculator, LineChart, Atom, RotateCcw, Search, Info } from 'lucide-react';

const ELEMENTS_RAW = [
  [1, 'H', 'Vodorod', '1.008', 1, 1, 'nonmetal'],
  [2, 'He', 'Geliy', '4.0026', 1, 18, 'noble'],
  [3, 'Li', 'Litiy', '6.94', 2, 1, 'alkali'],
  [4, 'Be', 'Berilliy', '9.0122', 2, 2, 'alkaline'],
  [5, 'B', 'Bor', '10.81', 2, 13, 'metalloid'],
  [6, 'C', 'Uglerod', '12.011', 2, 14, 'nonmetal'],
  [7, 'N', 'Azot', '14.007', 2, 15, 'nonmetal'],
  [8, 'O', 'Kislorod', '15.999', 2, 16, 'nonmetal'],
  [9, 'F', 'Ftor', '18.998', 2, 17, 'halogen'],
  [10, 'Ne', 'Neon', '20.180', 2, 18, 'noble'],
  [11, 'Na', 'Natriy', '22.990', 3, 1, 'alkali'],
  [12, 'Mg', 'Magniy', '24.305', 3, 2, 'alkaline'],
  [13, 'Al', 'Alyuminiy', '26.982', 3, 13, 'post-transition'],
  [14, 'Si', 'Kremniy', '28.085', 3, 14, 'metalloid'],
  [15, 'P', 'Fosfor', '30.974', 3, 15, 'nonmetal'],
  [16, 'S', 'Oltingugurt', '32.06', 3, 16, 'nonmetal'],
  [17, 'Cl', 'Xlor', '35.45', 3, 17, 'halogen'],
  [18, 'Ar', 'Argon', '39.948', 3, 18, 'noble'],
  [19, 'K', 'Kaliy', '39.098', 4, 1, 'alkali'],
  [20, 'Ca', 'Kalsiy', '40.078', 4, 2, 'alkaline'],
  [21, 'Sc', 'Skandiy', '44.956', 4, 3, 'transition'],
  [22, 'Ti', 'Titan', '47.867', 4, 4, 'transition'],
  [23, 'V', 'Vanadiy', '50.942', 4, 5, 'transition'],
  [24, 'Cr', 'Xrom', '51.996', 4, 6, 'transition'],
  [25, 'Mn', 'Marganets', '54.938', 4, 7, 'transition'],
  [26, 'Fe', 'Temir', '55.845', 4, 8, 'transition'],
  [27, 'Co', 'Kobalt', '58.933', 4, 9, 'transition'],
  [28, 'Ni', 'Nikel', '58.693', 4, 10, 'transition'],
  [29, 'Cu', 'Mis', '63.546', 4, 11, 'transition'],
  [30, 'Zn', 'Rux', '65.38', 4, 12, 'transition'],
  [31, 'Ga', 'Galliy', '69.723', 4, 13, 'post-transition'],
  [32, 'Ge', 'Germaniy', '72.630', 4, 14, 'metalloid'],
  [33, 'As', 'Mishyak', '74.922', 4, 15, 'metalloid'],
  [34, 'Se', 'Selen', '78.971', 4, 16, 'nonmetal'],
  [35, 'Br', 'Brom', '79.904', 4, 17, 'halogen'],
  [36, 'Kr', 'Kripton', '83.798', 4, 18, 'noble'],
  [37, 'Rb', 'Rubidiy', '85.468', 5, 1, 'alkali'],
  [38, 'Sr', 'Stronsiy', '87.62', 5, 2, 'alkaline'],
  [39, 'Y', 'Ittriy', '88.906', 5, 3, 'transition'],
  [40, 'Zr', 'Sirkoniy', '91.224', 5, 4, 'transition'],
  [41, 'Nb', 'Niobiy', '92.906', 5, 5, 'transition'],
  [42, 'Mo', 'Molibden', '95.95', 5, 6, 'transition'],
  [43, 'Tc', 'Texnetsiy', '(98)', 5, 7, 'transition'],
  [44, 'Ru', 'Ruteniy', '101.07', 5, 8, 'transition'],
  [45, 'Rh', 'Rodiy', '102.91', 5, 9, 'transition'],
  [46, 'Pd', 'Palladiy', '106.42', 5, 10, 'transition'],
  [47, 'Ag', 'Kumush', '107.87', 5, 11, 'transition'],
  [48, 'Cd', 'Kadmiy', '112.41', 5, 12, 'transition'],
  [49, 'In', 'Indiy', '114.82', 5, 13, 'post-transition'],
  [50, 'Sn', 'Qalay', '118.71', 5, 14, 'post-transition'],
  [51, 'Sb', 'Surma', '121.76', 5, 15, 'metalloid'],
  [52, 'Te', 'Tellur', '127.60', 5, 16, 'metalloid'],
  [53, 'I', 'Yod', '126.90', 5, 17, 'halogen'],
  [54, 'Xe', 'Ksenon', '131.29', 5, 18, 'noble'],
  [55, 'Cs', 'Seziy', '132.91', 6, 1, 'alkali'],
  [56, 'Ba', 'Bariy', '137.33', 6, 2, 'alkaline'],
  [57, 'La', 'Lantan', '138.91', 8, 3, 'lanthanide'],
  [58, 'Ce', 'Seriy', '140.12', 8, 4, 'lanthanide'],
  [59, 'Pr', 'Prazeodim', '140.91', 8, 5, 'lanthanide'],
  [60, 'Nd', 'Neodim', '144.24', 8, 6, 'lanthanide'],
  [61, 'Pm', 'Prometiy', '(145)', 8, 7, 'lanthanide'],
  [62, 'Sm', 'Samariy', '150.36', 8, 8, 'lanthanide'],
  [63, 'Eu', 'Yevropiy', '151.96', 8, 9, 'lanthanide'],
  [64, 'Gd', 'Gadoliniy', '157.25', 8, 10, 'lanthanide'],
  [65, 'Tb', 'Terbiy', '158.93', 8, 11, 'lanthanide'],
  [66, 'Dy', 'Disproziy', '162.50', 8, 12, 'lanthanide'],
  [67, 'Ho', 'Golmiy', '164.93', 8, 13, 'lanthanide'],
  [68, 'Er', 'Erbiy', '167.26', 8, 14, 'lanthanide'],
  [69, 'Tm', 'Tuliy', '168.93', 8, 15, 'lanthanide'],
  [70, 'Yb', 'Itterbiy', '173.05', 8, 16, 'lanthanide'],
  [71, 'Lu', 'Lyutetsiy', '174.97', 8, 17, 'lanthanide'],
  [72, 'Hf', 'Gafniy', '178.49', 6, 4, 'transition'],
  [73, 'Ta', 'Tantal', '180.95', 6, 5, 'transition'],
  [74, 'W', 'Volfram', '183.84', 6, 6, 'transition'],
  [75, 'Re', 'Reniy', '186.21', 6, 7, 'transition'],
  [76, 'Os', 'Osmiy', '190.23', 6, 8, 'transition'],
  [77, 'Ir', 'Iridiy', '192.22', 6, 9, 'transition'],
  [78, 'Pt', 'Platina', '195.08', 6, 10, 'transition'],
  [79, 'Au', 'Oltin', '196.97', 6, 11, 'transition'],
  [80, 'Hg', 'Simob', '200.59', 6, 12, 'transition'],
  [81, 'Tl', 'Talliy', '204.38', 6, 13, 'post-transition'],
  [82, 'Pb', 'Qo‘rg‘oshin', '207.2', 6, 14, 'post-transition'],
  [83, 'Bi', 'Vismut', '208.98', 6, 15, 'post-transition'],
  [84, 'Po', 'Poloniy', '(209)', 6, 16, 'metalloid'],
  [85, 'At', 'Astat', '(210)', 6, 17, 'halogen'],
  [86, 'Rn', 'Radon', '(222)', 6, 18, 'noble'],
  [87, 'Fr', 'Fransiy', '(223)', 7, 1, 'alkali'],
  [88, 'Ra', 'Radiy', '(226)', 7, 2, 'alkaline'],
  [89, 'Ac', 'Aktiniy', '(227)', 9, 3, 'actinide'],
  [90, 'Th', 'Toriy', '232.04', 9, 4, 'actinide'],
  [91, 'Pa', 'Protaktiniy', '231.04', 9, 5, 'actinide'],
  [92, 'U', 'Uran', '238.03', 9, 6, 'actinide'],
  [93, 'Np', 'Neptuniy', '(237)', 9, 7, 'actinide'],
  [94, 'Pu', 'Plutoniy', '(244)', 9, 8, 'actinide'],
  [95, 'Am', 'Ameritsiy', '(243)', 9, 9, 'actinide'],
  [96, 'Cm', 'Kyuriy', '(247)', 9, 10, 'actinide'],
  [97, 'Bk', 'Berkliy', '(247)', 9, 11, 'actinide'],
  [98, 'Cf', 'Kaliforniy', '(251)', 9, 12, 'actinide'],
  [99, 'Es', 'Eynshteyniy', '(252)', 9, 13, 'actinide'],
  [100, 'Fm', 'Fermiy', '(257)', 9, 14, 'actinide'],
  [101, 'Md', 'Mendeleyev', '(258)', 9, 15, 'actinide'],
  [102, 'No', 'Nobeliy', '(259)', 9, 16, 'actinide'],
  [103, 'Lr', 'Lourensiy', '(266)', 9, 17, 'actinide'],
  [104, 'Rf', 'Rezerfordiy', '(267)', 7, 4, 'transition'],
  [105, 'Db', 'Dubniy', '(268)', 7, 5, 'transition'],
  [106, 'Sg', 'Siborgiy', '(269)', 7, 6, 'transition'],
  [107, 'Bh', 'Boriy', '(270)', 7, 7, 'transition'],
  [108, 'Hs', 'Xassiy', '(277)', 7, 8, 'transition'],
  [109, 'Mt', 'Meytneriy', '(278)', 7, 9, 'transition'],
  [110, 'Ds', 'Darmshtadtiy', '(281)', 7, 10, 'transition'],
  [111, 'Rg', 'Rentgeniy', '(282)', 7, 11, 'transition'],
  [112, 'Cn', 'Kopernitsiy', '(285)', 7, 12, 'transition'],
  [113, 'Nh', 'Nixoniy', '(286)', 7, 13, 'post-transition'],
  [114, 'Fl', 'Fleroviy', '(289)', 7, 14, 'post-transition'],
  [115, 'Mc', 'Moskoviy', '(290)', 7, 15, 'post-transition'],
  [116, 'Lv', 'Livermoriy', '(293)', 7, 16, 'post-transition'],
  [117, 'Ts', 'Tennessin', '(294)', 7, 17, 'halogen'],
  [118, 'Og', 'Oganeson', '(294)', 7, 18, 'noble'],
];

const CATEGORY_STYLES = {
  alkali: { bg: 'bg-red-100 border-red-300 text-red-900', label: 'Ishqoriy metallar' },
  alkaline: { bg: 'bg-orange-100 border-orange-300 text-orange-900', label: 'Ishqoriy-yer metallar' },
  transition: { bg: 'bg-amber-100 border-amber-300 text-amber-900', label: 'Oraliq metallar' },
  'post-transition': { bg: 'bg-emerald-100 border-emerald-300 text-emerald-900', label: 'Post-oraliq metallar' },
  metalloid: { bg: 'bg-teal-100 border-teal-300 text-teal-900', label: 'Metalloidlar (Yarim metallar)' },
  nonmetal: { bg: 'bg-sky-100 border-sky-300 text-sky-900', label: 'Metallmaslar' },
  halogen: { bg: 'bg-indigo-100 border-indigo-300 text-indigo-900', label: 'Galogenlar' },
  noble: { bg: 'bg-purple-100 border-purple-300 text-purple-900', label: 'Inert gazlar' },
  lanthanide: { bg: 'bg-pink-100 border-pink-300 text-pink-900', label: 'Lantanoidlar' },
  actinide: { bg: 'bg-rose-100 border-rose-300 text-rose-900', label: 'Aktinoidlar' },
};

function StandardCalculator() {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');
  const [history, setHistory] = useState([]);

  const handlePress = (val) => setExpr(prev => prev + val);
  const handleClear = () => { setExpr(''); setResult('0'); };
  const handleBackspace = () => setExpr(prev => prev.slice(0, -1));

  const handleCalculate = () => {
    if (!expr.trim()) return;
    try {
      const sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/π/g, 'Math.PI')
        .replace(/√\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin((Math.PI/180)*')
        .replace(/cos\(/g, 'Math.cos((Math.PI/180)*')
        .replace(/tan\(/g, 'Math.tan((Math.PI/180)*')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/\^/g, '**');

      const evalResult = Function(`"use strict"; return (${sanitized})`)();
      const formatted = Number.isFinite(evalResult)
        ? String(Math.round(evalResult * 1e10) / 1e10)
        : 'Xato';

      setResult(formatted);
      setHistory(prev => [`${expr} = ${formatted}`, ...prev.slice(0, 5)]);
    } catch {
      setResult('Sintaksis xato');
    }
  };

  const sciButtons = [
    { label: 'sin', val: 'sin(' },
    { label: 'cos', val: 'cos(' },
    { label: 'tan', val: 'tan(' },
    { label: 'log', val: 'log(' },
    { label: '√', val: '√(' },
    { label: '^', val: '^' },
    { label: 'π', val: 'π' },
    { label: '(', val: '(' },
    { label: ')', val: ')' },
    { label: '%', val: '/100' },
  ];

  const mainButtons = [
    { label: 'C', action: handleClear, style: 'bg-red-50 text-red-600 hover:bg-red-100' },
    { label: '⌫', action: handleBackspace, style: 'bg-slate-100 text-slate-700 hover:bg-slate-200' },
    { label: '÷', action: () => handlePress('÷'), style: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: '×', action: () => handlePress('×'), style: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: '7', action: () => handlePress('7') },
    { label: '8', action: () => handlePress('8') },
    { label: '9', action: () => handlePress('9') },
    { label: '-', action: () => handlePress('-'), style: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: '4', action: () => handlePress('4') },
    { label: '5', action: () => handlePress('5') },
    { label: '6', action: () => handlePress('6') },
    { label: '+', action: () => handlePress('+'), style: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
    { label: '1', action: () => handlePress('1') },
    { label: '2', action: () => handlePress('2') },
    { label: '3', action: () => handlePress('3') },
    { label: '=', action: handleCalculate, style: 'row-span-2 bg-blue-600 text-white hover:bg-blue-700' },
    { label: '0', action: () => handlePress('0'), style: 'col-span-2' },
    { label: '.', action: () => handlePress('.') },
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl text-right space-y-1">
          <div className="text-xs sm:text-sm text-slate-400 font-mono min-h-[20px] break-all">
            {expr || '0'}
          </div>
          <div className="text-2xl sm:text-4xl font-bold font-mono tracking-tight truncate">
            {result}
          </div>
        </div>

        <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
          {sciButtons.map((b, i) => (
            <button
              key={i}
              onClick={() => handlePress(b.val)}
              className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-semibold transition"
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {mainButtons.map((btn, idx) => (
            <button
              key={idx}
              onClick={btn.action}
              className={`py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold transition active:scale-95 ${
                btn.style || 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200/70'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">Hisoblash tarixi</h3>
          {history.length > 0 && (
            <button onClick={() => setHistory([])} className="text-xs text-red-500 hover:underline flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Tozalash
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-xs text-slate-400">Hozircha amallar bajarilmadi.</p>
        ) : (
          <div className="space-y-2">
            {history.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setExpr(item.split('=')[0].trim())}
                className="p-2.5 bg-slate-50 hover:bg-blue-50 rounded-xl text-xs font-mono text-slate-700 cursor-pointer transition"
              >
                {item}
              </div>
            ))}
          </div>
        )}
        <p className="text-[11px] text-slate-400 pt-2">
          * Trigonometrik funksiyalar (sin, cos, tan) gradus o‘lchovida hisoblanadi.
        </p>
      </div>
    </div>
  );
}

function DesmosCalculator() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <LineChart className="w-4 h-4 text-blue-600" />
          <span>Desmos Grafik Kalkulyator</span>
        </div>
        <span className="text-xs text-slate-500">
          Masalan: <code className="bg-white px-1.5 py-0.5 rounded border">y = x^2 - 4</code> yoki <code className="bg-white px-1.5 py-0.5 rounded border">y = sin(x)</code>
        </span>
      </div>
      <div className="w-full h-[500px] sm:h-[620px]">
        <iframe
          src="https://www.desmos.com/calculator?lang=uz"
          title="Desmos Graphing Calculator"
          className="w-full h-full border-0"
          allowFullScreen
        />
      </div>
    </div>
  );
}

function PeriodicTable() {
  const [selectedEl, setSelectedEl] = useState(ELEMENTS_RAW[0]);
  const [searchQuery, setSearchQuery] = useState('');

  const matchedIds = new Set(
    ELEMENTS_RAW.filter(el => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        el[1].toLowerCase().includes(q) ||
        el[2].toLowerCase().includes(q) ||
        String(el[0]) === q
      );
    }).map(el => el[0])
  );

  const selectedCategory = CATEGORY_STYLES[selectedEl[6]] || { bg: 'bg-slate-100', label: selectedEl[6] };

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Element qidirish</label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Nomi, belgisi (Fe) yoki raqami (26)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {Object.entries(CATEGORY_STYLES).slice(0, 6).map(([key, val]) => (
              <span key={key} className={`text-[10px] px-2 py-0.5 rounded-md border font-medium ${val.bg}`}>
                {val.label}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center gap-4 sm:gap-6">
          <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${selectedCategory.bg}`}>
            <span className="text-xs font-bold">{selectedEl[0]}</span>
            <span className="text-2xl sm:text-3xl font-extrabold leading-tight">{selectedEl[1]}</span>
            <span className="text-[10px] font-mono">{selectedEl[3]}</span>
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-2xl font-bold text-slate-800">{selectedEl[2]}</h3>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${selectedCategory.bg}`}>
                {selectedCategory.label}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              <b>Tartib raqami (Z):</b> {selectedEl[0]} &nbsp;|&nbsp; <b>Nisbiy atom massasi (Ar):</b> {selectedEl[3]}
            </p>
            <p className="text-xs sm:text-sm text-slate-600">
              <b>Davr:</b> {selectedEl[4] > 7 ? (selectedEl[4] === 8 ? '6 (Lantanoid)' : '7 (Aktinoid)') : selectedEl[4]} &nbsp;|&nbsp; <b>Guruh (ustun):</b> {selectedEl[5]}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-blue-600" /> Batafsil ma’lumot uchun element ustiga bosing
          </span>
          <span className="text-[11px] text-slate-400 lg:hidden">← Jadvalni chapga suring →</span>
        </div>

        <div
          className="grid gap-1 min-w-[920px]"
          style={{
            gridTemplateColumns: 'repeat(18, minmax(46px, 1fr))',
            gridTemplateRows: 'repeat(9, minmax(52px, auto))'
          }}
        >
          {ELEMENTS_RAW.map(el => {
            const [num, sym, name, mass, row, col, cat] = el;
            const style = CATEGORY_STYLES[cat]?.bg || 'bg-slate-100 border-slate-300';
            const isSelected = selectedEl[0] === num;
            const isDimmed = searchQuery.trim() !== '' && !matchedIds.has(num);

            return (
              <button
                key={num}
                onClick={() => setSelectedEl(el)}
                style={{ gridRow: row, gridColumn: col }}
                className={`p-1 rounded-lg border text-left flex flex-col justify-between transition ${style} ${
                  isSelected ? 'ring-2 ring-blue-600 scale-105 z-10 shadow-md' : 'hover:scale-105'
                } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
              >
                <span className="text-[9px] font-bold leading-none">{num}</span>
                <span className="text-sm font-extrabold leading-none text-center">{sym}</span>
                <span className="text-[8px] truncate leading-none text-center opacity-80">{name}</span>
              </button>
            );
          })}

          <div style={{ gridRow: 6, gridColumn: 3 }} className="p-1 rounded-lg border border-dashed border-pink-300 bg-pink-50/50 text-pink-700 flex flex-col items-center justify-center text-[9px] font-bold">
            <span>57-71</span>
            <span>La-Lu</span>
          </div>
          <div style={{ gridRow: 7, gridColumn: 3 }} className="p-1 rounded-lg border border-dashed border-rose-300 bg-rose-50/50 text-rose-700 flex flex-col items-center justify-center text-[9px] font-bold">
            <span>89-103</span>
            <span>Ac-Lr</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudyTools() {
  const [toolTab, setToolTab] = useState('calc');

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">O‘quv Jihozlari (Tools)</h2>
          <p className="text-xs text-slate-500">Hisoblash, grafik chizish va kimyoviy elementlar jadvali</p>
        </div>

        <div className="grid grid-cols-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setToolTab('calc')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              toolTab === 'calc' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Calculator className="w-4 h-4 shrink-0" /> <span>Kalkulyator</span>
          </button>
          <button
            onClick={() => setToolTab('desmos')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              toolTab === 'desmos' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LineChart className="w-4 h-4 shrink-0" /> <span>Desmos</span>
          </button>
          <button
            onClick={() => setToolTab('periodic')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              toolTab === 'periodic' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Atom className="w-4 h-4 shrink-0" /> <span>Kimyo jadval</span>
          </button>
        </div>
      </div>

      {toolTab === 'calc' && <StandardCalculator />}
      {toolTab === 'desmos' && <DesmosCalculator />}
      {toolTab === 'periodic' && <PeriodicTable />}
    </div>
  );
}