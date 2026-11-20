import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Calculator, Atom, FlaskConical, Orbit, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

// ==========================================
// 1. BARCHA 118 TA ELEMENT (KLASSIK DAVRIY JADVAL + ELEKTRON QOBIQLAR)
// ==========================================
const PERIODIC_118 = [
  { z: 1, sym: 'H', name: 'Vodorod', mass: '1.008', r: 1, c: 1, cat: 'nonmetal', shells: [1] },
  { z: 2, sym: 'He', name: 'Geliy', mass: '4.0026', r: 1, c: 18, cat: 'noble', shells: [2] },
  { z: 3, sym: 'Li', name: 'Litiy', mass: '6.94', r: 2, c: 1, cat: 'alkali', shells: [2, 1] },
  { z: 4, sym: 'Be', name: 'Berilliy', mass: '9.0122', r: 2, c: 2, cat: 'alkaline', shells: [2, 2] },
  { z: 5, sym: 'B', name: 'Bor', mass: '10.81', r: 2, c: 13, cat: 'metalloid', shells: [2, 3] },
  { z: 6, sym: 'C', name: 'Uglerod', mass: '12.011', r: 2, c: 14, cat: 'nonmetal', shells: [2, 4] },
  { z: 7, sym: 'N', name: 'Azot', mass: '14.007', r: 2, c: 15, cat: 'nonmetal', shells: [2, 5] },
  { z: 8, sym: 'O', name: 'Kislorod', mass: '15.999', r: 2, c: 16, cat: 'nonmetal', shells: [2, 6] },
  { z: 9, sym: 'F', name: 'Ftor', mass: '18.998', r: 2, c: 17, cat: 'halogen', shells: [2, 7] },
  { z: 10, sym: 'Ne', name: 'Neon', mass: '20.180', r: 2, c: 18, cat: 'noble', shells: [2, 8] },
  { z: 11, sym: 'Na', name: 'Natriy', mass: '22.990', r: 3, c: 1, cat: 'alkali', shells: [2, 8, 1] },
  { z: 12, sym: 'Mg', name: 'Magniy', mass: '24.305', r: 3, c: 2, cat: 'alkaline', shells: [2, 8, 2] },
  { z: 13, sym: 'Al', name: 'Alyuminiy', mass: '26.982', r: 3, c: 13, cat: 'post', shells: [2, 8, 3] },
  { z: 14, sym: 'Si', name: 'Kremniy', mass: '28.085', r: 3, c: 14, cat: 'metalloid', shells: [2, 8, 4] },
  { z: 15, sym: 'P', name: 'Fosfor', mass: '30.974', r: 3, c: 15, cat: 'nonmetal', shells: [2, 8, 5] },
  { z: 16, sym: 'S', name: 'Oltingugurt', mass: '32.06', r: 3, c: 16, cat: 'nonmetal', shells: [2, 8, 6] },
  { z: 17, sym: 'Cl', name: 'Xlor', mass: '35.45', r: 3, c: 17, cat: 'halogen', shells: [2, 8, 7] },
  { z: 18, sym: 'Ar', name: 'Argon', mass: '39.948', r: 3, c: 18, cat: 'noble', shells: [2, 8, 8] },
  { z: 19, sym: 'K', name: 'Kaliy', mass: '39.098', r: 4, c: 1, cat: 'alkali', shells: [2, 8, 8, 1] },
  { z: 20, sym: 'Ca', name: 'Kalsiy', mass: '40.078', r: 4, c: 2, cat: 'alkaline', shells: [2, 8, 8, 2] },
  { z: 21, sym: 'Sc', name: 'Skandiy', mass: '44.956', r: 4, c: 3, cat: 'transition', shells: [2, 8, 9, 2] },
  { z: 22, sym: 'Ti', name: 'Titan', mass: '47.867', r: 4, c: 4, cat: 'transition', shells: [2, 8, 10, 2] },
  { z: 23, sym: 'V', name: 'Vanadiy', mass: '50.942', r: 4, c: 5, cat: 'transition', shells: [2, 8, 11, 2] },
  { z: 24, sym: 'Cr', name: 'Xrom', mass: '51.996', r: 4, c: 6, cat: 'transition', shells: [2, 8, 13, 1] },
  { z: 25, sym: 'Mn', name: 'Marganets', mass: '54.938', r: 4, c: 7, cat: 'transition', shells: [2, 8, 13, 2] },
  { z: 26, sym: 'Fe', name: 'Temir', mass: '55.845', r: 4, c: 8, cat: 'transition', shells: [2, 8, 14, 2] },
  { z: 27, sym: 'Co', name: 'Kobalt', mass: '58.933', r: 4, c: 9, cat: 'transition', shells: [2, 8, 15, 2] },
  { z: 28, sym: 'Ni', name: 'Nikel', mass: '58.693', r: 4, c: 10, cat: 'transition', shells: [2, 8, 16, 2] },
  { z: 29, sym: 'Cu', name: 'Mis', mass: '63.546', r: 4, c: 11, cat: 'transition', shells: [2, 8, 18, 1] },
  { z: 30, sym: 'Zn', name: 'Rux', mass: '65.38', r: 4, c: 12, cat: 'transition', shells: [2, 8, 18, 2] },
  { z: 31, sym: 'Ga', name: 'Galliy', mass: '69.723', r: 4, c: 13, cat: 'post', shells: [2, 8, 18, 3] },
  { z: 32, sym: 'Ge', name: 'Germaniy', mass: '72.630', r: 4, c: 14, cat: 'metalloid', shells: [2, 8, 18, 4] },
  { z: 33, sym: 'As', name: 'Mishyak', mass: '74.922', r: 4, c: 15, cat: 'metalloid', shells: [2, 8, 18, 5] },
  { z: 34, sym: 'Se', name: 'Selen', mass: '78.971', r: 4, c: 16, cat: 'nonmetal', shells: [2, 8, 18, 6] },
  { z: 35, sym: 'Br', name: 'Brom', mass: '79.904', r: 4, c: 17, cat: 'halogen', shells: [2, 8, 18, 7] },
  { z: 36, sym: 'Kr', name: 'Kripton', mass: '83.798', r: 4, c: 18, cat: 'noble', shells: [2, 8, 18, 8] },
  { z: 37, sym: 'Rb', name: 'Rubidiy', mass: '85.468', r: 5, c: 1, cat: 'alkali', shells: [2, 8, 18, 8, 1] },
  { z: 38, sym: 'Sr', name: 'Stronsiy', mass: '87.62', r: 5, c: 2, cat: 'alkaline', shells: [2, 8, 18, 8, 2] },
  { z: 39, sym: 'Y', name: 'Ittriy', mass: '88.906', r: 5, c: 3, cat: 'transition', shells: [2, 8, 18, 9, 2] },
  { z: 40, sym: 'Zr', name: 'Sirkoniy', mass: '91.224', r: 5, c: 4, cat: 'transition', shells: [2, 8, 18, 10, 2] },
  { z: 41, sym: 'Nb', name: 'Niobiy', mass: '92.906', r: 5, c: 5, cat: 'transition', shells: [2, 8, 18, 12, 1] },
  { z: 42, sym: 'Mo', name: 'Molibden', mass: '95.95', r: 5, c: 6, cat: 'transition', shells: [2, 8, 18, 13, 1] },
  { z: 43, sym: 'Tc', name: 'Texnetsiy', mass: '98', r: 5, c: 7, cat: 'transition', shells: [2, 8, 18, 13, 2] },
  { z: 44, sym: 'Ru', name: 'Ruteniy', mass: '101.07', r: 5, c: 8, cat: 'transition', shells: [2, 8, 18, 15, 1] },
  { z: 45, sym: 'Rh', name: 'Rodiy', mass: '102.91', r: 5, c: 9, cat: 'transition', shells: [2, 8, 18, 16, 1] },
  { z: 46, sym: 'Pd', name: 'Palladiy', mass: '106.42', r: 5, c: 10, cat: 'transition', shells: [2, 8, 18, 18] },
  { z: 47, sym: 'Ag', name: 'Kumush', mass: '107.87', r: 5, c: 11, cat: 'transition', shells: [2, 8, 18, 18, 1] },
  { z: 48, sym: 'Cd', name: 'Kadmiy', mass: '112.41', r: 5, c: 12, cat: 'transition', shells: [2, 8, 18, 18, 2] },
  { z: 49, sym: 'In', name: 'Indiy', mass: '114.82', r: 5, c: 13, cat: 'post', shells: [2, 8, 18, 18, 3] },
  { z: 50, sym: 'Sn', name: 'Qalay', mass: '118.71', r: 5, c: 14, cat: 'post', shells: [2, 8, 18, 18, 4] },
  { z: 51, sym: 'Sb', name: 'Surma', mass: '121.76', r: 5, c: 15, cat: 'metalloid', shells: [2, 8, 18, 18, 5] },
  { z: 52, sym: 'Te', name: 'Tellur', mass: '127.60', r: 5, c: 16, cat: 'metalloid', shells: [2, 8, 18, 18, 6] },
  { z: 53, sym: 'I', name: 'Yod', mass: '126.90', r: 5, c: 17, cat: 'halogen', shells: [2, 8, 18, 18, 7] },
  { z: 54, sym: 'Xe', name: 'Ksenon', mass: '131.29', r: 5, c: 18, cat: 'noble', shells: [2, 8, 18, 18, 8] },
  { z: 55, sym: 'Cs', name: 'Seziy', mass: '132.91', r: 6, c: 1, cat: 'alkali', shells: [2, 8, 18, 18, 8, 1] },
  { z: 56, sym: 'Ba', name: 'Bariy', mass: '137.33', r: 6, c: 2, cat: 'alkaline', shells: [2, 8, 18, 18, 8, 2] },
  // Lantanoidlar (r: 9, c: 3..17)
  { z: 57, sym: 'La', name: 'Lantan', mass: '138.91', r: 9, c: 3, cat: 'lanthanide', shells: [2, 8, 18, 18, 9, 2] },
  { z: 58, sym: 'Ce', name: 'Seriy', mass: '140.12', r: 9, c: 4, cat: 'lanthanide', shells: [2, 8, 18, 19, 9, 2] },
  { z: 59, sym: 'Pr', name: 'Prazeodim', mass: '140.91', r: 9, c: 5, cat: 'lanthanide', shells: [2, 8, 18, 21, 8, 2] },
  { z: 60, sym: 'Nd', name: 'Neodim', mass: '144.24', r: 9, c: 6, cat: 'lanthanide', shells: [2, 8, 18, 22, 8, 2] },
  { z: 61, sym: 'Pm', name: 'Prometiy', mass: '145', r: 9, c: 7, cat: 'lanthanide', shells: [2, 8, 18, 23, 8, 2] },
  { z: 62, sym: 'Sm', name: 'Samariy', mass: '150.36', r: 9, c: 8, cat: 'lanthanide', shells: [2, 8, 18, 24, 8, 2] },
  { z: 63, sym: 'Eu', name: 'Yevropiy', mass: '151.96', r: 9, c: 9, cat: 'lanthanide', shells: [2, 8, 18, 25, 8, 2] },
  { z: 64, sym: 'Gd', name: 'Gadoliniy', mass: '157.25', r: 9, c: 10, cat: 'lanthanide', shells: [2, 8, 18, 25, 9, 2] },
  { z: 65, sym: 'Tb', name: 'Terbiy', mass: '158.93', r: 9, c: 11, cat: 'lanthanide', shells: [2, 8, 18, 27, 8, 2] },
  { z: 66, sym: 'Dy', name: 'Disproziy', mass: '162.50', r: 9, c: 12, cat: 'lanthanide', shells: [2, 8, 18, 28, 8, 2] },
  { z: 67, sym: 'Ho', name: 'Golmiy', mass: '164.93', r: 9, c: 13, cat: 'lanthanide', shells: [2, 8, 18, 29, 8, 2] },
  { z: 68, sym: 'Er', name: 'Erbiy', mass: '167.26', r: 9, c: 14, cat: 'lanthanide', shells: [2, 8, 18, 30, 8, 2] },
  { z: 69, sym: 'Tm', name: 'Tuliy', mass: '168.93', r: 9, c: 15, cat: 'lanthanide', shells: [2, 8, 18, 31, 8, 2] },
  { z: 70, sym: 'Yb', name: 'Itterbiy', mass: '173.05', r: 9, c: 16, cat: 'lanthanide', shells: [2, 8, 18, 32, 8, 2] },
  { z: 71, sym: 'Lu', name: 'Lyutetsiy', mass: '174.97', r: 9, c: 17, cat: 'lanthanide', shells: [2, 8, 18, 32, 9, 2] },
  { z: 72, sym: 'Hf', name: 'Gafniy', mass: '178.49', r: 6, c: 4, cat: 'transition', shells: [2, 8, 18, 32, 10, 2] },
  { z: 73, sym: 'Ta', name: 'Tantal', mass: '180.95', r: 6, c: 5, cat: 'transition', shells: [2, 8, 18, 32, 11, 2] },
  { z: 74, sym: 'W', name: 'Volfram', mass: '183.84', r: 6, c: 6, cat: 'transition', shells: [2, 8, 18, 32, 12, 2] },
  { z: 75, sym: 'Re', name: 'Reniy', mass: '186.21', r: 6, c: 7, cat: 'transition', shells: [2, 8, 18, 32, 13, 2] },
  { z: 76, sym: 'Os', name: 'Osmiy', mass: '190.23', r: 6, c: 8, cat: 'transition', shells: [2, 8, 18, 32, 14, 2] },
  { z: 77, sym: 'Ir', name: 'Iridiy', mass: '192.22', r: 6, c: 9, cat: 'transition', shells: [2, 8, 18, 32, 15, 2] },
  { z: 78, sym: 'Pt', name: 'Platina', mass: '195.08', r: 6, c: 10, cat: 'transition', shells: [2, 8, 18, 32, 17, 1] },
  { z: 79, sym: 'Au', name: 'Oltin', mass: '196.97', r: 6, c: 11, cat: 'transition', shells: [2, 8, 18, 32, 18, 1] },
  { z: 80, sym: 'Hg', name: 'Simob', mass: '200.59', r: 6, c: 12, cat: 'transition', shells: [2, 8, 18, 32, 18, 2] },
  { z: 81, sym: 'Tl', name: 'Talliy', mass: '204.38', r: 6, c: 13, cat: 'post', shells: [2, 8, 18, 32, 18, 3] },
  { z: 82, sym: 'Pb', name: 'Qo‘rg‘oshin', mass: '207.2', r: 6, c: 14, cat: 'post', shells: [2, 8, 18, 32, 18, 4] },
  { z: 83, sym: 'Bi', name: 'Vismut', mass: '208.98', r: 6, c: 15, cat: 'post', shells: [2, 8, 18, 32, 18, 5] },
  { z: 84, sym: 'Po', name: 'Poloniy', mass: '209', r: 6, c: 16, cat: 'metalloid', shells: [2, 8, 18, 32, 18, 6] },
  { z: 85, sym: 'At', name: 'Astat', mass: '210', r: 6, c: 17, cat: 'halogen', shells: [2, 8, 18, 32, 18, 7] },
  { z: 86, sym: 'Rn', name: 'Radon', mass: '222', r: 6, c: 18, cat: 'noble', shells: [2, 8, 18, 32, 18, 8] },
  { z: 87, sym: 'Fr', name: 'Fransiy', mass: '223', r: 7, c: 1, cat: 'alkali', shells: [2, 8, 18, 32, 18, 8, 1] },
  { z: 88, sym: 'Ra', name: 'Radiy', mass: '226', r: 7, c: 2, cat: 'alkaline', shells: [2, 8, 18, 32, 18, 8, 2] },
  // Aktinoidlar (r: 10, c: 3..17)
  { z: 89, sym: 'Ac', name: 'Aktiniy', mass: '227', r: 10, c: 3, cat: 'actinide', shells: [2, 8, 18, 32, 18, 9, 2] },
  { z: 90, sym: 'Th', name: 'Toriy', mass: '232.04', r: 10, c: 4, cat: 'actinide', shells: [2, 8, 18, 32, 18, 10, 2] },
  { z: 91, sym: 'Pa', name: 'Protaktiniy', mass: '231.04', r: 10, c: 5, cat: 'actinide', shells: [2, 8, 18, 32, 20, 9, 2] },
  { z: 92, sym: 'U', name: 'Uran', mass: '238.03', r: 10, c: 6, cat: 'actinide', shells: [2, 8, 18, 32, 21, 9, 2] },
  { z: 93, sym: 'Np', name: 'Neptuniy', mass: '237', r: 10, c: 7, cat: 'actinide', shells: [2, 8, 18, 32, 22, 9, 2] },
  { z: 94, sym: 'Pu', name: 'Plutoniy', mass: '244', r: 10, c: 8, cat: 'actinide', shells: [2, 8, 18, 32, 24, 8, 2] },
  { z: 95, sym: 'Am', name: 'Ameritsiy', mass: '243', r: 10, c: 9, cat: 'actinide', shells: [2, 8, 18, 32, 25, 8, 2] },
  { z: 96, sym: 'Cm', name: 'Kyuriy', mass: '247', r: 10, c: 10, cat: 'actinide', shells: [2, 8, 18, 32, 25, 9, 2] },
  { z: 97, sym: 'Bk', name: 'Berkliy', mass: '247', r: 10, c: 11, cat: 'actinide', shells: [2, 8, 18, 32, 27, 8, 2] },
  { z: 98, sym: 'Cf', name: 'Kaliforniy', mass: '251', r: 10, c: 12, cat: 'actinide', shells: [2, 8, 18, 32, 28, 8, 2] },
  { z: 99, sym: 'Es', name: 'Eynshteyniy', mass: '252', r: 10, c: 13, cat: 'actinide', shells: [2, 8, 18, 32, 29, 8, 2] },
  { z: 100, sym: 'Fm', name: 'Fermiy', mass: '257', r: 10, c: 14, cat: 'actinide', shells: [2, 8, 18, 32, 30, 8, 2] },
  { z: 101, sym: 'Md', name: 'Mendeleviy', mass: '258', r: 10, c: 15, cat: 'actinide', shells: [2, 8, 18, 32, 31, 8, 2] },
  { z: 102, sym: 'No', name: 'Nobeliy', mass: '259', r: 10, c: 16, cat: 'actinide', shells: [2, 8, 18, 32, 32, 8, 2] },
  { z: 103, sym: 'Lr', name: 'Lourensiy', mass: '266', r: 10, c: 17, cat: 'actinide', shells: [2, 8, 18, 32, 32, 8, 3] },
  { z: 104, sym: 'Rf', name: 'Rezerfordiy', mass: '267', r: 7, c: 4, cat: 'transition', shells: [2, 8, 18, 32, 32, 10, 2] },
  { z: 105, sym: 'Db', name: 'Dubniy', mass: '268', r: 7, c: 5, cat: 'transition', shells: [2, 8, 18, 32, 32, 11, 2] },
  { z: 106, sym: 'Sg', name: 'Siborgiy', mass: '269', r: 7, c: 6, cat: 'transition', shells: [2, 8, 18, 32, 32, 12, 2] },
  { z: 107, sym: 'Bh', name: 'Boriy', mass: '270', r: 7, c: 7, cat: 'transition', shells: [2, 8, 18, 32, 32, 13, 2] },
  { z: 108, sym: 'Hs', name: 'Xassiy', mass: '277', r: 7, c: 8, cat: 'transition', shells: [2, 8, 18, 32, 32, 14, 2] },
  { z: 109, sym: 'Mt', name: 'Meytneriy', mass: '278', r: 7, c: 9, cat: 'transition', shells: [2, 8, 18, 32, 32, 15, 2] },
  { z: 110, sym: 'Ds', name: 'Darmshtadtiy', mass: '281', r: 7, c: 10, cat: 'transition', shells: [2, 8, 18, 32, 32, 17, 1] },
  { z: 111, sym: 'Rg', name: 'Rentgeniy', mass: '282', r: 7, c: 11, cat: 'transition', shells: [2, 8, 18, 32, 32, 18, 1] },
  { z: 112, sym: 'Cn', name: 'Kopernitsiy', mass: '285', r: 7, c: 12, cat: 'transition', shells: [2, 8, 18, 32, 32, 18, 2] },
  { z: 113, sym: 'Nh', name: 'Nixoniy', mass: '286', r: 7, c: 13, cat: 'post', shells: [2, 8, 18, 32, 32, 18, 3] },
  { z: 114, sym: 'Fl', name: 'Fleroviy', mass: '289', r: 7, c: 14, cat: 'post', shells: [2, 8, 18, 32, 32, 18, 4] },
  { z: 115, sym: 'Mc', name: 'Moskoviy', mass: '290', r: 7, c: 15, cat: 'post', shells: [2, 8, 18, 32, 32, 18, 5] },
  { z: 116, sym: 'Lv', name: 'Livermoriy', mass: '293', r: 7, c: 16, cat: 'post', shells: [2, 8, 18, 32, 32, 18, 6] },
  { z: 117, sym: 'Ts', name: 'Tennessin', mass: '294', r: 7, c: 17, cat: 'halogen', shells: [2, 8, 18, 32, 32, 18, 7] },
  { z: 118, sym: 'Og', name: 'Oganeson', mass: '294', r: 7, c: 18, cat: 'noble', shells: [2, 8, 18, 32, 32, 18, 8] }
];

