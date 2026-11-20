import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Calculator, Atom, FlaskConical, Orbit, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';

// ==========================================
// 1. KIMYOVIY ELEMENTLAR MA'LUMOTLARI (3D UCHUN)
// ==========================================
const ELEMENTS = [
  { z: 1, sym: 'H', name: 'Vodorod', mass: '1.008', group: 'Nometall', color: '#3b82f6', shells: [1] },
  { z: 2, sym: 'He', name: 'Geliy', mass: '4.0026', group: 'Inert gaz', color: '#06b6d4', shells: [2] },
  { z: 3, sym: 'Li', name: 'Litiy', mass: '6.94', group: 'Ishqoriy metall', color: '#ef4444', shells: [2, 1] },
  { z: 4, sym: 'Be', name: 'Berilliy', mass: '9.0122', group: 'Ishqoriy-yer', color: '#f97316', shells: [2, 2] },
  { z: 5, sym: 'B', name: 'Bor', mass: '10.81', group: 'Metalloid', color: '#10b981', shells: [2, 3] },
  { z: 6, sym: 'C', name: 'Uglerod', mass: '12.011', group: 'Nometall', color: '#64748b', shells: [2, 4] },
  { z: 7, sym: 'N', name: 'Azot', mass: '14.007', group: 'Nometall', color: '#2563eb', shells: [2, 5] },
  { z: 8, sym: 'O', name: 'Kislorod', mass: '15.999', group: 'Nometall', color: '#dc2626', shells: [2, 6] },
  { z: 9, sym: 'F', name: 'Ftor', mass: '18.998', group: 'Galogen', color: '#16a34a', shells: [2, 7] },
  { z: 10, sym: 'Ne', name: 'Neon', mass: '20.180', group: 'Inert gaz', color: '#0891b2', shells: [2, 8] },
  { z: 11, sym: 'Na', name: 'Natriy', mass: '22.990', group: 'Ishqoriy metall', color: '#8b5cf6', shells: [2, 8, 1] },
  { z: 12, sym: 'Mg', name: 'Magniy', mass: '24.305', group: 'Ishqoriy-yer', color: '#f59e0b', shells: [2, 8, 2] },
  { z: 13, sym: 'Al', name: 'Alyuminiy', mass: '26.982', group: 'Metall', color: '#94a3b8', shells: [2, 8, 3] },
  { z: 14, sym: 'Si', name: 'Kremniy', mass: '28.085', group: 'Metalloid', color: '#0d9488', shells: [2, 8, 4] },
  { z: 15, sym: 'P', name: 'Fosfor', mass: '30.974', group: 'Nometall', color: '#ea580c', shells: [2, 8, 5] },
  { z: 16, sym: 'S', name: 'Oltingugurt', mass: '32.06', group: 'Nometall', color: '#eab308', shells: [2, 8, 6] },
  { z: 17, sym: 'Cl', name: 'Xlor', mass: '35.45', group: 'Galogen', color: '#22c55e', shells: [2, 8, 7] },
  { z: 18, sym: 'Ar', name: 'Argon', mass: '39.948', group: 'Inert gaz', color: '#0284c7', shells: [2, 8, 8] },
  { z: 19, sym: 'K', name: 'Kaliy', mass: '39.098', group: 'Ishqoriy metall', color: '#a855f7', shells: [2, 8, 8, 1] },
  { z: 20, sym: 'Ca', name: 'Kalsiy', mass: '40.078', group: 'Ishqoriy-yer', color: '#d97706', shells: [2, 8, 8, 2] },
  { z: 26, sym: 'Fe', name: 'Temir', mass: '55.845', group: 'O‘tuvchi metall', color: '#b45309', shells: [2, 8, 14, 2] },
  { z: 29, sym: 'Cu', name: 'Mis', mass: '63.546', group: 'O‘tuvchi metall', color: '#c2410c', shells: [2, 8, 18, 1] },
  { z: 30, sym: 'Zn', name: 'Rux', mass: '65.38', group: 'O‘tuvchi metall', color: '#64748b', shells: [2, 8, 18, 2] },
  { z: 47, sym: 'Ag', name: 'Kumush', mass: '107.87', group: 'O‘tuvchi metall', color: '#cbd5e1', shells: [2, 8, 18, 18, 1] },
  { z: 79, sym: 'Au', name: 'Oltin', mass: '196.97', group: 'O‘tuvchi metall', color: '#facc15', shells: [2, 8, 18, 32, 18, 1] }
];

