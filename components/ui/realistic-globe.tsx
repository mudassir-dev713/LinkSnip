'use client';

import { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Stars, useTexture } from '@react-three/drei';
import * as THREE from 'three';

// Comprehensive country data with accurate coordinates
const COUNTRY_COORDINATES = {
  Afghanistan: { lat: 33.9391, lng: 67.71 },
  Albania: { lat: 41.1533, lng: 20.1683 },
  Algeria: { lat: 28.0339, lng: 1.6596 },
  Argentina: { lat: -38.4161, lng: -63.6167 },
  Armenia: { lat: 40.0691, lng: 45.0382 },
  Australia: { lat: -25.2744, lng: 133.7751 },
  Austria: { lat: 47.5162, lng: 14.5501 },
  Azerbaijan: { lat: 40.1431, lng: 47.5769 },
  Bahrain: { lat: 25.9304, lng: 50.6378 },
  Bangladesh: { lat: 23.685, lng: 90.3563 },
  Belarus: { lat: 53.7098, lng: 27.9534 },
  Belgium: { lat: 50.5039, lng: 4.4699 },
  Bolivia: { lat: -16.2902, lng: -63.5887 },
  'Bosnia and Herzegovina': { lat: 43.9159, lng: 17.6791 },
  Brazil: { lat: -14.235, lng: -51.9253 },
  Bulgaria: { lat: 42.7339, lng: 25.4858 },
  Cambodia: { lat: 12.5657, lng: 104.991 },
  Canada: { lat: 56.1304, lng: -106.3468 },
  Chile: { lat: -35.6751, lng: -71.543 },
  China: { lat: 35.8617, lng: 104.1954 },
  Colombia: { lat: 4.5709, lng: -74.2973 },
  Croatia: { lat: 45.1, lng: 15.2 },
  'Czech Republic': { lat: 49.8175, lng: 15.473 },
  Denmark: { lat: 56.2639, lng: 9.5018 },
  Ecuador: { lat: -1.8312, lng: -78.1834 },
  Egypt: { lat: 26.0975, lng: 30.0444 },
  Estonia: { lat: 58.5953, lng: 25.0136 },
  Ethiopia: { lat: 9.145, lng: 40.4897 },
  Finland: { lat: 61.9241, lng: 25.7482 },
  France: { lat: 46.6034, lng: 1.8883 },
  Georgia: { lat: 42.3154, lng: 43.3569 },
  Germany: { lat: 51.1657, lng: 10.4515 },
  Ghana: { lat: 7.9465, lng: -1.0232 },
  Greece: { lat: 39.0742, lng: 21.8243 },
  Hungary: { lat: 47.1625, lng: 19.5033 },
  Iceland: { lat: 64.9631, lng: -19.0208 },
  India: { lat: 20.5937, lng: 78.9629 },
  Indonesia: { lat: -0.7893, lng: 113.9213 },
  Iran: { lat: 32.4279, lng: 53.688 },
  Iraq: { lat: 33.2232, lng: 43.6793 },
  Ireland: { lat: 53.4129, lng: -8.2439 },
  Israel: { lat: 31.0461, lng: 34.8516 },
  Italy: { lat: 41.8719, lng: 12.5674 },
  Japan: { lat: 36.2048, lng: 138.2529 },
  Jordan: { lat: 30.5852, lng: 36.2384 },
  Kazakhstan: { lat: 48.0196, lng: 66.9237 },
  Kenya: { lat: -0.0236, lng: 37.9062 },
  Kuwait: { lat: 29.3117, lng: 47.4818 },
  Latvia: { lat: 56.8796, lng: 24.6032 },
  Lebanon: { lat: 33.8547, lng: 35.8623 },
  Lithuania: { lat: 55.1694, lng: 23.8813 },
  Luxembourg: { lat: 49.8153, lng: 6.1296 },
  Malaysia: { lat: 4.2105, lng: 101.9758 },
  Mexico: { lat: 23.6345, lng: -102.5528 },
  Morocco: { lat: 31.7917, lng: -7.0926 },
  Netherlands: { lat: 52.1326, lng: 5.2913 },
  'New Zealand': { lat: -40.9006, lng: 174.886 },
  Nigeria: { lat: 9.082, lng: 8.6753 },
  Norway: { lat: 60.472, lng: 8.4689 },
  Pakistan: { lat: 30.3753, lng: 69.3451 },
  Peru: { lat: -9.19, lng: -75.0152 },
  Philippines: { lat: 12.8797, lng: 121.774 },
  Poland: { lat: 51.9194, lng: 19.1451 },
  Portugal: { lat: 39.3999, lng: -8.2245 },
  Qatar: { lat: 25.3548, lng: 51.1839 },
  Romania: { lat: 45.9432, lng: 24.9668 },
  Russia: { lat: 61.524, lng: 105.3188 },
  'Saudi Arabia': { lat: 23.8859, lng: 45.0792 },
  Serbia: { lat: 44.0165, lng: 21.0059 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  Slovakia: { lat: 48.669, lng: 19.699 },
  Slovenia: { lat: 46.1512, lng: 14.9955 },
  'South Africa': { lat: -30.5595, lng: 22.9375 },
  'South Korea': { lat: 35.9078, lng: 127.7669 },
  Spain: { lat: 40.4637, lng: -3.7492 },
  'Sri Lanka': { lat: 7.8731, lng: 80.7718 },
  Sweden: { lat: 60.1282, lng: 18.6435 },
  Switzerland: { lat: 46.8182, lng: 8.2275 },
  Taiwan: { lat: 23.6978, lng: 120.9605 },
  Thailand: { lat: 15.87, lng: 100.9925 },
  Turkey: { lat: 38.9637, lng: 35.2433 },
  Ukraine: { lat: 48.3794, lng: 31.1656 },
  'United Arab Emirates': { lat: 23.4241, lng: 53.8478 },
  'United Kingdom': { lat: 55.3781, lng: -3.436 },
  'United States': { lat: 37.0902, lng: -95.7129 },
  Uruguay: { lat: -32.5228, lng: -55.7658 },
  Venezuela: { lat: 6.4238, lng: -66.5897 },
  Vietnam: { lat: 14.0583, lng: 108.2772 },
  Zimbabwe: { lat: -19.0154, lng: 29.1549 },
};

// Convert lat/lng to 3D coordinates on sphere
function latLngToVector3(lat, lng, radius = 2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Cloud layer component
function CloudLayer() {
  const cloudRef = useRef();
  const cloudTexture = useTexture('/assets/3d/clouds.png');

  useFrame((state) => {
    if (cloudRef.current) {
      cloudRef.current.rotation.y += 0.0005; // Slower than Earth rotation
    }
  });

  return (
    <mesh ref={cloudRef}>
      <sphereGeometry args={[2.02, 64, 64]} />
      <meshLambertMaterial
        map={cloudTexture}
        transparent
        opacity={0.4}
        depthWrite={false}
      />
    </mesh>
  );
}

// Country marker component
function CountryMarker({ country, position, clicks, maxClicks }) {
  const [hovered, setHovered] = useState(false);
  const markerRef = useRef();

  const intensity = Math.min(clicks / maxClicks, 1);
  const height = 0.05 + intensity * 0.25;
  const color = new THREE.Color().setHSL(
    0.6 - intensity * 0.3,
    0.8,
    0.5 + intensity * 0.3
  );

  useFrame((state) => {
    if (markerRef.current) {
      const scale = hovered ? 1.2 : 1;
      markerRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={position}>
      {/* Main marker */}
      <mesh
        ref={markerRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <cylinderGeometry args={[0.015, 0.025, height, 8]} />
        <meshStandardMaterial
          color={color}
          emissive={color.clone().multiplyScalar(0.3)}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>

      {/* Pulsing ring */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, height / 2 + 0.01, 0]}
      >
        <ringGeometry args={[0.03, 0.05, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4 + Math.sin(Date.now() * 0.003) * 0.3}
        />
      </mesh>

      {/* Tooltip */}
      {hovered && (
        <Html position={[0, height + 0.15, 0]} center>
          <div className="bg-black/90 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap pointer-events-none shadow-lg border border-white/20">
            <div className="font-bold text-blue-300">{country}</div>
            <div className="text-gray-300">
              {clicks.toLocaleString()} clicks
            </div>
            <div className="text-xs text-gray-400">
              {((clicks / maxClicks) * 100).toFixed(1)}% of total
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

// Main Earth component
function Earth({ countryData }) {
  const earthRef = useRef();
  const { scene } = useThree();

  // Load high-quality textures
  const [dayTexture, nightTexture, bumpTexture, specularTexture] = useTexture([
    '/assets/3d/earth-day.jpg',
    '/assets/3d/earth-night.jpg',
    '/assets/3d/earth-bump.jpg',
    '/assets/3d/earth-specular.jpg',
  ]);

  // Configure textures
  useEffect(() => {
    [dayTexture, nightTexture, bumpTexture, specularTexture].forEach(
      (texture) => {
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.anisotropy = 16;
      }
    );
  }, [dayTexture, nightTexture, bumpTexture, specularTexture]);

  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.001;
    }
  });

  // Process country data
  const processedCountryData = useMemo(() => {
    if (!countryData || countryData.length === 0) return [];

    const maxClicks = Math.max(...countryData.map((c) => c.clicks));

    return countryData
      .map((country) => {
        const coords = COUNTRY_COORDINATES[country.country];
        if (!coords) return null;

        return {
          ...country,
          position: latLngToVector3(coords.lat, coords.lng, 2.05),
          maxClicks,
        };
      })
      .filter(Boolean);
  }, [countryData]);

  return (
    <group>
      {/* Earth sphere */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[2, 128, 128]} />
        <meshPhongMaterial
          map={dayTexture}
          bumpMap={bumpTexture}
          bumpScale={0.02}
          specularMap={specularTexture}
          specular={new THREE.Color(0x444444)}
          shininess={100}
        />
      </mesh>

      {/* Cloud layer */}
      <CloudLayer />

      {/* Country markers */}
      {processedCountryData.map((country, index) => (
        <CountryMarker
          key={index}
          country={country.country}
          position={country.position}
          clicks={country.clicks}
          maxClicks={country.maxClicks}
        />
      ))}
    </group>
  );
}

// Lighting setup
function Lighting() {
  return (
    <>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.2} />

      {/* Main directional light (sun) */}
      <directionalLight
        position={[5, 3, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Fill light */}
      <directionalLight
        position={[-3, 1, -5]}
        intensity={0.3}
        color="#4080ff"
      />

      {/* Rim light */}
      <pointLight position={[0, 0, 8]} intensity={0.5} color="#ffffff" />
    </>
  );
}

// Main scene component
function Scene({ countryData }) {
  return (
    <>
      {/* Starry background */}
      <Stars
        radius={300}
        depth={60}
        count={20000}
        factor={7}
        saturation={0}
        fade
        speed={0.5}
      />

      {/* Lighting */}
      <Lighting />

      {/* Earth with countries */}
      <Suspense fallback={null}>
        <Earth countryData={countryData} />
      </Suspense>
    </>
  );
}

// Main component
interface RealisticGlobeProps {
  countryData: Array<{
    country: string;
    clicks: number;
    percentage?: number;
  }>;
  className?: string;
}

export function RealisticGlobe({
  countryData,
  className = '',
}: RealisticGlobeProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 5], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        shadows
      >
        <Scene countryData={countryData} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minDistance={3}
          maxDistance={12}
          autoRotate={false}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          panSpeed={0.8}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI - Math.PI / 6}
        />
      </Canvas>
    </div>
  );
}