const CAT_COLORS = {
  alkali: { bg: 'bg-rose-100 hover:bg-rose-200 border-rose-300 text-rose-950', label: 'Ishqoriy metallar' },
  alkaline: { bg: 'bg-orange-100 hover:bg-orange-200 border-orange-300 text-orange-950', label: 'Ishqoriy-yer metallar' },
  transition: { bg: 'bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-950', label: 'O‘tuvchi metallar' },
  post: { bg: 'bg-emerald-100 hover:bg-emerald-200 border-emerald-300 text-emerald-950', label: 'Metalloiddan keyingi' },
  metalloid: { bg: 'bg-teal-100 hover:bg-teal-200 border-teal-300 text-teal-950', label: 'Metalloidlar' },
  nonmetal: { bg: 'bg-sky-100 hover:bg-sky-200 border-sky-300 text-sky-950', label: 'Nometallar' },
  halogen: { bg: 'bg-indigo-100 hover:bg-indigo-200 border-indigo-300 text-indigo-950', label: 'Galogenlar' },
  noble: { bg: 'bg-purple-100 hover:bg-purple-200 border-purple-300 text-purple-950', label: 'Inert gazlar' },
  lanthanide: { bg: 'bg-pink-100 hover:bg-pink-200 border-pink-300 text-pink-950', label: 'Lantanoidlar' },
  actinide: { bg: 'bg-fuchsia-100 hover:bg-fuchsia-200 border-fuchsia-300 text-fuchsia-950', label: 'Aktinoidlar' }
};

