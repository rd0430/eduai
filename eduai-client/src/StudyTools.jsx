import React, { useState } from 'react';
import {
  Calculator, LineChart, Atom, RotateCcw, Search,
  ChevronLeft, ChevronRight, FlaskConical, Sparkles
} from 'lucide-react';

// =========================================================================
// 1. QISQA SHAKLDAGI DAVRIY JADVAL MA'LUMOTLARI (Rasm 1 asosida: s, p, d, f)
// Format: [raqam, belgi, nomi, massa, qator(1-10), ustun(1-10), blok('s'|'p'|'d'|'f'), davr, guruh, konfig]
// Ustunlar: 1:I, 2:II, 3:III, 4:IV, 5:V, 6:VI, 7:VII, 8:VIII(1), 9:VIII(2), 10:VIII(3)
// =========================================================================
const SHORT_TABLE_ELEMENTS = [
  // 1-davr (1-qator)
  [1, 'H', 'Vodorod', '1.008', 1, 1, 's', '1', 'I A (VII A)', '1s¹'],
  [2, 'He', 'Geliy', '4.0026', 1, 10, 's', '1', 'VIII A', '1s²'],

  // 2-davr (2-qator)
  [3, 'Li', 'Litiy', '6.94', 2, 1, 's', '2', 'I A', '[He] 2s¹'],
  [4, 'Be', 'Berilliy', '9.0122', 2, 2, 's', '2', 'II A', '[He] 2s²'],
  [5, 'B', 'Bor', '10.81', 2, 3, 'p', '2', 'III A', '[He] 2s² 2p¹'],
  [6, 'C', 'Uglerod', '12.011', 2, 4, 'p', '2', 'IV A', '[He] 2s² 2p²'],
  [7, 'N', 'Azot', '14.007', 2, 5, 'p', '2', 'V A', '[He] 2s² 2p³'],
  [8, 'O', 'Kislorod', '15.999', 2, 6, 'p', '2', 'VI A', '[He] 2s² 2p⁴'],
  [9, 'F', 'Ftor', '18.998', 2, 7, 'p', '2', 'VII A', '[He] 2s² 2p⁵'],
  [10, 'Ne', 'Neon', '20.180', 2, 10, 'p', '2', 'VIII A', '[He] 2s² 2p⁶'],

  // 3-davr (3-qator)
  [11, 'Na', 'Natriy', '22.990', 3, 1, 's', '3', 'I A', '[Ne] 3s¹'],
  [12, 'Mg', 'Magniy', '24.305', 3, 2, 's', '3', 'II A', '[Ne] 3s²'],
  [13, 'Al', 'Alyuminiy', '26.982', 3, 3, 'p', '3', 'III A', '[Ne] 3s² 3p¹'],
  [14, 'Si', 'Kremniy', '28.085', 3, 4, 'p', '3', 'IV A', '[Ne] 3s² 3p²'],
  [15, 'P', 'Fosfor', '30.974', 3, 5, 'p', '3', 'V A', '[Ne] 3s² 3p³'],
  [16, 'S', 'Oltingugurt', '32.06', 3, 6, 'p', '3', 'VI A', '[Ne] 3s² 3p⁴'],
  [17, 'Cl', 'Xlor', '35.45', 3, 7, 'p', '3', 'VII A', '[Ne] 3s² 3p⁵'],
  [18, 'Ar', 'Argon', '39.948', 3, 10, 'p', '3', 'VIII A', '[Ne] 3s² 3p⁶'],

  // 4-davr (4-qator - juft)
  [19, 'K', 'Kaliy', '39.098', 4, 1, 's', '4', 'I A', '[Ar] 4s¹'],
  [20, 'Ca', 'Kalsiy', '40.078', 4, 2, 's', '4', 'II A', '[Ar] 4s²'],
  [21, 'Sc', 'Skandiy', '44.956', 4, 3, 'd', '4', 'III B', '[Ar] 3d¹ 4s²'],
  [22, 'Ti', 'Titan', '47.867', 4, 4, 'd', '4', 'IV B', '[Ar] 3d² 4s²'],
  [23, 'V', 'Vanadiy', '50.942', 4, 5, 'd', '4', 'V B', '[Ar] 3d³ 4s²'],
  [24, 'Cr', 'Xrom', '51.996', 4, 6, 'd', '4', 'VI B', '[Ar] 3d⁵ 4s¹'],
  [25, 'Mn', 'Marganets', '54.938', 4, 7, 'd', '4', 'VII B', '[Ar] 3d⁵ 4s²'],
  [26, 'Fe', 'Temir', '55.845', 4, 8, 'd', '4', 'VIII B', '[Ar] 3d⁶ 4s²'],
  [27, 'Co', 'Kobalt', '58.933', 4, 9, 'd', '4', 'VIII B', '[Ar] 3d⁷ 4s²'],
  [28, 'Ni', 'Nikel', '58.693', 4, 10, 'd', '4', 'VIII B', '[Ar] 3d⁸ 4s²'],

  // 4-davr (5-qator - toq)
  [29, 'Cu', 'Mis', '63.546', 5, 1, 'd', '4', 'I B', '[Ar] 3d¹⁰ 4s¹'],
  [30, 'Zn', 'Rux', '65.38', 5, 2, 'd', '4', 'II B', '[Ar] 3d¹⁰ 4s²'],
  [31, 'Ga', 'Galliy', '69.723', 5, 3, 'p', '4', 'III A', '[Ar] 3d¹⁰ 4s² 4p¹'],
  [32, 'Ge', 'Germaniy', '72.630', 5, 4, 'p', '4', 'IV A', '[Ar] 3d¹⁰ 4s² 4p²'],
  [33, 'As', 'Mishyak', '74.922', 5, 5, 'p', '4', 'V A', '[Ar] 3d¹⁰ 4s² 4p³'],
  [34, 'Se', 'Selen', '78.971', 5, 6, 'p', '4', 'VI A', '[Ar] 3d¹⁰ 4s² 4p⁴'],
  [35, 'Br', 'Brom', '79.904', 5, 7, 'p', '4', 'VII A', '[Ar] 3d¹⁰ 4s² 4p⁵'],
  [36, 'Kr', 'Kripton', '83.798', 5, 10, 'p', '4', 'VIII A', '[Ar] 3d¹⁰ 4s² 4p⁶'],

  // 5-davr (6-qator - juft)
  [37, 'Rb', 'Rubidiy', '85.468', 6, 1, 's', '5', 'I A', '[Kr] 5s¹'],
  [38, 'Sr', 'Stronsiy', '87.62', 6, 2, 's', '5', 'II A', '[Kr] 5s²'],
  [39, 'Y', 'Ittriy', '88.906', 6, 3, 'd', '5', 'III B', '[Kr] 4d¹ 5s²'],
  [40, 'Zr', 'Sirkoniy', '91.224', 6, 4, 'd', '5', 'IV B', '[Kr] 4d² 5s²'],
  [41, 'Nb', 'Niobiy', '92.906', 6, 5, 'd', '5', 'V B', '[Kr] 4d⁴ 5s¹'],
  [42, 'Mo', 'Molibden', '95.95', 6, 6, 'd', '5', 'VI B', '[Kr] 4d⁵ 5s¹'],
  [43, 'Tc', 'Texnetsiy', '(98)', 6, 7, 'd', '5', 'VII B', '[Kr] 4d⁵ 5s²'],
  [44, 'Ru', 'Ruteniy', '101.07', 6, 8, 'd', '5', 'VIII B', '[Kr] 4d⁷ 5s¹'],
  [45, 'Rh', 'Rodiy', '102.91', 6, 9, 'd', '5', 'VIII B', '[Kr] 4d⁸ 5s¹'],
  [46, 'Pd', 'Palladiy', '106.42', 6, 10, 'd', '5', 'VIII B', '[Kr] 4d¹⁰'],

  // 5-davr (7-qator - toq)
  [47, 'Ag', 'Kumush', '107.87', 7, 1, 'd', '5', 'I B', '[Kr] 4d¹⁰ 5s¹'],
  [48, 'Cd', 'Kadmiy', '112.41', 7, 2, 'd', '5', 'II B', '[Kr] 4d¹⁰ 5s²'],
  [49, 'In', 'Indiy', '114.82', 7, 3, 'p', '5', 'III A', '[Kr] 4d¹⁰ 5s² 5p¹'],
  [50, 'Sn', 'Qalay', '118.71', 7, 4, 'p', '5', 'IV A', '[Kr] 4d¹⁰ 5s² 5p²'],
  [51, 'Sb', 'Surma', '121.76', 7, 5, 'p', '5', 'V A', '[Kr] 4d¹⁰ 5s² 5p³'],
  [52, 'Te', 'Tellur', '127.60', 7, 6, 'p', '5', 'VI A', '[Kr] 4d¹⁰ 5s² 5p⁴'],
  [53, 'I', 'Yod', '126.90', 7, 7, 'p', '5', 'VII A', '[Kr] 4d¹⁰ 5s² 5p⁵'],
  [54, 'Xe', 'Ksenon', '131.29', 7, 10, 'p', '5', 'VIII A', '[Kr] 4d¹⁰ 5s² 5p⁶'],

  // 6-davr (8-qator - juft)
  [55, 'Cs', 'Seziy', '132.91', 8, 1, 's', '6', 'I A', '[Xe] 6s¹'],
  [56, 'Ba', 'Bariy', '137.33', 8, 2, 's', '6', 'II A', '[Xe] 6s²'],
  [57, 'La*', 'Lantanoidlar', '138.91', 8, 3, 'f', '6', 'III B (57-71)', '[Xe] 5d¹ 6s²'],
  [72, 'Hf', 'Gafniy', '178.49', 8, 4, 'd', '6', 'IV B', '[Xe] 4f¹⁴ 5d² 6s²'],
  [73, 'Ta', 'Tantal', '180.95', 8, 5, 'd', '6', 'V B', '[Xe] 4f¹⁴ 5d³ 6s²'],
  [74, 'W', 'Volfram', '183.84', 8, 6, 'd', '6', 'VI B', '[Xe] 4f¹⁴ 5d⁴ 6s²'],
  [75, 'Re', 'Reniy', '186.21', 8, 7, 'd', '6', 'VII B', '[Xe] 4f¹⁴ 5d⁵ 6s²'],
  [76, 'Os', 'Osmiy', '190.23', 8, 8, 'd', '6', 'VIII B', '[Xe] 4f¹⁴ 5d⁶ 6s²'],
  [77, 'Ir', 'Iridiy', '192.22', 8, 9, 'd', '6', 'VIII B', '[Xe] 4f¹⁴ 5d⁷ 6s²'],
  [78, 'Pt', 'Platina', '195.08', 8, 10, 'd', '6', 'VIII B', '[Xe] 4f¹⁴ 5d⁹ 6s¹'],

  // 6-davr (9-qator - toq)
  [79, 'Au', 'Oltin', '196.97', 9, 1, 'd', '6', 'I B', '[Xe] 4f¹⁴ 5d¹⁰ 6s¹'],
  [80, 'Hg', 'Simob', '200.59', 9, 2, 'd', '6', 'II B', '[Xe] 4f¹⁴ 5d¹⁰ 6s²'],
  [81, 'Tl', 'Talliy', '204.38', 9, 3, 'p', '6', 'III A', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹'],
  [82, 'Pb', 'Qo‘rg‘oshin', '207.2', 9, 4, 'p', '6', 'IV A', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p²'],
  [83, 'Bi', 'Vismut', '208.98', 9, 5, 'p', '6', 'V A', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³'],
  [84, 'Po', 'Poloniy', '(209)', 9, 6, 'p', '6', 'VI A', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴'],
  [85, 'At', 'Astat', '(210)', 9, 7, 'p', '6', 'VII A', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵'],
  [86, 'Rn', 'Radon', '(222)', 9, 10, 'p', '6', 'VIII A', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶'],

  // 7-davr (10-qator)
  [87, 'Fr', 'Fransiy', '(223)', 10, 1, 's', '7', 'I A', '[Rn] 7s¹'],
  [88, 'Ra', 'Radiy', '(226)', 10, 2, 's', '7', 'II A', '[Rn] 7s²'],
  [89, 'Ac**', 'Aktinoidlar', '(227)', 10, 3, 'f', '7', 'III B (89-103)', '[Rn] 6d¹ 7s²'],
  [104, 'Rf', 'Rezerfordiy', '(267)', 10, 4, 'd', '7', 'IV B', '[Rn] 5f¹⁴ 6d² 7s²'],
  [105, 'Db', 'Dubniy', '(268)', 10, 5, 'd', '7', 'V B', '[Rn] 5f¹⁴ 6d³ 7s²'],
  [106, 'Sg', 'Siborgiy', '(269)', 10, 6, 'd', '7', 'VI B', '[Rn] 5f¹⁴ 6d⁴ 7s²'],
  [107, 'Bh', 'Boriy', '(270)', 10, 7, 'd', '7', 'VII B', '[Rn] 5f¹⁴ 6d⁵ 7s²'],
  [108, 'Hs', 'Xassiy', '(277)', 10, 8, 'd', '7', 'VIII B', '[Rn] 5f¹⁴ 6d⁶ 7s²'],
  [109, 'Mt', 'Meytneriy', '(278)', 10, 9, 'd', '7', 'VIII B', '[Rn] 5f¹⁴ 6d⁷ 7s²'],
  [110, 'Ds', 'Darmshtadtiy', '(281)', 10, 10, 'd', '7', 'VIII B', '[Rn] 5f¹⁴ 6d⁸ 7s²'],
];

// Pastda fixed turadigan Lantanoidlar (57-71) va Aktinoidlar (89-103)
const LANTHANIDES = [
  [57, 'La', 'Lantan', '138.91', 0, 0, 'f', '6', 'III B', '[Xe] 5d¹ 6s²'],
  [58, 'Ce', 'Seriy', '140.12', 0, 0, 'f', '6', 'III B', '[Xe] 4f¹ 5d¹ 6s²'],
  [59, 'Pr', 'Prazeodim', '140.91', 0, 0, 'f', '6', 'III B', '[Xe] 4f³ 6s²'],
  [60, 'Nd', 'Neodim', '144.24', 0, 0, 'f', '6', 'III B', '[Xe] 4f⁴ 6s²'],
  [61, 'Pm', 'Prometiy', '(145)', 0, 0, 'f', '6', 'III B', '[Xe] 4f⁵ 6s²'],
  [62, 'Sm', 'Samariy', '150.36', 0, 0, 'f', '6', 'III B', '[Xe] 4f⁶ 6s²'],
  [63, 'Eu', 'Yevropiy', '151.96', 0, 0, 'f', '6', 'III B', '[Xe] 4f⁷ 6s²'],
  [64, 'Gd', 'Gadoliniy', '157.25', 0, 0, 'f', '6', 'III B', '[Xe] 4f⁷ 5d¹ 6s²'],
  [65, 'Tb', 'Terbiy', '158.93', 0, 0, 'f', '6', 'III B', '[Xe] 4f⁹ 6s²'],
  [66, 'Dy', 'Disproziy', '162.50', 0, 0, 'f', '6', 'III B', '[Xe] 4f¹⁰ 6s²'],
  [67, 'Ho', 'Golmiy', '164.93', 0, 0, 'f', '6', 'III B', '[Xe] 4f¹¹ 6s²'],
  [68, 'Er', 'Erbiy', '167.26', 0, 0, 'f', '6', 'III B', '[Xe] 4f¹² 6s²'],
  [69, 'Tm', 'Tuliy', '168.93', 0, 0, 'f', '6', 'III B', '[Xe] 4f¹³ 6s²'],
  [70, 'Yb', 'Itterbiy', '173.05', 0, 0, 'f', '6', 'III B', '[Xe] 4f¹⁴ 6s²'],
  [71, 'Lu', 'Lyutetsiy', '174.97', 0, 0, 'f', '6', 'III B', '[Xe] 4f¹⁴ 5d¹ 6s²'],
];

const ACTINIDES = [
  [89, 'Ac', 'Aktiniy', '(227)', 0, 0, 'f', '7', 'III B', '[Rn] 6d¹ 7s²'],
  [90, 'Th', 'Toriy', '232.04', 0, 0, 'f', '7', 'III B', '[Rn] 6d² 7s²'],
  [91, 'Pa', 'Protaktiniy', '231.04', 0, 0, 'f', '7', 'III B', '[Rn] 5f² 6d¹ 7s²'],
  [92, 'U', 'Uran', '238.03', 0, 0, 'f', '7', 'III B', '[Rn] 5f³ 6d¹ 7s²'],
  [93, 'Np', 'Neptuniy', '(237)', 0, 0, 'f', '7', 'III B', '[Rn] 5f⁴ 6d¹ 7s²'],
  [94, 'Pu', 'Plutoniy', '(244)', 0, 0, 'f', '7', 'III B', '[Rn] 5f⁶ 7s²'],
  [95, 'Am', 'Ameritsiy', '(243)', 0, 0, 'f', '7', 'III B', '[Rn] 5f⁷ 7s²'],
  [96, 'Cm', 'Kyuriy', '(247)', 0, 0, 'f', '7', 'III B', '[Rn] 5f⁷ 6d¹ 7s²'],
  [97, 'Bk', 'Berkliy', '(247)', 0, 0, 'f', '7', 'III B', '[Rn] 5f⁹ 7s²'],
  [98, 'Cf', 'Kaliforniy', '(251)', 0, 0, 'f', '7', 'III B', '[Rn] 5f¹⁰ 7s²'],
  [99, 'Es', 'Eynshteyniy', '(252)', 0, 0, 'f', '7', 'III B', '[Rn] 5f¹¹ 7s²'],
  [100, 'Fm', 'Fermiy', '(257)', 0, 0, 'f', '7', 'III B', '[Rn] 5f¹² 7s²'],
  [101, 'Md', 'Mendeleyev', '(258)', 0, 0, 'f', '7', 'III B', '[Rn] 5f¹³ 7s²'],
  [102, 'No', 'Nobeliy', '(259)', 0, 0, 'f', '7', 'III B', '[Rn] 5f¹⁴ 7s²'],
  [103, 'Lr', 'Lourensiy', '(266)', 0, 0, 'f', '7', 'III B', '[Rn] 5f¹⁴ 7s² 7p¹'],
];

const DAVR_QATOR_META = [
  { row: 1, davr: '1', davrSpan: 1, qator: '1' },
  { row: 2, davr: '2', davrSpan: 1, qator: '2' },
  { row: 3, davr: '3', davrSpan: 1, qator: '3' },
  { row: 4, davr: '4', davrSpan: 2, qator: '4' },
  { row: 5, davr: null, davrSpan: 0, qator: '5' },
  { row: 6, davr: '5', davrSpan: 2, qator: '6' },
  { row: 7, davr: null, davrSpan: 0, qator: '7' },
  { row: 8, davr: '6', davrSpan: 2, qator: '8' },
  { row: 9, davr: null, davrSpan: 0, qator: '9' },
  { row: 10, davr: '7', davrSpan: 1, qator: '10' },
];

const BLOCK_STYLES = {
  s: { bg: 'bg-[#ea6d6d] text-white border-white/40', badge: 'bg-red-100 text-red-800 border-red-300', label: 's-element (Asosiy guruh)' },
  p: { bg: 'bg-[#f1f681] text-slate-900 border-white/60', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'p-element (Metallmas / Metall)' },
  d: { bg: 'bg-[#29b6f6] text-white border-white/40', badge: 'bg-sky-100 text-sky-800 border-sky-300', label: 'd-element (Oraliq metall)' },
  f: { bg: 'bg-[#ec7070] text-white border-white/40', badge: 'bg-rose-100 text-rose-800 border-rose-300', label: 'f-element (Lantanoid / Aktinoid)' },
};

// =========================================================================
// 2. KISLOTA, ASOS VA TUZLARNING SUVDA ERUVCHANLIK JADVALI (Rasm 2 asosida)
// =========================================================================
const CATIONS = [
  { label: 'H⁺', sym: 'H', charge: 1 },
  { label: 'NH₄⁺', sym: 'NH₄', charge: 1 },
  { label: 'Na⁺, K⁺', sym: 'Na/K', charge: 1 },
  { label: 'Mg²⁺', sym: 'Mg', charge: 2 },
  { label: 'Ca²⁺', sym: 'Ca', charge: 2 },
  { label: 'Ba²⁺', sym: 'Ba', charge: 2 },
  { label: 'Al³⁺', sym: 'Al', charge: 3 },
  { label: 'Cr³⁺', sym: 'Cr', charge: 3 },
  { label: 'Mn²⁺, Zn²⁺', sym: 'Mn/Zn', charge: 2 },
  { label: 'Co²⁺, Ni²⁺', sym: 'Co/Ni', charge: 2 },
  { label: 'Fe²⁺', sym: 'Fe', charge: 2 },
  { label: 'Fe³⁺', sym: 'Fe', charge: 3 },
  { label: 'Cd²⁺', sym: 'Cd', charge: 2 },
  { label: 'Hg²⁺', sym: 'Hg', charge: 2 },
  { label: 'Cu²⁺', sym: 'Cu', charge: 2 },
  { label: 'Ag⁺', sym: 'Ag', charge: 1 },
  { label: 'Sn²⁺', sym: 'Sn', charge: 2 },
  { label: 'Pb²⁺', sym: 'Pb', charge: 2 },
];

const SOLUBILITY_ROWS = [
  { anion: 'OH⁻', sym: 'OH', charge: 1, poly: true, vals: ['-', '-', 'E', 'O', 'O', 'E', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', '-', 'Q', '-', 'Q', 'Q'] },
  { anion: 'F⁻', sym: 'F', charge: 1, poly: false, vals: ['E', 'E', 'E', 'Q', 'Q', 'O', 'O', 'Q', 'O', 'E', 'Q', 'Q', 'E', '-', 'Q', 'E', 'E', 'Q'] },
  { anion: 'Cl⁻', sym: 'Cl', charge: 1, poly: false, vals: ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'Q', 'E', 'O'] },
  { anion: 'Br⁻', sym: 'Br', charge: 1, poly: false, vals: ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'O', 'E', 'Q', 'E', 'O'] },
  { anion: 'I⁻', sym: 'I', charge: 1, poly: false, vals: ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'Q', 'E', 'Q', 'E', 'Q'] },
  { anion: 'S²⁻', sym: 'S', charge: 2, poly: false, vals: ['E', '-', 'E', 'E', 'O', 'E', '-', '-', 'Q', 'Q', 'Q', '-', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q'] },
  { anion: 'SO₃²⁻', sym: 'SO₃', charge: 2, poly: true, vals: ['E', 'E', 'E', 'Q', 'Q', 'Q', '-', '-', 'Q', 'Q', 'Q', '-', 'Q', 'Q', 'Q', 'Q', '-', 'Q'] },
  { anion: 'SO₄²⁻', sym: 'SO₄', charge: 2, poly: true, vals: ['E', 'E', 'E', 'E', 'O', 'Q', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'O', 'E', 'Q'] },
  { anion: 'NO₃⁻', sym: 'NO₃', charge: 1, poly: true, vals: ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', '-', 'E'] },
  { anion: 'PO₄³⁻', sym: 'PO₄', charge: 3, poly: true, vals: ['E', 'E', 'E', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q'] },
  { anion: 'CO₃²⁻', sym: 'CO₃', charge: 2, poly: true, vals: ['E', 'E', 'E', 'Q', 'Q', 'Q', '-', '-', 'Q', 'Q', 'Q', '-', 'Q', 'Q', 'Q', 'Q', '-', 'Q'] },
  { anion: 'SiO₃²⁻', sym: 'SiO₃', charge: 2, poly: true, vals: ['Q', '-', 'E', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', 'Q', '-', 'Q', 'Q', '-', 'Q'] },
  { anion: 'CH₃COO⁻', sym: 'CH₃COO', charge: 1, poly: true, vals: ['E', 'E', 'E', 'E', 'E', 'E', 'O', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'] },
];

const SOL_CODE_INFO = {
  E: { bg: 'bg-[#f4c6d0] text-slate-900', name: 'E — Eriydigan modda', desc: '100 g suvda 1 g dan ortiq eriydi' },
  O: { bg: 'bg-[#f09b22] text-white', name: 'O — Oz eriydigan modda', desc: '100 g suvda 0,1 – 1,0 g gacha eriydi' },
  Q: { bg: 'bg-[#ebbf84] text-slate-900', name: 'Q — Qiyin eriydigan modda', desc: '100 g suvda 0,1 g dan kamroq eriydi (cho‘kma)' },
  '-': { bg: 'bg-[#e3ecc4] text-slate-700', name: '— Parchalanadi / Mavjud emas', desc: 'Bunday modda suv ta’sirida parchalanadi yoki suvda mavjud emas' },
};

function buildFormula(cat, row) {
  if (cat.sym === 'H' && row.sym === 'OH') return 'H₂O';
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const d = gcd(cat.charge, row.charge);
  const cCount = row.charge / d;
  const aCount = cat.charge / d;
  const sub = n => (n === 1 ? '' : String(n).replace(/[0-9]/g, m => '₀₁₂₃₄₅₆₇₈₉'[m]));

  const cPart = cCount > 1 && cat.sym === 'NH₄' ? `(NH₄)${sub(cCount)}` : `${cat.sym}${sub(cCount)}`;
  const aPart = aCount > 1 && row.poly ? `(${row.sym})${sub(aCount)}` : `${row.sym}${sub(aCount)}`;
  return row.sym === 'CH₃COO' ? `${aPart}${cPart}` : `${cPart}${aPart}`;
}

// =========================================================================
// KALKULYATOR KOMPONENTI
// =========================================================================
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

// =========================================================================
// DESMOS GRAFIK KALKULYATOR
// =========================================================================
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

// =========================================================================
// KIMYOVIY JADVAL + ERUVCHANLIK JADVALI KARUSELI
// =========================================================================
function ChemistryCarousel() {
  const [slideIndex, setSlideIndex] = useState(0); // 0: Mendeleyev jadvali, 1: Eruvchanlik jadvali
  const [selectedEl, setSelectedEl] = useState(SHORT_TABLE_ELEMENTS[22]); // Vanadiy (rasmdagi kabi)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCell, setSelectedCell] = useState({
    formula: 'CaSO₄',
    cation: 'Ca²⁺',
    anion: 'SO₄²⁻',
    code: 'O'
  });

  const allElements = [...SHORT_TABLE_ELEMENTS, ...LANTHANIDES, ...ACTINIDES];
  const matchedNums = new Set(
    allElements
      .filter(el => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase().trim();
        return (
          el[1].toLowerCase().includes(q) ||
          el[2].toLowerCase().includes(q) ||
          String(el[0]) === q
        );
      })
      .map(el => el[0])
  );

  const selectedBlock = BLOCK_STYLES[selectedEl[6]] || BLOCK_STYLES.s;

  return (
    <div className="space-y-4">
      {/* Karusel Boshqaruv Paneli */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSlideIndex(0)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
              slideIndex === 0 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Atom className="w-4 h-4" /> 1. Davriy Jadval
          </button>
          <button
            onClick={() => setSlideIndex(1)}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition ${
              slideIndex === 1 ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FlaskConical className="w-4 h-4" /> 2. Eruvchanlik Jadvali
          </button>
        </div>

        {/* Karusel o'ng/chap strelkalari */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">
            {slideIndex === 0 ? 'Davriy jadval (1 / 2)' : 'Eruvchanlik jadvali (2 / 2)'}
          </span>
          <button
            onClick={() => setSlideIndex(prev => (prev === 0 ? 1 : 0))}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
            title="Oldingi jadval"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setSlideIndex(prev => (prev === 1 ? 0 : 1))}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
            title="Keyingi jadval"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* =======================================================
          SLAYD 1: QISQA SHAKLDAGI DAVRIY JADVAL (Rasm 1)
         ======================================================= */}
      {slideIndex === 0 && (
        <div className="space-y-4">
          {/* Tanlangan element haqida batafsil ma'lumot paneli + Qidiruv */}
          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex items-center gap-4 sm:gap-6 shadow-sm">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#6a28a8] text-white flex flex-col justify-between p-2.5 shrink-0 shadow-md">
                <span className="text-xs font-bold text-right">{selectedEl[0]}</span>
                <span className="text-2xl sm:text-3xl font-extrabold leading-none">{selectedEl[1].replace(/\*/g, '')}</span>
                <span className="text-[11px] truncate font-medium">{selectedEl[2]}</span>
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg sm:text-2xl font-bold text-slate-800">{selectedEl[2]}</h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${selectedBlock.badge}`}>
                    {selectedBlock.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs sm:text-sm text-slate-600 pt-1">
                  <p><b>Tartib raqami:</b> {selectedEl[0]}</p>
                  <p><b>Atom massasi:</b> {selectedEl[3]}</p>
                  <p><b>Davr / Guruh:</b> {selectedEl[7]}-davr, {selectedEl[8]}</p>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-mono bg-slate-50 px-3 py-1.5 rounded-lg inline-block">
                  Elektron konfiguratsiyasi: <b>{selectedEl[9]}</b>
                </p>
              </div>
            </div>

            {/* Qidiruv va Ranglar izohi */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Element qidirish (V, Vanadiy, 23)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#ea6d6d] inline-block" /> s-elementlar
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#f1f681] border border-slate-300 inline-block" /> p-elementlar
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#29b6f6] inline-block" /> d-elementlar
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-[#6a28a8] inline-block" /> Tanlangan element
                </div>
              </div>
            </div>
          </div>

          {/* Asosiy Qisqa Shakldagi Jadval (Rasm 1 ko'rinishida) */}
          <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
            <div className="min-w-[820px]">
              {/* Yuqori sarlavha: Davr | Qator | Element Guruxlari (I - VIII) */}
              <div
                className="grid text-center font-bold text-slate-800 text-xs sm:text-sm border-b border-slate-200 pb-2 mb-1"
                style={{ gridTemplateColumns: '48px 48px repeat(10, minmax(68px, 1fr))' }}
              >
                <div className="flex items-end justify-center">Davr</div>
                <div className="flex items-end justify-center">Qator</div>
                <div style={{ gridColumn: '3 / 13' }} className="space-y-1">
                  <div className="text-xs text-slate-500 font-semibold">Element Guruxlari</div>
                  <div className="grid grid-cols-10">
                    <div>I</div>
                    <div>II</div>
                    <div>III</div>
                    <div>IV</div>
                    <div>V</div>
                    <div>VI</div>
                    <div>VII</div>
                    <div className="col-span-3">VIII</div>
                  </div>
                </div>
              </div>

              {/* 10 ta Qator va Elementlar */}
              <div
                className="grid gap-[2px] bg-slate-100 border border-slate-200 rounded-xl overflow-hidden"
                style={{
                  gridTemplateColumns: '48px 48px repeat(10, minmax(68px, 1fr))',
                  gridTemplateRows: 'repeat(10, minmax(54px, auto))'
                }}
              >
                {/* Davr va Qator ustunlari */}
                {DAVR_QATOR_META.map(m => (
                  <React.Fragment key={m.row}>
                    {m.davr && (
                      <div
                        style={{ gridRow: `${m.row} / span ${m.davrSpan}`, gridColumn: 1 }}
                        className="bg-white flex items-center justify-center font-bold text-slate-700 text-sm"
                      >
                        {m.davr}
                      </div>
                    )}
                    <div
                      style={{ gridRow: m.row, gridColumn: 2 }}
                      className="bg-white flex items-center justify-center font-semibold text-slate-600 text-xs sm:text-sm"
                    >
                      {m.qator}
                    </div>
                  </React.Fragment>
                ))}

                {/* Element katakchalari */}
                {SHORT_TABLE_ELEMENTS.map(el => {
                  const [num, sym, name, , row, col, block] = el;
                  const isSelected = selectedEl[0] === num;
                  const isDimmed = searchQuery.trim() !== '' && !matchedNums.has(num);
                  const styleClass = isSelected
                    ? 'bg-[#6a28a8] text-white ring-2 ring-[#4a148c] scale-[1.04] z-10 shadow-lg'
                    : BLOCK_STYLES[block]?.bg || 'bg-white';

                  return (
                    <button
                      key={num}
                      onClick={() => setSelectedEl(el)}
                      style={{ gridRow: row, gridColumn: col + 2 }}
                      className={`p-1.5 flex flex-col justify-between text-left transition cursor-pointer ${styleClass} ${
                        isDimmed ? 'opacity-25' : 'opacity-100'
                      }`}
                    >
                      <div className="flex items-start justify-between w-full">
                        <span className="text-base sm:text-lg font-bold leading-none">{sym}</span>
                        <span className="text-[11px] font-semibold leading-none">{num}</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-medium truncate w-full leading-tight">
                        {name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* =======================================================
              PASTDA FIXED (STICKY) TURADIGAN LANTANOIDLAR VA AKTINOIDLAR
             ======================================================= */}
          <div className="sticky bottom-14 lg:bottom-2 z-20 bg-white/95 backdrop-blur-md p-3 rounded-2xl border-2 border-rose-200 shadow-lg space-y-2">
            {/* Lantanoidlar qatori */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-[11px] font-bold text-rose-700 w-24 shrink-0">
                * Lantanoidlar:
              </span>
              <div className="flex gap-1">
                {LANTHANIDES.map(el => {
                  const isSelected = selectedEl[0] === el[0];
                  const isDimmed = searchQuery.trim() !== '' && !matchedNums.has(el[0]);
                  return (
                    <button
                      key={el[0]}
                      onClick={() => setSelectedEl(el)}
                      className={`w-12 p-1 rounded-lg text-left transition shrink-0 ${
                        isSelected
                          ? 'bg-[#6a28a8] text-white ring-2 ring-purple-900 scale-105'
                          : 'bg-[#ea6d6d] hover:bg-[#e05858] text-white'
                      } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                    >
                      <div className="flex justify-between text-[9px] font-bold">
                        <span>{el[1]}</span>
                        <span>{el[0]}</span>
                      </div>
                      <div className="text-[8px] truncate">{el[2]}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Aktinoidlar qatori */}
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-[11px] font-bold text-rose-700 w-24 shrink-0">
                ** Aktinoidlar:
              </span>
              <div className="flex gap-1">
                {ACTINIDES.map(el => {
                  const isSelected = selectedEl[0] === el[0];
                  const isDimmed = searchQuery.trim() !== '' && !matchedNums.has(el[0]);
                  return (
                    <button
                      key={el[0]}
                      onClick={() => setSelectedEl(el)}
                      className={`w-12 p-1 rounded-lg text-left transition shrink-0 ${
                        isSelected
                          ? 'bg-[#6a28a8] text-white ring-2 ring-purple-900 scale-105'
                          : 'bg-[#ea6d6d] hover:bg-[#e05858] text-white'
                      } ${isDimmed ? 'opacity-25' : 'opacity-100'}`}
                    >
                      <div className="flex justify-between text-[9px] font-bold">
                        <span>{el[1]}</span>
                        <span>{el[0]}</span>
                      </div>
                      <div className="text-[8px] truncate">{el[2]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================
          SLAYD 2: SUVDA ERUVCHANLIK JADVALI (Rasm 2)
         ======================================================= */}
      {slideIndex === 1 && (
        <div className="space-y-4">
          {/* Tanlangan modda formulasi va eruvchanlik izohi */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-extrabold border border-slate-300 shrink-0 ${SOL_CODE_INFO[selectedCell.code]?.bg}`}>
                {selectedCell.code}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-800">{selectedCell.formula}</span>
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
                    {selectedCell.cation} + {selectedCell.anion}
                  </span>
                </div>
                <p className="text-sm font-bold text-blue-700 mt-0.5">
                  {SOL_CODE_INFO[selectedCell.code]?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {SOL_CODE_INFO[selectedCell.code]?.desc}
                </p>
              </div>
            </div>

            {/* Shartli belgilar (E, O, Q, -) */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {Object.entries(SOL_CODE_INFO).map(([code, info]) => (
                <div key={code} className="flex items-center gap-1.5">
                  <span className={`w-5 h-5 rounded flex items-center justify-center font-bold border border-slate-300 ${info.bg}`}>
                    {code}
                  </span>
                  <span className="text-slate-600 truncate">{info.name.split('—')[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Eruvchanlik Jadvali Panjarasi */}
          <div className="bg-white p-3 sm:p-5 rounded-2xl border border-slate-200 overflow-x-auto shadow-sm">
            <h3 className="text-center font-extrabold text-blue-700 text-sm sm:text-base mb-3 uppercase tracking-wide">
              Kislota, asos va tuzlarning suvda eruvchanligi
            </h3>

            <table className="w-full border-collapse text-center text-xs min-w-[780px]">
              <thead>
                <tr className="bg-[#569874] text-white font-bold">
                  <th className="border border-slate-400 p-2 w-10"></th>
                  <th className="border border-slate-400 p-2 w-20">Kationlar</th>
                  {CATIONS.map((c, idx) => (
                    <th key={idx} className="border border-slate-400 p-1.5 min-w-[38px]">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SOLUBILITY_ROWS.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {rIdx === 0 && (
                      <td
                        rowSpan={SOLUBILITY_ROWS.length}
                        className="border border-slate-400 bg-[#569874] text-white font-bold text-sm"
                        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                      >
                        Anionlar
                      </td>
                    )}
                    <td className="border border-slate-400 bg-[#6ab08a] text-slate-900 font-bold p-1.5">
                      {row.anion}
                    </td>
                    {row.vals.map((code, cIdx) => {
                      const cat = CATIONS[cIdx];
                      const formula = buildFormula(cat, row);
                      const isSelected = selectedCell.formula === formula && selectedCell.anion === row.anion;
                      const cellBg = SOL_CODE_INFO[code]?.bg || 'bg-white';

                      return (
                        <td
                          key={cIdx}
                          onClick={() =>
                            setSelectedCell({
                              formula,
                              cation: cat.label,
                              anion: row.anion,
                              code
                            })
                          }
                          className={`border border-slate-400 p-1.5 font-bold cursor-pointer transition hover:brightness-95 ${cellBg} ${
                            isSelected ? 'ring-2 ring-blue-700 scale-110 z-10' : ''
                          }`}
                        >
                          {code}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// =========================================================================
// ASOSIY WRAPPER KOMPONENT
// =========================================================================
export default function StudyTools() {
  const [toolTab, setToolTab] = useState('periodic');

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">O‘quv Jihozlari (Tools)</h2>
          <p className="text-xs text-slate-500">Kimyoviy jadvallar, ilmiy kalkulyator va Desmos grafik</p>
        </div>

        <div className="grid grid-cols-3 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setToolTab('periodic')}
            className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold transition ${
              toolTab === 'periodic' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Atom className="w-4 h-4 shrink-0" /> <span>Kimyo jadval</span>
          </button>
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
        </div>
      </div>

      {toolTab === 'periodic' && <ChemistryCarousel />}
      {toolTab === 'calc' && <StandardCalculator />}
      {toolTab === 'desmos' && <DesmosCalculator />}
    </div>
  );
}