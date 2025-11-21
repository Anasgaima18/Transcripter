import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, MeshDistortMaterial, Float } from '@react-three/drei';

const AnimatedSphere = () => {
    const sphereRef = useRef();

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        // Subtle rotation
        sphereRef.current.rotation.x = t * 0.1;
        sphereRef.current.rotation.y = t * 0.15;
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere ref={sphereRef} args={[1, 100, 100]} scale={2}>
                <MeshDistortMaterial
                    color="#00F0FF" // Neon Cyan
                    attach="material"
                    distort={0.4} // Liquid effect
                    speed={1.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </Sphere>
        </Float>
    );
};

const ThreeBackground = () => {
    return (
        <div className="fixed inset-0 -z-10 bg-[#050511]">
            <Canvas camera={{ position: [0, 0, 5] }}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -5]} intensity={1} color="#7000FF" />

                {/* Main Liquid Sphere */}
                <group position={[2, 0, 0]}>
                    <AnimatedSphere />
                </group>

                {/* Secondary Sphere (Deep Purple) */}
                <group position={[-2, -1, -2]}>
                    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.6}>
                        <Sphere args={[0.8, 100, 100]} scale={1.5}>
                            <MeshDistortMaterial
                                color="#7000FF"
                                attach="material"
                                distort={0.5}
                                speed={2}
                                roughness={0.2}
                                metalness={0.6}
                            />
                        </Sphere>
                    </Float>
                </group>

            </Canvas>

            {/* Overlay to ensure text readability if needed, though solid colors usually pop well */}
            <div className="absolute inset-0 bg-[#050511]/30 backdrop-blur-[1px]" />
        </div>
    );
};

export default ThreeBackground;