// ==========================================
// 2. 16 TA 3D MOLEKULA VA KRISTALL PANJARA MODELLARI
// ==========================================
const MOLECULES = {
  H2O: {
    formula: 'H₂O',
    name: 'Suv molekulasi',
    geometry: 'Burchakli (104.5°)',
    desc: '1 ta Kislorod (qizil) va 2 ta Vodorod (havorang) atomidan iborat qutbli molekula.',
    atoms: [
      { el: 'O', pos: [0, 0.35, 0], color: '#ef4444', r: 0.72 },
      { el: 'H', pos: [-1.15, -0.5, 0], color: '#38bdf8', r: 0.44 },
      { el: 'H', pos: [1.15, -0.5, 0], color: '#38bdf8', r: 0.44 }
    ],
    bonds: [[0, 1, 1], [0, 2, 1]]
  },
  CO2: {
    formula: 'CO₂',
    name: 'Karbonat angidrid',
    geometry: 'Chiziqli (180°)',
    desc: 'Markazda Uglerod va ikki tomonda qo‘shbog‘ bilan ulangan 2 ta Kislorod atomi.',
    atoms: [
      { el: 'C', pos: [0, 0, 0], color: '#475569', r: 0.68 },
      { el: 'O', pos: [-1.65, 0, 0], color: '#ef4444', r: 0.62 },
      { el: 'O', pos: [1.65, 0, 0], color: '#ef4444', r: 0.62 }
    ],
    bonds: [[0, 1, 2], [0, 2, 2]]
  },
  CH4: {
    formula: 'CH₄',
    name: 'Metan (Tabiiy gaz)',
    geometry: 'Tetraedr (109.5°)',
    desc: 'Uglerod atomi atrofida 4 ta Vodorod atomi fazoviy tetraedr shaklida joylashgan.',
    atoms: [
      { el: 'C', pos: [0, 0, 0], color: '#475569', r: 0.7 },
      { el: 'H', pos: [1.1, 1.1, 1.1], color: '#38bdf8', r: 0.42 },
      { el: 'H', pos: [-1.1, -1.1, 1.1], color: '#38bdf8', r: 0.42 },
      { el: 'H', pos: [-1.1, 1.1, -1.1], color: '#38bdf8', r: 0.42 },
      { el: 'H', pos: [1.1, -1.1, -1.1], color: '#38bdf8', r: 0.42 }
    ],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]
  },
  C2H6: {
    formula: 'C₂H₆',
    name: 'Etan (Alkan)',
    geometry: 'Qo‘sh tetraedr (109.5°)',
    desc: '2 ta Uglerod atomi oddiy bog‘ bilan, har biri 3 tadan Vodorod atomi bilan bog‘langan.',
    atoms: [
      { el: 'C', pos: [-0.85, 0, 0], color: '#475569', r: 0.64 },
      { el: 'C', pos: [0.85, 0, 0], color: '#475569', r: 0.64 },
      { el: 'H', pos: [-1.5, 1.0, 0], color: '#38bdf8', r: 0.38 },
      { el: 'H', pos: [-1.5, -0.5, 0.87], color: '#38bdf8', r: 0.38 },
      { el: 'H', pos: [-1.5, -0.5, -0.87], color: '#38bdf8', r: 0.38 },
      { el: 'H', pos: [1.5, -1.0, 0], color: '#38bdf8', r: 0.38 },
      { el: 'H', pos: [1.5, 0.5, 0.87], color: '#38bdf8', r: 0.38 },
      { el: 'H', pos: [1.5, 0.5, -0.87], color: '#38bdf8', r: 0.38 }
    ],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [1, 7, 1]]
  },
  C2H4: {
    formula: 'C₂H₄',
    name: 'Etilen (Alken)',
    geometry: 'Tekis trigonal (120°)',
    desc: '2 ta Uglerod atomi orasida qo‘shbog‘ (C=C) va 4 ta Vodorod atomi bir tekislikda yotadi.',
    atoms: [
      { el: 'C', pos: [-0.75, 0, 0], color: '#475569', r: 0.62 },
      { el: 'C', pos: [0.75, 0, 0], color: '#475569', r: 0.62 },
      { el: 'H', pos: [-1.55, 0.95, 0], color: '#38bdf8', r: 0.38 },
      { el: 'H', pos: [-1.55, -0.95, 0], color: '#38bdf8', r: 0.38 },
      { el: 'H', pos: [1.55, 0.95, 0], color: '#38bdf8', r: 0.38 },
      { el: 'H', pos: [1.55, -0.95, 0], color: '#38bdf8', r: 0.38 }
    ],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [1, 4, 1], [1, 5, 1]]
  },
  C2H2: {
    formula: 'C₂H₂',
    name: 'Atsetilen (Alkin)',
    geometry: 'Chiziqli (180°)',
    desc: 'Uglerod atomlari orasida uchbog‘ (C≡C) mavjud bo‘lgan chiziqli molekula.',
    atoms: [
      { el: 'C', pos: [-0.65, 0, 0], color: '#475569', r: 0.6 },
      { el: 'C', pos: [0.65, 0, 0], color: '#475569', r: 0.6 },
      { el: 'H', pos: [-1.85, 0, 0], color: '#38bdf8', r: 0.38 },
      { el: 'H', pos: [1.85, 0, 0], color: '#38bdf8', r: 0.38 }
    ],
    bonds: [[0, 1, 3], [0, 2, 1], [1, 3, 1]]
  },
  C2H5OH: {
    formula: 'C₂H₅OH',
    name: 'Etanol (Etil spirti)',
    geometry: 'Tetraedrik zanjir',
    desc: 'Etil radikali (-C₂H₅) va gidroksil guruhidan (-OH) iborat organik molekula.',
    atoms: [
      { el: 'C', pos: [-1.2, -0.2, 0], color: '#475569', r: 0.58 },
      { el: 'C', pos: [0.2, 0.35, 0], color: '#475569', r: 0.58 },
      { el: 'O', pos: [1.35, -0.45, 0], color: '#ef4444', r: 0.54 },
      { el: 'H', pos: [2.15, 0.1, 0], color: '#38bdf8', r: 0.35 },
      { el: 'H', pos: [-1.95, 0.55, 0], color: '#38bdf8', r: 0.35 },
      { el: 'H', pos: [-1.35, -0.85, 0.85], color: '#38bdf8', r: 0.35 },
      { el: 'H', pos: [-1.35, -0.85, -0.85], color: '#38bdf8', r: 0.35 },
      { el: 'H', pos: [0.3, 1.0, 0.85], color: '#38bdf8', r: 0.35 },
      { el: 'H', pos: [0.3, 1.0, -0.85], color: '#38bdf8', r: 0.35 }
    ],
    bonds: [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1], [1, 7, 1], [1, 8, 1]]
  },
  C6H6: {
    formula: 'C₆H₆',
    name: 'Benzol halqasi',
    geometry: 'Tekis oltiburchak (120°)',
    desc: 'Aromatik uglevodorod: 6 ta Uglerod halqasi va ularga birikkan 6 ta Vodorod atomi.',
    atoms: [
      ...Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        return { el: 'C', pos: [Math.cos(a) * 1.45, Math.sin(a) * 1.45, 0], color: '#475569', r: 0.52 };
      }),
      ...Array.from({ length: 6 }, (_, i) => {
        const a = (i * Math.PI) / 3;
        return { el: 'H', pos: [Math.cos(a) * 2.55, Math.sin(a) * 2.55, 0], color: '#38bdf8', r: 0.34 };
      })
    ],
    bonds: [
      [0, 1, 2], [1, 2, 1], [2, 3, 2], [3, 4, 1], [4, 5, 2], [5, 0, 1],
      [0, 6, 1], [1, 7, 1], [2, 8, 1], [3, 9, 1], [4, 10, 1], [5, 11, 1]
    ]
  },
  NH3: {
    formula: 'NH₃',
    name: 'Ammiak',
    geometry: 'Trigonal piramida (107°)',
    desc: 'Azot atomi uchida va 3 ta Vodorod atomi piramida asosida joylashgan.',
    atoms: [
      { el: 'N', pos: [0, 0.55, 0], color: '#2563eb', r: 0.68 },
      { el: 'H', pos: [1.15, -0.45, 0.4], color: '#38bdf8', r: 0.42 },
      { el: 'H', pos: [-1.15, -0.45, 0.4], color: '#38bdf8', r: 0.42 },
      { el: 'H', pos: [0, -0.45, -1.15], color: '#38bdf8', r: 0.42 }
    ],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1]]
  },
  HNO3: {
    formula: 'HNO₃',
    name: 'Nitrat kislota',
    geometry: 'Tekis trigonal (120°)',
    desc: 'Markazda Azot (ko‘k), 3 ta Kislorod (qizil) va 1 ta Vodorod atomi.',
    atoms: [
      { el: 'N', pos: [0, 0, 0], color: '#2563eb', r: 0.64 },
      { el: 'O', pos: [0, 1.4, 0], color: '#ef4444', r: 0.54 },
      { el: 'O', pos: [1.25, -0.7, 0], color: '#ef4444', r: 0.54 },
      { el: 'O', pos: [-1.25, -0.7, 0], color: '#ef4444', r: 0.54 },
      { el: 'H', pos: [-2.15, -0.1, 0], color: '#38bdf8', r: 0.36 }
    ],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [3, 4, 1]]
  },
  H2SO4: {
    formula: 'H₂SO₄',
    name: 'Sulfat kislota',
    geometry: 'Tetraedrik markaz',
    desc: 'Markazda Oltingugurt (sariq), 4 ta Kislorod (qizil) va 2 ta Vodorod (havorang) atomi.',
    atoms: [
      { el: 'S', pos: [0, 0, 0], color: '#eab308', r: 0.78 },
      { el: 'O', pos: [0, 1.45, 0.8], color: '#ef4444', r: 0.55 },
      { el: 'O', pos: [0, -1.45, 0.8], color: '#ef4444', r: 0.55 },
      { el: 'O', pos: [-1.35, 0, -0.8], color: '#ef4444', r: 0.55 },
      { el: 'O', pos: [1.35, 0, -0.8], color: '#ef4444', r: 0.55 },
      { el: 'H', pos: [-2.25, 0.65, -0.8], color: '#38bdf8', r: 0.36 },
      { el: 'H', pos: [2.25, -0.65, -0.8], color: '#38bdf8', r: 0.36 }
    ],
    bonds: [[0, 1, 2], [0, 2, 2], [0, 3, 1], [0, 4, 1], [3, 5, 1], [4, 6, 1]]
  },
  H3PO4: {
    formula: 'H₃PO₄',
    name: 'Ortofosfat kislota',
    geometry: 'Tetraedr',
    desc: 'Markazda Fosfor (to‘q sariq), 4 ta Kislorod va 3 ta Vodorod atomidan tashkil topgan.',
    atoms: [
      { el: 'P', pos: [0, 0, 0], color: '#f97316', r: 0.76 },
      { el: 'O', pos: [0, 1.5, 0], color: '#ef4444', r: 0.52 },
      { el: 'O', pos: [1.35, -0.5, 0.6], color: '#ef4444', r: 0.52 },
      { el: 'O', pos: [-1.35, -0.5, 0.6], color: '#ef4444', r: 0.52 },
      { el: 'O', pos: [0, -0.5, -1.45], color: '#ef4444', r: 0.52 },
      { el: 'H', pos: [2.2, 0.1, 0.6], color: '#38bdf8', r: 0.35 },
      { el: 'H', pos: [-2.2, 0.1, 0.6], color: '#38bdf8', r: 0.35 },
      { el: 'H', pos: [0, 0.2, -2.25], color: '#38bdf8', r: 0.35 }
    ],
    bonds: [[0, 1, 2], [0, 2, 1], [0, 3, 1], [0, 4, 1], [2, 5, 1], [3, 6, 1], [4, 7, 1]]
  },
  O3: {
    formula: 'O₃',
    name: 'Ozon molekulasi',
    geometry: 'Burchakli (116.8°)',
    desc: 'Stratosferada ultrabinafsha nurlarni yutuvchi 3 ta Kislorod atomidan iborat allotropik shakl.',
    atoms: [
      { el: 'O', pos: [0, 0.5, 0], color: '#ef4444', r: 0.68 },
      { el: 'O', pos: [-1.35, -0.45, 0], color: '#dc2626', r: 0.65 },
      { el: 'O', pos: [1.35, -0.45, 0], color: '#dc2626', r: 0.65 }
    ],
    bonds: [[0, 1, 2], [0, 2, 1]]
  },
  SF6: {
    formula: 'SF₆',
    name: 'Oltingugurt geksaftorid',
    geometry: 'Oktaedr (90°)',
    desc: 'Markaziy Oltingugurt atomi atrofida 6 ta Ftor (yashil) atomi simmetrik oktaedr hosil qiladi.',
    atoms: [
      { el: 'S', pos: [0, 0, 0], color: '#eab308', r: 0.76 },
      { el: 'F', pos: [1.65, 0, 0], color: '#22c55e', r: 0.48 },
      { el: 'F', pos: [-1.65, 0, 0], color: '#22c55e', r: 0.48 },
      { el: 'F', pos: [0, 1.65, 0], color: '#22c55e', r: 0.48 },
      { el: 'F', pos: [0, -1.65, 0], color: '#22c55e', r: 0.48 },
      { el: 'F', pos: [0, 0, 1.65], color: '#22c55e', r: 0.48 },
      { el: 'F', pos: [0, 0, -1.65], color: '#22c55e', r: 0.48 }
    ],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [0, 5, 1], [0, 6, 1]]
  },
  NaCl: {
    formula: 'NaCl',
    name: 'Osh tuzi kristall panjarasi',
    geometry: 'Kubik ion panjara',
    desc: 'Natriy kationlari (binafsha) va Xlor anionlari (yashil) navbatma-navbat joylashgan kubik kristall.',
    atoms: [
      { el: 'Na', pos: [-1, -1, -1], color: '#8b5cf6', r: 0.46 },
      { el: 'Cl', pos: [1, -1, -1], color: '#22c55e', r: 0.62 },
      { el: 'Cl', pos: [-1, 1, -1], color: '#22c55e', r: 0.62 },
      { el: 'Na', pos: [1, 1, -1], color: '#8b5cf6', r: 0.46 },
      { el: 'Cl', pos: [-1, -1, 1], color: '#22c55e', r: 0.62 },
      { el: 'Na', pos: [1, -1, 1], color: '#8b5cf6', r: 0.46 },
      { el: 'Na', pos: [-1, 1, 1], color: '#8b5cf6', r: 0.46 },
      { el: 'Cl', pos: [1, 1, 1], color: '#22c55e', r: 0.62 }
    ],
    bonds: [
      [0, 1, 1], [0, 2, 1], [1, 3, 1], [2, 3, 1],
      [4, 5, 1], [4, 6, 1], [5, 7, 1], [6, 7, 1],
      [0, 4, 1], [1, 5, 1], [2, 6, 1], [3, 7, 1]
    ]
  },
  Diamond: {
    formula: 'C (Olmos)',
    name: 'Olmos kristall panjarasi',
    geometry: 'Fazoviy tetraedrik tarmoq',
    desc: 'Har bir Uglerod atomi boshqa 4 ta Uglerod atomi bilan mustahkam kovalent bog‘langan eng qattiq kristall.',
    atoms: [
      { el: 'C', pos: [0, 0, 0], color: '#38bdf8', r: 0.5 },
      { el: 'C', pos: [1.15, 1.15, 1.15], color: '#64748b', r: 0.46 },
      { el: 'C', pos: [-1.15, -1.15, 1.15], color: '#64748b', r: 0.46 },
      { el: 'C', pos: [-1.15, 1.15, -1.15], color: '#64748b', r: 0.46 },
      { el: 'C', pos: [1.15, -1.15, -1.15], color: '#64748b', r: 0.46 },
      { el: 'C', pos: [2.1, 0.3, 1.9], color: '#94a3b8', r: 0.38 },
      { el: 'C', pos: [0.3, 2.1, 1.9], color: '#94a3b8', r: 0.38 },
      { el: 'C', pos: [-2.1, -0.3, 1.9], color: '#94a3b8', r: 0.38 },
      { el: 'C', pos: [-0.3, -2.1, 1.9], color: '#94a3b8', r: 0.38 }
    ],
    bonds: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1], [1, 5, 1], [1, 6, 1], [2, 7, 1], [2, 8, 1]]
  }
};