// ==========================================
// 2. 3D MOLEKULALAR BAZASI
// ==========================================
const MOLECULES = {
  H2O: {
    formula: 'H₂O',
    name: 'Suv molekulasi',
    geometry: 'Burchakli (104.5°)',
    desc: '1 ta Kislorod (qizil) va 2 ta Vodorod (oq-ko‘k) atomidan iborat qutbli molekula.',
    atoms: [
      { el: 'O', pos: [0, 0.3, 0], color: '#ef4444', r: 0.72 },
      { el: 'H', pos: [-1.15, -0.55, 0], color: '#38bdf8', r: 0.44 },
      { el: 'H', pos: [1.15, -0.55, 0], color: '#38bdf8', r: 0.44 }
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
  H2SO4: {
    formula: 'H₂SO₄',
    name: 'Sulfat kislota',
    geometry: 'Tetraedrik markaz',
    desc: 'Markazda Oltingugurt (sariq), 4 ta Kislorod (qizil) va 2 ta Vodorod (ko‘k) atomi.',
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
  const zoomRef = useRef(8.5);
  const rotRef = useRef({ x: 0.35, y: 0.4 });
  const autoRotateRef = useRef(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 420;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = zoomRef.current;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Yoritish (Studio lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.1);
    dirLight1.position.set(6, 8, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x60a5fa, 0.5);
    dirLight2.position.set(-6, -5, -8);
    scene.add(dirLight2);

    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    const electronOrbiters = [];

    if (mode === 'atom') {
      // YADRO (Proton va Neytronlar klasteri)
      const nucleusGroup = new THREE.Group();
      const nucleonCount = Math.min(selectedElement.z * 2, 36);
      const protonMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.2 });
      const neutronMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.3, metalness: 0.2 });
      const nucleonGeo = new THREE.SphereGeometry(0.24, 20, 20);

      for (let i = 0; i < nucleonCount; i++) {
        const mesh = new THREE.Mesh(nucleonGeo, i % 2 === 0 ? protonMat : neutronMat);
        const phi = Math.acos(-1 + (2 * i) / nucleonCount);
        const theta = Math.sqrt(nucleonCount * Math.PI) * phi;
        const r = nucleonCount === 1 ? 0 : 0.22 * Math.cbrt(nucleonCount);
        mesh.position.set(
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi)
        );
        nucleusGroup.add(mesh);
      }
      rootGroup.add(nucleusGroup);

      // ELEKTRON QOBIQLARI VA HARAKATLANUVCHI ELEKTRONLAR
      const electronGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const electronMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.6
      });

      selectedElement.shells.forEach((count, shellIdx) => {
        const radius = 1.45 + shellIdx * 0.85;
        const shellGroup = new THREE.Group();
        shellGroup.rotation.x = (shellIdx * 0.45) - 0.3;
        shellGroup.rotation.y = shellIdx * 0.6;

        // Orbita halqasi
        const ringGeo = new THREE.TorusGeometry(radius, 0.022, 12, 96);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x94a3b8,
          transparent: true,
          opacity: 0.55
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        shellGroup.add(ring);

        // Qobiqdagi elektronlar
        for (let eIdx = 0; eIdx < count; eIdx++) {
          const angle = (eIdx / count) * Math.PI * 2;
          const electron = new THREE.Mesh(electronGeo, electronMat);
          electron.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
          shellGroup.add(electron);
        }

        rootGroup.add(shellGroup);
        electronOrbiters.push({ group: shellGroup, speed: 0.018 - shellIdx * 0.002 });
      });
    } else {
      // 3D MOLEKULA MODELI
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

      // Bog'lar (Silindrlar)
      const bondMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.3 });
      mol.bonds.forEach(([idxA, idxB, order]) => {
        const pA = new THREE.Vector3(...mol.atoms[idxA].pos);
        const pB = new THREE.Vector3(...mol.atoms[idxB].pos);
        const dir = new THREE.Vector3().subVectors(pB, pA);
        const len = dir.length();
        const mid = new THREE.Vector3().addVectors(pA, pB).multiplyScalar(0.5);

        const offsets = order === 2 ? [-0.11, 0.11] : [0];
        offsets.forEach((off) => {
          const cylGeo = new THREE.CylinderGeometry(0.075, 0.075, len, 16);
          const cyl = new THREE.Mesh(cylGeo, bondMat);
          cyl.position.copy(mid);
          cyl.position.y += off;
          cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
          rootGroup.add(cyl);
        });
      });
    }

    // Sichqoncha va barmoq bilan aylantirish
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
      zoomRef.current = Math.min(16, Math.max(4, zoomRef.current + e.deltaY * 0.005));
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
      const h = container.clientHeight || 420;
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

      {/* 3D Boshqaruv tugmalari */}
      <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-900/80 backdrop-blur-md p-1.5 rounded-xl border border-slate-700">
        <button
          onClick={() => { zoomRef.current = Math.max(4, zoomRef.current - 1.2); }}
          className="p-2 text-slate-200 hover:bg-slate-700 rounded-lg"
          title="Yaqinlashtirish"
        >
          <ZoomIn size={16} />
        </button>
        <button
          onClick={() => { zoomRef.current = Math.min(16, zoomRef.current + 1.2); }}
          className="p-2 text-slate-200 hover:bg-slate-700 rounded-lg"
          title="Uzoqlashtirish"
        >
          <ZoomOut size={16} />
        </button>
        <button
          onClick={() => {
            rotRef.current = { x: 0.35, y: 0.4 };
            zoomRef.current = 8.5;
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
  const [toolTab, setToolTab] = useState('3d_chem'); // '3d_chem' | 'periodic' | 'solubility' | 'desmos' | 'calc'
  const [threeDMode, setThreeDMode] = useState('atom'); // 'atom' | 'molecule'
  const [selectedEl, setSelectedEl] = useState(ELEMENTS[5]); // Uglerod (C)
  const [selectedMol, setSelectedMol] = useState('H2O');

  // Ilmiy kalkulyator
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
          onClick={() => setToolTab('3d_chem')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            toolTab === '3d_chem' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Orbit size={16} /> 3D Atom & Molekulalar
        </button>

        <button
          onClick={() => setToolTab('periodic')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
            toolTab === 'periodic' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Atom size={16} /> Mendeleyev Jadvali
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
          1. 3D ATOM VA 3D MOLEKULALAR LABORATORIYASI
          ========================================== */}
      {toolTab === '3d_chem' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Interaktiv 3D Kimyo Laboratoriyasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Atomlarning elektron qobiqlarini va molekulalarning fazoviy tuzilishini 3D formatda o'rganing
              </p>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl self-start">
              <button
                onClick={() => setThreeDMode('atom')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  threeDMode === 'atom' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                3D Atom (Bor modeli)
              </button>
              <button
                onClick={() => setThreeDMode('molecule')}
                className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition ${
                  threeDMode === 'molecule' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                3D Molekulalar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chap tomonda 3D sahna */}
            <div className="lg:col-span-2">
              <ThreeDChemistryCanvas
                mode={threeDMode}
                selectedElement={selectedEl}
                selectedMoleculeKey={selectedMol}
              />
            </div>

            {/* O'ng tomonda tanlash va ma'lumot paneli */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              {threeDMode === 'atom' ? (
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-slate-500 block">
                      Elementni tanlang:
                    </label>
                    <select
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold"
                      value={selectedEl.z}
                      onChange={e => {
                        const found = ELEMENTS.find(el => el.z === Number(e.target.value));
                        if (found) setSelectedEl(found);
                      }}
                    >
                      {ELEMENTS.map(el => (
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
                      <div className="text-xs text-slate-600">Toifa: <b>{selectedEl.group}</b></div>
                      <div className="pt-2 border-t border-slate-200 text-xs">
                        <span className="text-slate-500 block mb-1">Elektron qobiqlar taqsimoti:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedEl.shells.map((cnt, idx) => (
                            <span key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg font-mono font-bold">
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
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-slate-500 block">
                      Molekulani tanlang:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(MOLECULES).map(([key, m]) => (
                        <button
                          key={key}
                          onClick={() => setSelectedMol(key)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition ${
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          2. MENDELEYEV DAVRIY JADVALI (3D GA O'TISH TUGMASI BILAN)
          ========================================== */}
      {toolTab === 'periodic' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-sm">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Mendeleyev Kimyoviy Elementlar Jadvali</h2>
            <span className="text-xs text-slate-500">Istalgan element ustiga bossangiz 3D atom modeli ochiladi</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {ELEMENTS.map(el => (
              <div
                key={el.z}
                onClick={() => {
                  setSelectedEl(el);
                  setThreeDMode('atom');
                  setToolTab('3d_chem');
                }}
                className="cursor-pointer bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-500 rounded-2xl p-3.5 transition flex flex-col justify-between"
              >
                <div className="flex justify-between items-center text-xs text-slate-500 font-mono">
                  <span>{el.z}</span>
                  <span>{el.mass}</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 my-1">{el.sym}</div>
                <div className="text-xs font-semibold text-slate-700 truncate">{el.name}</div>
                <div className="text-[10px] text-blue-600 font-semibold mt-1">3D ko'rish →</div>
              </div>
            ))}
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