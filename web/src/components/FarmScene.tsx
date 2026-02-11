'use client';

import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Environment } from '@react-three/drei';
import * as THREE from 'three';

/* ─── Kawaii Dog ─── */
function KawaiiDog({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!);
  const tailRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 8) * 0.3;
    }
  });

  return (
    <group ref={ref} position={position}>
      {/* Body */}
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial color="#dba456" roughness={0.6} />
      </mesh>
      {/* Belly */}
      <mesh position={[0, 0.35, 0.15]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#f0d48a" roughness={0.7} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.85, 0.18]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#dba456" roughness={0.5} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.78, 0.44]}>
        <sphereGeometry args={[0.14, 32, 32]} />
        <meshStandardMaterial color="#f0d48a" roughness={0.6} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.82, 0.57]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#2d1810" roughness={0.3} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.12, 0.92, 0.40]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      <mesh position={[0.12, 0.92, 0.40]}>
        <sphereGeometry args={[0.065, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      {/* Eye reflections */}
      <mesh position={[-0.10, 0.94, 0.45]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.14, 0.94, 0.45]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      {/* Cheek blush */}
      <mesh position={[-0.22, 0.82, 0.36]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff9999" transparent opacity={0.35} roughness={0.8} />
      </mesh>
      <mesh position={[0.22, 0.82, 0.36]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff9999" transparent opacity={0.35} roughness={0.8} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.22, 1.08, 0.05]} rotation={[0.3, 0, -0.4]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#b5763a" roughness={0.6} />
      </mesh>
      <mesh position={[0.22, 1.08, 0.05]} rotation={[0.3, 0, 0.4]}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial color="#b5763a" roughness={0.6} />
      </mesh>
      {/* Legs */}
      {[[-0.16, 0], [0.16, 0], [-0.12, 0.02], [0.12, 0.02]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]}>
          <capsuleGeometry args={[0.07, 0.14, 8, 16]} />
          <meshStandardMaterial color="#b5763a" roughness={0.7} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.55, -0.35]} rotation={[0.8, 0, 0]}>
        <capsuleGeometry args={[0.04, 0.2, 8, 16]} />
        <meshStandardMaterial color="#c2813d" roughness={0.6} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 0.68, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.18, 0.025, 8, 32]} />
        <meshStandardMaterial color="#dc2626" roughness={0.4} />
      </mesh>
      {/* Collar tag */}
      <mesh position={[0, 0.62, 0.28]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Tongue */}
      <mesh position={[0, 0.72, 0.52]} rotation={[0.3, 0, 0]}>
        <capsuleGeometry args={[0.035, 0.06, 8, 16]} />
        <meshStandardMaterial color="#f87171" roughness={0.6} />
      </mesh>
    </group>
  );
}