// ==========================================
// 3. SUVDA ERUVCHANLIK JADVALI
// ==========================================
const SOLUBILITY_IONS = {
  cations: ['H⁺', 'Na⁺', 'K⁺', 'Ag⁺', 'Ca²⁺', 'Mg²⁺', 'Zn²⁺', 'Fe²⁺', 'Fe³⁺', 'Cu²⁺', 'Ba²⁺'],
  anions: ['OH⁻', 'Cl⁻', 'Br⁻', 'I⁻', 'NO₃⁻', 'SO₄²⁻', 'CO₃²⁻', 'PO₄³⁻'],
  matrix: {
    'H⁺':   ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
    'Na⁺':  ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
    'K⁺':   ['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'],
    'Ag⁺':  ['-', 'C', 'C', 'C', 'E', 'O', 'C', 'C'],
    'Ca²⁺': ['O', 'E', 'E', 'E', 'E', 'O', 'C', 'C'],
    'Mg²⁺': ['C', 'E', 'E', 'E', 'E', 'E', 'C', 'C'],
    'Zn²⁺': ['C', 'E', 'E', 'E', 'E', 'E', 'C', 'C'],
    'Fe²⁺': ['C', 'E', 'E', 'E', 'E', 'E', 'C', 'C'],
    'Fe³⁺': ['C', 'E', 'E', '-', 'E', 'E', '-', 'C'],
    'Cu²⁺': ['C', 'E', 'E', '-', 'E', 'E', '-', 'C'],
    'Ba²⁺': ['E', 'E', 'E', 'E', 'E', 'C', 'C', 'C']
  }
};

