import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, OrbitControls, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { lightingObj, cameraObj } from './theatreTimeline';

interface NodeData {
  id: string;
  name: string;
  repo: string;
  color: string;
  size: number;
  position: [number, number, number];
  prCount?: number;
}

interface Scene3DProps {
  repositories?: string[];
  activeRepo?: string | null;
  onSelectRepo?: (repo: string | null) => void;
  interactive?: boolean;
}

// Particle field representing git commits
function GitCommitField({ count = 800 }: { count?: number }) {
  const pointsRef = useRef<THREE.Points>(null!);

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const basePalette = [
      new THREE.Color('#38bdf8'), // Sky
      new THREE.Color('#818cf8'), // Indigo
      new THREE.Color('#34d399'), // Emerald
      new THREE.Color('#f472b6'), // Pink
      new THREE.Color('#fbbf24')  // Amber
    ];

    for (let i = 0; i < count; i++) {
      // Cylindrical/spherical dispersion
      const radius = 4 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      pos[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      pos[i * 3 + 1] = radius * Math.sin(phi);
      pos[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const color = basePalette[Math.floor(Math.random() * basePalette.length)];
      col[i * 3] = color.r;
      col[i * 3 + 1] = color.g;
      col[i * 3 + 2] = color.b;
    }
    return [pos, col];
  }, [count]);

  useFrame((_, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.03;
      pointsRef.current.rotation.x += delta * 0.01;
    }
  });

  return (
    <Points ref={pointsRef} positions={positions} colors={colors} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.06}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
}

// 3D Core with shifty distortion and pulsing rings
function CentralCore({ activeRepo }: { activeRepo?: string | null }) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef1 = useRef<THREE.Mesh>(null!);
  const ringRef2 = useRef<THREE.Mesh>(null!);
  const [lightIntensity, setLightIntensity] = useState(1.5);

  useEffect(() => {
    try {
      if (lightingObj && typeof lightingObj.onValuesChange === 'function') {
        const unsubscribe = lightingObj.onValuesChange((values) => {
          if (values && typeof values.intensity === 'number') {
            setLightIntensity(values.intensity);
          }
        });
        return () => unsubscribe();
      }
    } catch {
      // Safe fallback
    }
  }, []);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.4;
      ringRef1.current.rotation.x += delta * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.y += delta * 0.35;
      ringRef2.current.rotation.z -= delta * 0.15;
    }
  });

  const coreColor = activeRepo ? '#ec4899' : '#06b6d4';

  return (
    <group position={[0, 0, 0]}>
      {/* Central Pulsing Sphere */}
      <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.2, 3]} />
          <MeshDistortMaterial
            color={coreColor}
            emissive={coreColor}
            emissiveIntensity={0.6 * lightIntensity}
            roughness={0.2}
            metalness={0.8}
            distort={0.4}
            speed={2.5}
            wireframe={false}
          />
        </mesh>
      </Float>

      {/* Outer Wireframe Cage */}
      <mesh>
        <icosahedronGeometry args={[1.6, 1]} />
        <meshStandardMaterial
          color="#38bdf8"
          wireframe
          transparent
          opacity={0.35}
        />
      </mesh>

      {/* Orbit Tech Rings */}
      <mesh ref={ringRef1} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.3, 0.02, 16, 100]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
      </mesh>
      <mesh ref={ringRef2} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[2.8, 0.015, 16, 100]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.45} />
      </mesh>
    </group>
  );
}

// Interactive Repository Nodes revolving around the core
function RepoNode({
  node,
  isSelected,
  onClick
}: {
  node: NodeData;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.8}>
      <group position={node.position}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            setHovered(false);
            document.body.style.cursor = 'auto';
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          scale={hovered ? 1.4 : isSelected ? 1.25 : 1.0}
        >
          <dodecahedronGeometry args={[node.size, 0]} />
          <meshStandardMaterial
            color={hovered || isSelected ? '#ffffff' : node.color}
            emissive={node.color}
            emissiveIntensity={hovered || isSelected ? 1.2 : 0.4}
            roughness={0.2}
            metalness={0.7}
            wireframe={!hovered && !isSelected}
          />
        </mesh>
      </group>
    </Float>
  );
}