/* ─── Kawaii Cat ─── */
function KawaiiCat({ position }: { position: [number, number, number] }) {
  const tailRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2.5) * 0.4;
      tailRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 1.8) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.38, 0]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.5} />
      </mesh>
      {/* Belly */}
      <mesh position={[0, 0.32, 0.12]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#ddd6fe" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.78, 0.12]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#a78bfa" roughness={0.5} />
      </mesh>
      {/* Ears - triangular via cones */}
      <mesh position={[-0.18, 1.05, 0.08]} rotation={[0.1, 0, -0.2]}>
        <coneGeometry args={[0.1, 0.2, 4]} />
        <meshStandardMaterial color="#9370db" roughness={0.5} />
      </mesh>
      <mesh position={[0.18, 1.05, 0.08]} rotation={[0.1, 0, 0.2]}>
        <coneGeometry args={[0.1, 0.2, 4]} />
        <meshStandardMaterial color="#9370db" roughness={0.5} />
      </mesh>
      {/* Inner ears */}
      <mesh position={[-0.18, 1.04, 0.12]} rotation={[0.1, 0, -0.2]}>
        <coneGeometry args={[0.055, 0.12, 4]} />
        <meshStandardMaterial color="#fbb9c4" roughness={0.6} />
      </mesh>
      <mesh position={[0.18, 1.04, 0.12]} rotation={[0.1, 0, 0.2]}>
        <coneGeometry args={[0.055, 0.12, 4]} />
        <meshStandardMaterial color="#fbb9c4" roughness={0.6} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.1, 0.84, 0.34]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.84, 0.34]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.3} />
      </mesh>
      <mesh position={[-0.1, 0.84, 0.39]}>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshStandardMaterial color="#22c55e" roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 0.84, 0.39]}>
        <sphereGeometry args={[0.048, 16, 16]} />
        <meshStandardMaterial color="#22c55e" roughness={0.3} />
      </mesh>
      <mesh position={[-0.1, 0.85, 0.42]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      <mesh position={[0.1, 0.85, 0.42]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      {/* Eye reflections */}
      <mesh position={[-0.08, 0.87, 0.44]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.12, 0.87, 0.44]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.77, 0.40]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.4} />
      </mesh>
      {/* Cheek blush */}
      <mesh position={[-0.20, 0.76, 0.30]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#ff99aa" transparent opacity={0.3} roughness={0.8} />
      </mesh>
      <mesh position={[0.20, 0.76, 0.30]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#ff99aa" transparent opacity={0.3} roughness={0.8} />
      </mesh>
      {/* Whiskers */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {[0.02, -0.02, 0].map((yOff, i) => (
            <mesh key={i} position={[side * 0.28, 0.76 + yOff, 0.36 + i * 0.01]} rotation={[0, 0, side * 0.1 * (i + 1)]}>
              <boxGeometry args={[0.16, 0.006, 0.006]} />
              <meshStandardMaterial color="#d8b4fe" roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
      {/* Legs */}
      {[[-0.13, 0], [0.13, 0], [-0.10, 0.02], [0.10, 0.02]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.1, z]}>
          <capsuleGeometry args={[0.06, 0.10, 8, 16]} />
          <meshStandardMaterial color="#9370db" roughness={0.6} />
        </mesh>
      ))}
      {/* Paws */}
      {[[-0.13, 0], [0.13, 0], [-0.10, 0.02], [0.10, 0.02]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z + 0.02]}>
          <sphereGeometry args={[0.06, 16, 16]} />
          <meshStandardMaterial color="#e0d5f7" roughness={0.5} />
        </mesh>
      ))}
      {/* Tail */}
      <group ref={tailRef} position={[0, 0.5, -0.30]}>
        <mesh rotation={[0.6, 0, 0]} position={[0, 0.12, -0.05]}>
          <capsuleGeometry args={[0.04, 0.28, 8, 16]} />
          <meshStandardMaterial color="#9370db" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