// ==========================================
// 4. INTERAKTIV THREE.JS 3D KONTROLLER KOMPONENTI
// ==========================================
function ThreeDChemistryCanvas({ mode, selectedElement, selectedMoleculeKey }) {
  const mountRef = useRef(null);
  const zoomRef = useRef(9.2);
  const rotRef = useRef({ x: 0.35, y: 0.4 });
  const autoRotateRef = useRef(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 440;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = zoomRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.15);
    dirLight1.position.set(6, 8, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.55);
    dirLight2.position.set(-6, -5, -8);
    scene.add(dirLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const electronOrbiters = [];

    if (mode === 'atom') {
      const nucleusGroup = new THREE.Group();
      const nucleonCount = Math.min(selectedElement.z * 2, 42);
      const protonMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.2 });
      const neutronMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.2 });
      const nucleonGeo = new THREE.SphereGeometry(0.22, 20, 20);

      for (let i = 0; i < nucleonCount; i++) {
        const mesh = new THREE.Mesh(nucleonGeo, i % 2 === 0 ? protonMat : neutronMat);
        const phi = Math.acos(-1 + (2 * i) / nucleonCount);
        const theta = Math.sqrt(nucleonCount * Math.PI) * phi;
        const r = nucleonCount === 1 ? 0 : 0.2 * Math.cbrt(nucleonCount);
        mesh.position.set(
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi)
        );
        nucleusGroup.add(mesh);
      }
      rootGroup.add(nucleusGroup);

      const electronGeo = new THREE.SphereGeometry(0.13, 16, 16);
      const electronMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.65
      });

      selectedElement.shells.forEach((count, shellIdx) => {
        const radius = 1.35 + shellIdx * 0.72;
        const shellGroup = new THREE.Group();
        shellGroup.rotation.x = shellIdx * 0.42 - 0.3;
        shellGroup.rotation.y = shellIdx * 0.55;

        const ringGeo = new THREE.TorusGeometry(radius, 0.02, 12, 96);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x94a3b8,
          transparent: true,
          opacity: 0.55
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        shellGroup.add(ring);

        for (let eIdx = 0; eIdx < count; eIdx++) {
          const angle = (eIdx / count) * Math.PI * 2;
          const electron = new THREE.Mesh(electronGeo, electronMat);
          electron.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
          shellGroup.add(electron);
        }

        rootGroup.add(shellGroup);
        electronOrbiters.push({ group: shellGroup, speed: 0.018 - shellIdx * 0.0018 });
      });
    } else {
      const mol = MOLECULES[selectedMoleculeKey] || MOLECULES.H2O;

      mol.atoms.forEach((atom) => {
        const geo = new THREE.SphereGeometry(atom.r, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
          color: atom.color,
          roughness: 0.25,
          metalness: 0.15
        });
        const sphere = new THREE.Mesh(geo, mat);
        sphere.position.set(...atom.pos);
        rootGroup.add(sphere);
      });

      const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.3 });
      mol.bonds.forEach(([idxA, idxB, order]) => {
        const pA = new THREE.Vector3(...mol.atoms[idxA].pos);
        const pB = new THREE.Vector3(...mol.atoms[idxB].pos);
        const dir = new THREE.Vector3().subVectors(pB, pA);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

        const offsets = order === 3 ? [-0.15, 0, 0.15] : order === 2 ? [-0.11, 0.11] : [0];
        offsets.forEach((off) => {
          const cylGeo = new THREE.CylinderGeometry(0.065, 0.065, len, 16);
          const cyl = new THREE.Mesh(cylGeo, bondMat);
          cyl.position.copy(mid);
          cyl.position.y += off;
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
          rootGroup.add(cyl);
        });
      });
    }

    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onPointerDown = (e) => {
      isDragging = true;
      autoRotateRef.current = false;
      prevX = e.clientX || e.touches?.[0]?.clientX || 0;
      prevY = e.clientY || e.touches?.[0]?.clientY || 0;
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
      const clientY = e.clientY || e.touches?.[0]?.clientY || 0;
      rotRef.current.y += (clientX - prevX) * 0.01;
      rotRef.current.x += (clientY - prevY) * 0.01;
      prevX = clientX;
      prevY = clientY;
    };

    const onPointerUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      zoomRef.current = Math.min(18, Math.max(4, zoomRef.current + e.deltaY * 0.005));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    dom.addEventListener('touchstart', onPointerDown, { passive: true });
    dom.addEventListener('touchmove', onPointerMove, { passive: true });
    dom.addEventListener('touchend', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 600;
      const h = container.clientHeight || 440;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (autoRotateRef.current) {
        rotRef.current.y += 0.006;
      }
      rootGroup.rotation.x = rotRef.current.x;
      rootGroup.rotation.y = rotRef.current.y;
      camera.position.z += (zoomRef.current - camera.position.z) * 0.1;

      electronOrbiters.forEach((orb) => {
        orb.group.rotation.z += orb.speed;
      });

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      dom.removeEventListener('touchstart', onPointerDown);
      dom.removeEventListener('touchmove', onPointerMove);
      dom.removeEventListener('touchend', onPointerUp);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [mode, selectedElement, selectedMoleculeKey]);

  return (
    <div className="relative w-full h-[360px] sm:h-[440px] rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-900 to-slate-800 overflow-hidden select-none">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700">
        <button
          onClick={() => { zoomRef.current = Math.max(4, zoomRef.current - 1.2); }}
          className="p-2 text-slate-200 hover:bg-slate-700 rounded-lg"
          title="Yaqinlashtirish"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => { zoomRef.current = Math.min(18, zoomRef.current + 1.2); }}
          className="p-2 text-slate-200 hover:bg-slate-700 rounded-lg"
          title="Uzoqlashtirish"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => {
            rotRef.current = { x: 0.35, y: 0.4 };
            zoomRef.current = 9.2;
            autoRotateRef.current = true;
          }}
          className="p-2 text-slate-200 hover:bg-slate-700 rounded-lg"
          title="Asl holatiga qaytarish"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="absolute top-3 left-3 bg-slate-900/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 text-[11px] text-slate-300">
        360° aylantirish uchun barmoq yoki sichqoncha bilan suring
      </div>
    </div>
  );
}