// Connect nodes with light lines
function OrbitConstellation({
  nodes,
  activeRepo,
  onSelectRepo
}: {
  nodes: NodeData[];
  activeRepo?: string | null;
  onSelectRepo?: (repo: string | null) => void;
}) {
  return (
    <group>
      {nodes.map((node) => (
        <RepoNode
          key={node.id}
          node={node}
          isSelected={activeRepo === node.repo}
          onClick={() => {
            if (onSelectRepo) {
              onSelectRepo(activeRepo === node.repo ? null : node.repo);
            }
          }}
        />
      ))}
    </group>
  );
}

// Camera parallax controller
function CameraRig() {
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    try {
      if (cameraObj && typeof cameraObj.onValuesChange === 'function') {
        const unsub = cameraObj.onValuesChange((val) => {
          if (val && typeof val.zoom === 'number') {
            setZoomLevel(val.zoom);
          }
        });
        return () => unsub();
      }
    } catch {
      // Safe fallback
    }
  }, []);

  useFrame((state) => {
    const targetX = (state.pointer.x * 0.8);
    const targetY = (state.pointer.y * 0.5);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, targetX, 0.05);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, targetY, 0.05);
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 6.5 / zoomLevel, 0.05);
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function Scene3D({
  repositories = [],
  activeRepo = null,
  onSelectRepo,
  interactive = true
}: Scene3DProps) {
  // Generate orbital nodes for major repositories
  const nodes = useMemo<NodeData[]>(() => {
    const defaultRepos = [
      { repo: 'kubernetes/kubernetes', color: '#0284c7', size: 0.35 },
      { repo: 'kubernetes-sigs/kueue', color: '#38bdf8', size: 0.32 },
      { repo: 'kubernetes-sigs/lws', color: '#818cf8', size: 0.28 },
      { repo: 'kubernetes-sigs/kubebuilder', color: '#a855f7', size: 0.29 },
      { repo: 'kubernetes-sigs/karpenter', color: '#f43f5e', size: 0.30 },
      { repo: 'argoproj/argo-cd', color: '#f59e0b', size: 0.28 },
      { repo: 'backstage/backstage', color: '#10b981', size: 0.27 },
      { repo: 'headlamp-k8s/headlamp', color: '#06b6d4', size: 0.25 }
    ];

    const targetList = repositories.length > 0 
      ? repositories.slice(0, 8).map((r, i) => {
          const match = defaultRepos.find(d => d.repo.toLowerCase() === r.toLowerCase());
          return match || {
            repo: r,
            color: ['#38bdf8', '#818cf8', '#34d399', '#f472b6', '#fbbf24', '#a855f7'][i % 6],
            size: 0.28
          };
        })
      : defaultRepos;

    return targetList.map((item, index) => {
      const angle = (index / targetList.length) * Math.PI * 2;
      const radius = 3.2 + (index % 2 === 0 ? 0.4 : -0.3);
      const y = (index % 2 === 0 ? 0.6 : -0.6) + Math.sin(index) * 0.4;
      return {
        id: `node-${index}`,
        name: item.repo.split('/')[1] || item.repo,
        repo: item.repo,
        color: item.color,
        size: item.size,
        position: [
          Math.cos(angle) * radius,
          y,
          Math.sin(angle) * radius
        ]
      };
    });
  }, [repositories]);

  return (
    <div className="scene-3d-wrapper" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [0, 0, 6.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
        <pointLight position={[-10, -10, -5]} intensity={1.0} color="#a855f7" />
        <pointLight position={[0, 0, 0]} intensity={2.0} color="#06b6d4" />

        <CentralCore activeRepo={activeRepo} />
        <OrbitConstellation
          nodes={nodes}
          activeRepo={activeRepo}
          onSelectRepo={onSelectRepo}
        />
        <GitCommitField count={700} />
        <CameraRig />

        {interactive && (
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            maxPolarAngle={Math.PI / 1.7}
            minPolarAngle={Math.PI / 2.3}
            rotateSpeed={0.5}
          />
        )}
      </Canvas>

      {/* Floating Interactive 3D Legend */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs text-slate-400 pointer-events-none z-10">
        <span className="flex items-center gap-1.5 backdrop-blur-md bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          Interactive 3D Galaxy (R3F) &bull; Click nodes to filter
        </span>
        {activeRepo && (
          <span className="backdrop-blur-md bg-pink-500/20 text-pink-300 px-3 py-1.5 rounded-full border border-pink-500/30">
            Selected: {activeRepo.split('/')[1] || activeRepo}
          </span>
        )}
      </div>
    </div>
  );
}