/* ─── Kawaii Ferret ─── */
function KawaiiFerret({ position }: { position: [number, number, number] }) {
  const tailRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Body - elongated */}
      <mesh position={[0, 0.30, 0]} scale={[0.8, 0.7, 1.3]}>
        <sphereGeometry args={[0.32, 32, 32]} />
        <meshStandardMaterial color="#e8a834" roughness={0.5} />
      </mesh>
      {/* Belly */}
      <mesh position={[0, 0.25, 0.05]} scale={[0.7, 0.5, 1.1]}>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color="#fde68a" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.62, 0.25]}>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color="#e8a834" roughness={0.5} />
      </mesh>
      {/* Face mask */}
      <mesh position={[0, 0.60, 0.38]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#6b4423" roughness={0.6} transparent opacity={0.4} />
      </mesh>
      {/* Forehead patch */}
      <mesh position={[0, 0.72, 0.34]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#fde68a" roughness={0.5} transparent opacity={0.6} />
      </mesh>
      {/* Ears */}
      <mesh position={[-0.14, 0.80, 0.18]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#d4943e" roughness={0.6} />
      </mesh>
      <mesh position={[0.14, 0.80, 0.18]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#d4943e" roughness={0.6} />
      </mesh>
      <mesh position={[-0.14, 0.80, 0.22]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#fde68a" roughness={0.6} transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.14, 0.80, 0.22]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial color="#fde68a" roughness={0.6} transparent opacity={0.5} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.08, 0.66, 0.42]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      <mesh position={[0.08, 0.66, 0.42]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      <mesh position={[-0.07, 0.68, 0.46]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.09, 0.68, 0.46]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.59, 0.46]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshStandardMaterial color="#2d1810" roughness={0.3} />
      </mesh>
      {/* Cheek blush */}
      <mesh position={[-0.16, 0.58, 0.36]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#ff9999" transparent opacity={0.3} roughness={0.8} />
      </mesh>
      <mesh position={[0.16, 0.58, 0.36]}>
        <sphereGeometry args={[0.04, 16, 16]} />
        <meshStandardMaterial color="#ff9999" transparent opacity={0.3} roughness={0.8} />
      </mesh>
      {/* Legs */}
      {[[-0.12, -0.15], [0.12, -0.15], [-0.10, 0.20], [0.10, 0.20]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.08, z]}>
          <capsuleGeometry args={[0.05, 0.08, 8, 16]} />
          <meshStandardMaterial color="#b5763a" roughness={0.6} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.35, -0.40]} rotation={[0.5, 0, 0]}>
        <capsuleGeometry args={[0.045, 0.30, 8, 16]} />
        <meshStandardMaterial color="#c98a20" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Kawaii Pig ─── */
function KawaiiPig({ position }: { position: [number, number, number] }) {
  const tailRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 6) * 0.4;
    }
  });

  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.40, 0]}>
        <sphereGeometry args={[0.38, 32, 32]} />
        <meshStandardMaterial color="#fbb9c4" roughness={0.5} />
      </mesh>
      {/* Belly */}
      <mesh position={[0, 0.34, 0.12]}>
        <sphereGeometry args={[0.28, 32, 32]} />
        <meshStandardMaterial color="#fce4ec" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.82, 0.15]}>
        <sphereGeometry args={[0.30, 32, 32]} />
        <meshStandardMaterial color="#fbb9c4" roughness={0.5} />
      </mesh>
      {/* Snout */}
      <mesh position={[0, 0.76, 0.42]}>
        <sphereGeometry args={[0.13, 32, 32]} />
        <meshStandardMaterial color="#f4819a" roughness={0.4} />
      </mesh>
      {/* Nostrils */}
      <mesh position={[-0.04, 0.76, 0.54]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#c14060" roughness={0.4} />
      </mesh>
      <mesh position={[0.04, 0.76, 0.54]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#c14060" roughness={0.4} />
      </mesh>
      {/* Ears - floppy */}
      <mesh position={[-0.20, 1.05, 0.10]} rotation={[0.4, 0.3, -0.8]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#f4819a" roughness={0.5} />
      </mesh>
      <mesh position={[0.20, 1.05, 0.10]} rotation={[0.4, -0.3, 0.8]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#f4819a" roughness={0.5} />
      </mesh>
      <mesh position={[-0.20, 1.04, 0.14]} rotation={[0.4, 0.3, -0.8]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#fda4af" roughness={0.6} />
      </mesh>
      <mesh position={[0.20, 1.04, 0.14]} rotation={[0.4, -0.3, 0.8]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#fda4af" roughness={0.6} />
      </mesh>
      {/* Eyes */}
      <mesh position={[-0.11, 0.88, 0.38]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      <mesh position={[0.11, 0.88, 0.38]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#111" roughness={0.2} />
      </mesh>
      <mesh position={[-0.10, 0.90, 0.42]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.12, 0.90, 0.42]}>
        <sphereGeometry args={[0.022, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      {/* Eyelashes */}
      <mesh position={[-0.14, 0.93, 0.37]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.04, 0.008, 0.008]} />
        <meshStandardMaterial color="#d4546c" />
      </mesh>
      <mesh position={[0.14, 0.93, 0.37]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.04, 0.008, 0.008]} />
        <meshStandardMaterial color="#d4546c" />
      </mesh>
      {/* Cheek blush */}
      <mesh position={[-0.22, 0.80, 0.30]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff8899" transparent opacity={0.35} roughness={0.8} />
      </mesh>
      <mesh position={[0.22, 0.80, 0.30]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ff8899" transparent opacity={0.35} roughness={0.8} />
      </mesh>
      {/* Legs */}
      {[[-0.16, -0.02], [0.16, -0.02], [-0.12, 0.05], [0.12, 0.05]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.10, z]}>
          <capsuleGeometry args={[0.065, 0.10, 8, 16]} />
          <meshStandardMaterial color="#f4819a" roughness={0.6} />
        </mesh>
      ))}
      {/* Hooves */}
      {[[-0.16, -0.02], [0.16, -0.02], [-0.12, 0.05], [0.12, 0.05]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshStandardMaterial color="#d4546c" roughness={0.5} />
        </mesh>
      ))}
      {/* Curly tail */}
      <mesh ref={tailRef} position={[0, 0.58, -0.36]} rotation={[0.5, 0, 0]}>
        <torusGeometry args={[0.06, 0.02, 8, 16, Math.PI * 1.5]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Kawaii Goat ─── */
function KawaiiGoat({ position }: { position: [number, number, number] }) {
  const tailRef = useRef<THREE.Mesh>(null!);
  const bellRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (tailRef.current) {
      tailRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 4) * 0.2;
    }
    if (bellRef.current) {
      bellRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.15;
    }
  });

  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.42, 0]}>
        <sphereGeometry args={[0.36, 32, 32]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
      {/* Belly */}
      <mesh position={[0, 0.36, 0.12]}>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color="#f3f4f6" roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.85, 0.16]}>
        <sphereGeometry args={[0.26, 32, 32]} />
        <meshStandardMaterial color="#f0f0f2" roughness={0.5} />
      </mesh>
      {/* Horns */}
      <mesh position={[-0.12, 1.12, 0.04]} rotation={[0.2, 0, -0.5]}>
        <coneGeometry args={[0.04, 0.22, 8]} />
        <meshStandardMaterial color="#c9a06c" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0.12, 1.12, 0.04]} rotation={[0.2, 0, 0.5]}>
        <coneGeometry args={[0.04, 0.22, 8]} />
        <meshStandardMaterial color="#c9a06c" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Ears - horizontal */}
      <mesh position={[-0.28, 0.90, 0.10]} rotation={[0, 0, -0.8]}>
        <capsuleGeometry args={[0.04, 0.10, 8, 16]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.6} />
      </mesh>
      <mesh position={[0.28, 0.90, 0.10]} rotation={[0, 0, 0.8]}>
        <capsuleGeometry args={[0.04, 0.10, 8, 16]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.6} />
      </mesh>
      {/* Eyes - rectangular pupils */}
      <mesh position={[-0.10, 0.90, 0.36]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.3} />
      </mesh>
      <mesh position={[0.10, 0.90, 0.36]}>
        <sphereGeometry args={[0.055, 16, 16]} />
        <meshStandardMaterial color="#fef3c7" roughness={0.3} />
      </mesh>
      <mesh position={[-0.10, 0.90, 0.40]}>
        <boxGeometry args={[0.05, 0.03, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
      </mesh>
      <mesh position={[0.10, 0.90, 0.40]}>
        <boxGeometry args={[0.05, 0.03, 0.02]} />
        <meshStandardMaterial color="#1a1a2e" roughness={0.2} />
      </mesh>
      {/* Eye reflections */}
      <mesh position={[-0.09, 0.92, 0.42]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.11, 0.92, 0.42]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="white" emissive="white" emissiveIntensity={0.5} />
      </mesh>
      {/* Nose */}
      <mesh position={[0, 0.82, 0.40]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.5} />
      </mesh>
      {/* Nostrils */}
      <mesh position={[-0.02, 0.81, 0.44]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.5} />
      </mesh>
      <mesh position={[0.02, 0.81, 0.44]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#9ca3af" roughness={0.5} />
      </mesh>
      {/* Beard */}
      <mesh position={[0, 0.68, 0.38]} rotation={[-0.3, 0, 0]}>
        <coneGeometry args={[0.04, 0.15, 6]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.6} />
      </mesh>
      {/* Cheek blush */}
      <mesh position={[-0.20, 0.82, 0.30]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#fda4af" transparent opacity={0.25} roughness={0.8} />
      </mesh>
      <mesh position={[0.20, 0.82, 0.30]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#fda4af" transparent opacity={0.25} roughness={0.8} />
      </mesh>
      {/* Bell */}
      <mesh ref={bellRef} position={[0, 0.62, 0.25]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial color="#fbbf24" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.68, 0.22]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.14, 0.015, 8, 32]} />
        <meshStandardMaterial color="#d97706" roughness={0.4} />
      </mesh>
      {/* Legs */}
      {[[-0.14, -0.02], [0.14, -0.02], [-0.11, 0.04], [0.11, 0.04]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.12, z]}>
          <capsuleGeometry args={[0.055, 0.14, 8, 16]} />
          <meshStandardMaterial color="#b8bcc2" roughness={0.6} />
        </mesh>
      ))}
      {/* Hooves */}
      {[[-0.14, -0.02], [0.14, -0.02], [-0.11, 0.04], [0.11, 0.04]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.02, z]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color="#6b7280" roughness={0.5} />
        </mesh>
      ))}
      {/* Tail */}
      <mesh ref={tailRef} position={[0, 0.55, -0.32]} rotation={[0.8, 0, 0]}>
        <capsuleGeometry args={[0.03, 0.12, 8, 16]} />
        <meshStandardMaterial color="#d1d5db" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Animated group that walks across ─── */