// ==========================================
// 5. ASOSIY O'QUV JIHOZLARI KOMPONENTI
// ==========================================
export default function StudyTools() {
  const [toolTab, setToolTab] = useState('periodic'); // 'periodic' | '3d_chem' | 'solubility' | 'desmos' | 'calc'
  const [threeDMode, setThreeDMode] = useState('atom'); // 'atom' | 'molecule'
  const [selectedEl, setSelectedEl] = useState(PERIODIC_118[5]); // Uglerod (C)
  const [selectedMol, setSelectedMol] = useState('H2O');

  const [calcExpr, setCalcExpr] = useState('');
  const [calcResult, setCalcResult] = useState('');

  const handleCalcButton = (val) => {
    if (val === 'C') {
      setCalcExpr('');
      setCalcResult('');
      return;
    }
    if (val === '⌫') {
      setCalcExpr(prev => prev.slice(0, -1));
      return;
    }
    if (val === '=') {
      try {
        const sanitized = calcExpr
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/√\(/g, 'Math.sqrt(')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/\^/g, '**');
        // eslint-disable-next-line no-new-func
        const res = Function(`"use strict"; return (${sanitized})`)();
        setCalcResult(Number.isFinite(res) ? String(Number(res.toFixed(8))) : 'Xato');
      } catch {
        setCalcResult('Xato');
      }
      return;
    }
    setCalcExpr(prev => prev + val);
  };

  return (
    <div className="space-y-5">
      {/* Yuqori bo'lim tugmalari */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap gap-2 shadow-sm">
        <button
          onClick={() => setToolTab('periodic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            toolTab === 'periodic' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Atom size={16} /> Mendeleyev Jadvali (118)
        </button>

        <button
          onClick={() => setToolTab('3d_chem')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            toolTab === '3d_chem' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Orbit size={16} /> 3D Atom & Molekulalar
        </button>

        <button
          onClick={() => setToolTab('solubility')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            toolTab === 'solubility' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <FlaskConical size={16} /> Eruvchanlik Jadvali
        </button>

        <button
          onClick={() => setToolTab('desmos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            toolTab === 'desmos' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calculator size={16} /> Desmos Grafik Kalkulyator
        </button>

        <button
          onClick={() => setToolTab('calc')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            toolTab === 'calc' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calculator size={16} /> Ilmiy Kalkulyator
        </button>
      </div>

      {/* ==========================================
          1. KLASSIK 118 ELEMENTLI MENDELEYEV DAVRIY JADVALI
          ========================================== */}
      {toolTab === 'periodic' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-900">D.I. Mendeleyev Kimyoviy Elementlar Davriy Jadvali</h2>
              <p className="text-xs text-slate-500">Istalgan element ustiga bossangiz uning 3D Atom modeli ochiladi</p>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
              {Object.entries(CAT_COLORS).map(([k, v]) => (
                <span key={k} className={`px-2 py-0.5 rounded border ${v.bg}`}>
                  {v.label}
                </span>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto pb-2">
            <div
              className="grid gap-1 min-w-[960px]"
              style={{
                gridTemplateColumns: 'repeat(18, minmax(48px, 1fr))',
                gridTemplateRows: 'repeat(10, minmax(56px, auto))'
              }}
            >
              {PERIODIC_118.map((el) => {
                const style = CAT_COLORS[el.cat]?.bg || 'bg-slate-100 border-slate-300';
                return (
                  <button
                    key={el.z}
                    onClick={() => {
                      setSelectedEl(el);
                      setThreeDMode('atom');
                      setToolTab('3d_chem');
                    }}
                    style={{ gridRow: el.r, gridColumn: el.c }}
                    className={`border rounded-lg p-1 flex flex-col justify-between text-left transition transform hover:scale-105 hover:z-10 shadow-2xs ${style}`}
                    title={`${el.z}. ${el.name} (${el.mass}) — 3D ko'rish`}
                  >
                    <div className="flex justify-between items-center w-full text-[9px] font-mono leading-none opacity-80">
                      <span>{el.z}</span>
                      <span>{el.mass}</span>
                    </div>
                    <div className="text-sm sm:text-base font-extrabold leading-tight text-center w-full">
                      {el.sym}
                    </div>
                    <div className="text-[8px] truncate w-full text-center font-medium opacity-90">
                      {el.name}
                    </div>
                  </button>
                );
              })}

              {/* 57-71 va 89-103 ko'rsatkich kataklari */}
              <div
                style={{ gridRow: 6, gridColumn: 3 }}
                className="border border-pink-300 bg-pink-50 text-pink-900 rounded-lg p-1 flex flex-col items-center justify-center text-[9px] font-bold text-center"
              >
                <span>57–71</span>
                <span>La–Lu</span>
              </div>
              <div
                style={{ gridRow: 7, gridColumn: 3 }}
                className="border border-fuchsia-300 bg-fuchsia-50 text-fuchsia-900 rounded-lg p-1 flex flex-col items-center justify-center text-[9px] font-bold text-center"
              >
                <span>89–103</span>
                <span>Ac–Lr</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          2. 3D ATOM (118 ELEMENT) VA 3D MOLEKULALAR (16 MODEL)
          ========================================== */}
      {toolTab === '3d_chem' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Interaktiv 3D Kimyo Laboratoriyasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                118 ta atomning elektron qobiqlarini hamda 16 ta molekula va kristall panjaralarni 3D formatda ko'ring
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl self-start">
              <button
                onClick={() => setThreeDMode('atom')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  threeDMode === 'atom' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                3D Atom (118 ta)
              </button>
              <button
                onClick={() => setThreeDMode('molecule')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  threeDMode === 'molecule' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                3D Molekulalar (16 ta)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ThreeDChemistryCanvas
                mode={threeDMode}
                selectedElement={selectedEl}
                selectedMoleculeKey={selectedMol}
              />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              {threeDMode === 'atom' ? (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-slate-500 block">
                      Elementni tanlang (1–118):
                    </label>
                    <select
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                      value={selectedEl.z}
                      onChange={e => {
                        const found = PERIODIC_118.find(el => el.z === Number(e.target.value));
                        if (found) setSelectedEl(found);
                      }}
                    >
                      {PERIODIC_118.map(el => (
                        <option key={el.z} value={el.z}>
                          {el.z}. {el.sym} — {el.name}
                        </option>
                      ))}
                    </select>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl font-extrabold text-blue-600">{selectedEl.sym}</span>
                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">
                          Tartib raqami: {selectedEl.z}
                        </span>
                      </div>
                      <div className="text-base font-bold text-slate-900">{selectedEl.name}</div>
                      <div className="text-xs text-slate-600">Nisbiy atom massa: <b>{selectedEl.mass}</b></div>
                      <div className="text-xs text-slate-600">
                        Toifa: <b>{CAT_COLORS[selectedEl.cat]?.label}</b>
                      </div>
                      <div className="pt-2 border-t border-slate-200 text-xs">
                        <span className="text-slate-500 block mb-1">Elektron qobiqlar taqsimoti:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEl.shells.map((cnt, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-lg font-mono font-bold">
                              {idx + 1}-qobiq: {cnt}e⁻
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500 mr-1" /> Protonlar &nbsp;
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 mr-1" /> Neytronlar &nbsp;
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1" /> Elektronlar
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase text-slate-500 block">
                    Molekula yoki Kristallni tanlang (16 ta):
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-3 gap-1.5 max-h-[190px] overflow-y-auto pr-1">
                    {Object.entries(MOLECULES).map(([key, m]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedMol(key)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition truncate ${
                          selectedMol === key
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-blue-500'
                        }`}
                      >
                        {m.formula}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="text-2xl font-extrabold text-blue-600">
                      {MOLECULES[selectedMol].formula}
                    </div>
                    <div className="text-base font-bold text-slate-900">
                      {MOLECULES[selectedMol].name}
                    </div>
                    <div className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg inline-block font-semibold">
                      Geometriyasi: {MOLECULES[selectedMol].geometry}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pt-1">
                      {MOLECULES[selectedMol].desc}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          3. SUVDA ERUVCHANLIK JADVALI
          ========================================== */}
      {toolTab === 'solubility' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Kislota, Asos va Tuzlarning Suvda Eruvchanlik Jadvali</h2>
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg">E — Eriydi</span>
              <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-lg">O — Oz eriydi</span>
              <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-lg">C — Cho'kma (Erimaydi)</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-center text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="border border-slate-200 p-2.5">Ionlar</th>
                  {SOLUBILITY_IONS.cations.map(cat => (
                    <th key={cat} className="border border-slate-200 p-2.5 font-bold">{cat}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SOLUBILITY_IONS.anions.map((an, aIdx) => (
                  <tr key={an}>
                    <td className="border border-slate-200 p-2.5 font-bold bg-slate-50">{an}</td>
                    {SOLUBILITY_IONS.cations.map(cat => {
                      const val = SOLUBILITY_IONS.matrix[cat][aIdx];
                      const style =
                        val === 'E'
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : val === 'C'
                          ? 'bg-rose-50 text-rose-700 font-bold'
                          : val === 'O'
                          ? 'bg-amber-50 text-amber-700 font-bold'
                          : 'text-slate-400';
                      return (
                        <td key={cat + an} className={`border border-slate-200 p-2.5 ${style}`}>
                          {val}
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

      {/* ==========================================
          4. DESMOS GRAFIK KALKULYATOR
          ========================================== */}
      {toolTab === 'desmos' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm">
          <iframe
            src="https://www.desmos.com/calculator?lang=ru"
            title="Desmos Graphing Calculator"
            className="w-full h-[520px] rounded-xl border border-slate-200"
          />
        </div>
      )}

      {/* ==========================================
          5. ILMIY KALKULYATOR
          ========================================== */}
      {toolTab === 'calc' && (
        <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="bg-slate-900 text-white p-4 rounded-xl text-right font-mono">
            <div className="text-xs text-slate-400 min-h-[18px] break-all">{calcExpr || '0'}</div>
            <div className="text-2xl font-extrabold mt-1 text-emerald-400">{calcResult || '0'}</div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              'sin(', 'cos(', 'tan(', '√(',
              'log(', '^', 'π', '⌫',
              '7', '8', '9', '÷',
              '4', '5', '6', '×',
              '1', '2', '3', '-',
              'C', '0', '=', '+'
            ].map(btn => (
              <button
                key={btn}
                onClick={() => handleCalcButton(btn)}
                className={`py-3 rounded-xl font-bold text-sm transition ${
                  btn === '='
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : btn === 'C'
                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                    : 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                }`}
              >
                {btn}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}