function AnimalParade() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      // Slowly move from left to right, looping
      const t = (state.clock.elapsedTime * 0.15) % 1; // 0..1 over ~6.67s
      const x = -5 + t * 12; // from -5 to +7
      groupRef.current.position.x = x;

      // Gentle bobbing
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.2} rotationIntensity={0} floatIntensity={0.1} floatingRange={[-0.02, 0.02]}>
        <KawaiiDog position={[-2.0, 0, 0]} />
      </Float>
      <Float speed={1.0} rotationIntensity={0} floatIntensity={0.1} floatingRange={[-0.02, 0.02]}>
        <KawaiiCat position={[-0.8, 0, 0.2]} />
      </Float>
      <Float speed={1.4} rotationIntensity={0} floatIntensity={0.08} floatingRange={[-0.015, 0.015]}>
        <KawaiiFerret position={[0.3, 0, -0.1]} />
      </Float>
      <Float speed={1.1} rotationIntensity={0} floatIntensity={0.12} floatingRange={[-0.02, 0.02]}>
        <KawaiiPig position={[1.5, 0, 0.15]} />
      </Float>
      <Float speed={0.9} rotationIntensity={0} floatIntensity={0.1} floatingRange={[-0.02, 0.02]}>
        <KawaiiGoat position={[2.7, 0, 0]} />
      </Float>
    </group>
  );
}

/* ─── Ground with grass ─── */
function Ground() {
  const grassPositions = useMemo(() => {
    const pos: [number, number, number][] = [];
    for (let i = 0; i < 60; i++) {
      pos.push([
        (Math.random() - 0.5) * 14,
        0.06,
        (Math.random() - 0.5) * 4 + 1
      ]);
    }
    return pos;
  }, []);

  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[16, 6]} />
        <meshStandardMaterial color="#4ade80" roughness={0.8} />
      </mesh>
      {/* Darker back strip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, -2]}>
        <planeGeometry args={[16, 2]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} />
      </mesh>
      {/* Small grass tufts */}
      {grassPositions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <coneGeometry args={[0.03, 0.12, 4]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#16a34a' : i % 3 === 1 ? '#22c55e' : '#15803d'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/* ─── Flowers ─── */
function Flowers() {
  const flowers = useMemo(() => {
    const f: { pos: [number, number, number]; color: string; scale: number }[] = [];
    const colors = ['#fda4af', '#c4b5fd', '#fde68a', '#93c5fd', '#fbcfe8', '#a5b4fc', '#fca5a5', '#86efac'];
    for (let i = 0; i < 18; i++) {
      f.push({
        pos: [(Math.random() - 0.5) * 12, 0.08, (Math.random() - 0.3) * 3 + 0.5],
        color: colors[i % colors.length],
        scale: 0.6 + Math.random() * 0.5,
      });
    }
    return f;
  }, []);

  return (
    <group>
      {flowers.map((f, i) => (
        <group key={i} position={f.pos} scale={f.scale}>
          {/* Stem */}
          <mesh position={[0, 0.06, 0]}>
            <capsuleGeometry args={[0.01, 0.10, 4, 8]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} />
          </mesh>
          {/* Petals */}
          {[0, 72, 144, 216, 288].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            return (
              <mesh key={angle} position={[Math.cos(rad) * 0.04, 0.14, Math.sin(rad) * 0.04]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color={f.color} roughness={0.5} />
              </mesh>
            );
          })}
          {/* Center */}
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial color="#fef08a" roughness={0.5} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Trees (background) ─── */
function Trees() {
  return (
    <group>
      {[[-5, -2.5], [-2, -3], [4, -2.8], [6.5, -2.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          {/* Trunk */}
          <mesh position={[0, 0.4, 0]}>
            <capsuleGeometry args={[0.08, 0.6, 8, 16]} />
            <meshStandardMaterial color="#713f12" roughness={0.8} />
          </mesh>
          {/* Foliage */}
          <mesh position={[0, 1.0, 0]}>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshStandardMaterial color="#166534" roughness={0.7} transparent opacity={0.8} />
          </mesh>
          <mesh position={[-0.15, 1.2, 0.1]}>
            <sphereGeometry args={[0.38, 16, 16]} />
            <meshStandardMaterial color="#15803d" roughness={0.7} transparent opacity={0.75} />
          </mesh>
          <mesh position={[0.18, 1.1, -0.1]}>
            <sphereGeometry args={[0.35, 16, 16]} />
            <meshStandardMaterial color="#14532d" roughness={0.7} transparent opacity={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* ─── Fence ─── */
function Fence() {
  return (
    <group position={[0, 0, -1.2]}>
      {Array.from({ length: 14 }, (_, i) => (
        <group key={i}>
          {/* Post */}
          <mesh position={[-7 + i * 1.1, 0.18, 0]}>
            <boxGeometry args={[0.06, 0.36, 0.06]} />
            <meshStandardMaterial color="#78350f" roughness={0.8} transparent opacity={0.35} />
          </mesh>
        </group>
      ))}
      {/* Rails */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[15.4, 0.04, 0.04]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} transparent opacity={0.25} />
      </mesh>
      <mesh position={[0, 0.14, 0]}>
        <boxGeometry args={[15.4, 0.04, 0.04]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

/* ─── Clouds ─── */
function Cloud({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const ref = useRef<THREE.Group>(null!);
  const speed = useMemo(() => 0.08 + Math.random() * 0.06, []);
  const startX = useMemo(() => position[0], [position]);

  useFrame((state) => {
    if (ref.current) {
      const x = ((state.clock.elapsedTime * speed + (startX + 8) / 16) % 1) * 16 - 8;
      ref.current.position.x = x;
    }
  });

  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.9} transparent opacity={0.7} />
      </mesh>
      <mesh position={[-0.3, 0.05, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.9} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0.35, 0, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.9} transparent opacity={0.65} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.9} transparent opacity={0.75} />
      </mesh>
    </group>
  );
}

/* ─── Butterflies ─── */
function Butterfly({ color = '#c084fc', startPos }: { color?: string; startPos: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null!);
  const wingRef = useRef<THREE.Group>(null!);
  const seed = useMemo(() => Math.random() * 100, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime + seed;
    if (ref.current) {
      ref.current.position.x = startPos[0] + Math.sin(t * 0.4) * 2;
      ref.current.position.y = startPos[1] + Math.sin(t * 0.6) * 0.3;
      ref.current.position.z = startPos[2] + Math.cos(t * 0.3) * 0.5;
      ref.current.rotation.y = Math.sin(t * 0.4) * 0.5;
    }
    if (wingRef.current) {
      wingRef.current.scale.x = 0.4 + Math.abs(Math.sin(t * 8)) * 0.6;
    }
  });

  return (
    <group ref={ref} position={startPos}>
      <group ref={wingRef}>
        <mesh position={[-0.05, 0, 0]} rotation={[0, 0, 0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0.05, 0, 0]} rotation={[0, 0, -0.3]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={color} transparent opacity={0.7} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Body */}
      <mesh>
        <capsuleGeometry args={[0.01, 0.06, 4, 8]} />
        <meshStandardMaterial color="#333" roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ─── Sun ─── */
function Sun() {
  return (
    <group position={[5, 3.5, -5]}>
      <mesh>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="#fde68a" emissive="#fcd34d" emissiveIntensity={0.8} roughness={0.2} />
      </mesh>
      {/* Glow */}
      <mesh>
        <sphereGeometry args={[0.7, 32, 32]} />
        <meshStandardMaterial color="#fbbf24" transparent opacity={0.15} roughness={0.1} />
      </mesh>
    </group>
  );
}

/* ─── Hills (background) ─── */
function Hills() {
  return (
    <group>
      {/* Far hills */}
      <mesh position={[-3, 0.3, -4]} scale={[4, 0.8, 1.5]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#86efac" roughness={0.8} transparent opacity={0.7} />
      </mesh>
      <mesh position={[3, 0.2, -4.5]} scale={[3.5, 0.6, 1.2]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d1fae5" roughness={0.8} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0, 0.15, -3.5]} scale={[5, 0.5, 1]}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#bbf7d0" roughness={0.8} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

/* ─── Main Scene ─── */
function Scene() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#fff5e6" />
      <directionalLight position={[-3, 3, 2]} intensity={0.3} color="#e0e7ff" />

      <Sun />
      <Hills />
      <Trees />
      <Fence />
      <Ground />
      <Flowers />
      <AnimalParade />

      <Cloud position={[-4, 2.8, -3]} scale={0.8} />
      <Cloud position={[1, 3.2, -4]} scale={0.6} />
      <Cloud position={[5, 2.5, -3.5]} scale={0.7} />

      <Butterfly color="#c084fc" startPos={[-1, 1.5, 0.5]} />
      <Butterfly color="#fb923c" startPos={[2, 1.2, 0.3]} />

      <Environment preset="sunset" environmentIntensity={0.2} />
    </>
  );
}

export default function FarmScene() {
  return (
    <div className="relative w-full h-52 sm:h-60">
      <Canvas
        camera={{ position: [0, 1.8, 5.5], fov: 40 }}
        dpr={[1, 2]}
        style={{ background: 'linear-gradient(to bottom, #e0e7ff30, #dcfce740)' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
}
