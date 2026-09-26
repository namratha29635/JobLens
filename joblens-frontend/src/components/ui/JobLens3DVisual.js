import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ShieldCheck, Sparkles, CheckCircle2, Search, Cpu } from 'lucide-react';

export default function JobLens3DVisual({ className = '', style = {} }) {
  const mountRef = useRef(null);
  const [activeChip, setActiveChip] = useState('legit');
  const [interactiveMode, setInteractiveMode] = useState('auto'); // 'auto' | 'user'

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let animationFrameId;
    let renderer;
    let isDisposed = false;

    // Window dimensions
    const width = mount.clientWidth || 600;
    const height = mount.clientHeight || 360;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 14);

    // 2. Renderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('WebGL init fallback:', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const cyanPoint = new THREE.PointLight(0x06b6d4, 2.5, 50);
    cyanPoint.position.set(-6, 5, 8);
    scene.add(cyanPoint);

    const indigoPoint = new THREE.PointLight(0x6366f1, 2.8, 50);
    indigoPoint.position.set(6, -4, 8);
    scene.add(indigoPoint);

    const emeraldPoint = new THREE.PointLight(0x10b981, 2.0, 50);
    emeraldPoint.position.set(0, -6, 5);
    scene.add(emeraldPoint);

    // 4. Central 3D Holographic "JobLens" Core Object
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // 4a. Faceted Crystal Core (Icosahedron)
    const crystalGeo = new THREE.IcosahedronGeometry(2.4, 0);
    const crystalMat = new THREE.MeshPhongMaterial({
      color: 0x4f46e5,
      emissive: 0x1e1b4b,
      specular: 0x06b6d4,
      shininess: 90,
      transparent: true,
      opacity: 0.82,
      flatShading: true,
    });
    const crystalMesh = new THREE.Mesh(crystalGeo, crystalMat);
    coreGroup.add(crystalMesh);

    // 4b. Wireframe outline overlay for technical / holographic look
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0xa5b4fc,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const wireframeMesh = new THREE.Mesh(crystalGeo, wireframeMat);
    wireframeMesh.scale.set(1.02, 1.02, 1.02);
    coreGroup.add(wireframeMesh);

    // 4c. Inner glowing core node
    const innerGeo = new THREE.OctahedronGeometry(1.2, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.9,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // 5. Holographic Orbital Concentric Verification Rings
    // Ring 1 (Outer Cyan Ring)
    const ring1Geo = new THREE.TorusGeometry(3.6, 0.04, 16, 100);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.85,
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    // Ring 2 (Middle Indigo Ring)
    const ring2Geo = new THREE.TorusGeometry(4.2, 0.035, 16, 100);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.75,
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    coreGroup.add(ring2);

    // Ring 3 (Equatorial Emerald Verification Ring)
    const ring3Geo = new THREE.TorusGeometry(4.8, 0.04, 16, 100);
    const ring3Mat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.7,
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = Math.PI / 2;
    coreGroup.add(ring3);

    // 6. Holographic AI Laser Scanner Plane (Oscillates vertically through the core)
    const scannerGeo = new THREE.RingGeometry(0.1, 4.0, 48);
    const scannerMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    const scannerPlane = new THREE.Mesh(scannerGeo, scannerMat);
    scannerPlane.rotation.x = Math.PI / 2;
    coreGroup.add(scannerPlane);

    // 7. Verification Particle Swarm (Data packets / jobs analyzed)
    const particleCount = 140;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);

    const cyanColor = new THREE.Color(0x06b6d4);
    const greenColor = new THREE.Color(0x10b981);
    const indigoColor = new THREE.Color(0xa5b4fc);

    for (let i = 0; i < particleCount; i++) {
      // Elliptical distribution
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;
      const r = 3.2 + Math.random() * 3.4;

      particlePositions[i * 3] = r * Math.cos(phi) * Math.sin(theta);
      particlePositions[i * 3 + 1] = (r * Math.sin(phi)) * 0.8;
      particlePositions[i * 3 + 2] = r * Math.cos(phi) * Math.cos(theta);

      // Random color selection
      const pick = Math.random();
      const col = pick < 0.45 ? cyanColor : pick < 0.75 ? greenColor : indigoColor;
      particleColors[i * 3] = col.r;
      particleColors[i * 3 + 1] = col.g;
      particleColors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    coreGroup.add(particlePoints);

    // 8. Mouse & Touch Interaction Tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;
    let isPointerOver = false;

    const handlePointerMove = (e) => {
      const rect = mount.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotationY = x * 1.8;
      targetRotationX = -y * 1.4;
      isPointerOver = true;
    };

    const handlePointerLeave = () => {
      isPointerOver = false;
    };

    mount.addEventListener('pointermove', handlePointerMove, { passive: true });
    mount.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    // Touch support for mobile phones
    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        setInteractiveMode('user');
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        const deltaX = (e.touches[0].clientX - touchStartX) * 0.01;
        const deltaY = (e.touches[0].clientY - touchStartY) * 0.01;
        targetRotationY += deltaX;
        targetRotationX += deltaY;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };

    mount.addEventListener('touchstart', handleTouchStart, { passive: true });
    mount.addEventListener('touchmove', handleTouchMove, { passive: true });

    // 9. Resize Handling
    const handleResize = () => {
      if (!mount || isDisposed) return;
      const newWidth = mount.clientWidth || 600;
      const newHeight = mount.clientHeight || 360;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    // 10. Visibility Observer (Pause rendering when offscreen to conserve CPU/battery)
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    });
    intersectionObserver.observe(mount);

    // 11. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      if (isDisposed) return;
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible || document.hidden) return;

      const elapsed = clock.getElapsedTime();

      // Continuous autonomous idle animations
      crystalMesh.rotation.y = elapsed * 0.45;
      crystalMesh.rotation.x = elapsed * 0.25;

      wireframeMesh.rotation.y = -elapsed * 0.35;
      wireframeMesh.rotation.z = elapsed * 0.2;

      innerMesh.rotation.x = -elapsed * 0.6;
      innerMesh.rotation.y = elapsed * 0.8;

      ring1.rotation.z = elapsed * 0.35;
      ring2.rotation.x = -elapsed * 0.25;
      ring3.rotation.z = -elapsed * 0.3;

      // Laser Scanner oscillation
      scannerPlane.position.y = Math.sin(elapsed * 2.2) * 2.2;
      const scanPulse = (Math.sin(elapsed * 4.4) + 1) * 0.5;
      scannerMat.opacity = 0.2 + scanPulse * 0.35;

      // Particle orbit drift
      particlePoints.rotation.y = elapsed * 0.15;
      particlePoints.rotation.x = Math.sin(elapsed * 0.5) * 0.1;

      // Interactive Inertial dampening
      if (isPointerOver) {
        currentRotationX += (targetRotationX - currentRotationX) * 0.08;
        currentRotationY += (targetRotationY - currentRotationY) * 0.08;
      } else {
        // Return gently to smooth float
        const autoFloatY = Math.sin(elapsed * 0.8) * 0.25;
        const autoFloatX = Math.cos(elapsed * 0.6) * 0.15;
        currentRotationX += (autoFloatX - currentRotationX) * 0.04;
        currentRotationY += (autoFloatY - currentRotationY) * 0.04;
      }

      coreGroup.rotation.x = currentRotationX;
      coreGroup.rotation.y = currentRotationY;

      // Slight breathing pulse
      const breathe = 1 + Math.sin(elapsed * 1.5) * 0.03;
      coreGroup.scale.set(breathe, breathe, breathe);

      renderer.render(scene, camera);
    };

    animate();

    // 12. Cleanup
    return () => {
      isDisposed = true;
      cancelAnimationFrame(animationFrameId);

      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      mount.removeEventListener('pointermove', handlePointerMove);
      mount.removeEventListener('pointerleave', handlePointerLeave);
      mount.removeEventListener('touchstart', handleTouchStart);
      mount.removeEventListener('touchmove', handleTouchMove);

      // Dispose Geometries & Materials
      crystalGeo.dispose();
      crystalMat.dispose();
      wireframeMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      scannerGeo.dispose();
      scannerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
    };
  }, []);

  return (
    <div
      className={`joblens-3d-stage ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '340px',
        maxHeight: '440px',
        borderRadius: '24px',
        overflow: 'hidden',
        background: 'radial-gradient(ellipse at 50% 45%, #181938 0%, #0d1124 55%, #070913 100%)',
        border: '1px solid rgba(99, 102, 241, 0.35)',
        boxShadow: '0 24px 60px -15px rgba(2, 6, 23, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none',
        ...style,
      }}
    >
      {/* Three.js WebGL Mount Canvas */}
      <div
        ref={mountRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          cursor: 'grab',
          zIndex: 1,
        }}
      />

      {/* Decorative Glowing Stage Halos */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '320px',
          height: '320px',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, rgba(6, 182, 212, 0.12) 40%, transparent 70%)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Top Left: Live AI Verification Telemetry Badge ──────────────── */}
      <div
        onClick={() => setActiveChip('legit')}
        style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          background: activeChip === 'legit' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(16, 185, 129, 0.45)',
          borderRadius: '14px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 10px #10b981',
            animation: 'pulse 2s infinite',
          }}
        />
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#34d399', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={13} /> AI VERIFIER ACTIVE
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
            Legitimacy: <span style={{ color: '#10b981' }}>99.4% Validated</span>
          </div>
        </div>
      </div>

      {/* ── Top Right: Scam Shield Active Badge ───────────────────────── */}
      <div
        onClick={() => setActiveChip('shield')}
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 10,
          background: activeChip === 'shield' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(6, 182, 212, 0.45)',
          borderRadius: '14px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Search size={14} color="#06b6d4" />
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#22d3ee', letterSpacing: '0.04em' }}>
            OFF-CAMPUS SCAM SHIELD
          </div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
            0 Ghost Employers Detected
          </div>
        </div>
      </div>

      {/* ── Bottom Left: Resume Skill Matcher ──────────────────────────── */}
      <div
        onClick={() => setActiveChip('resume')}
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 10,
          background: activeChip === 'resume' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(129, 140, 248, 0.4)',
          borderRadius: '14px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Cpu size={14} color="#a5b4fc" />
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#c7d2fe' }}>
            SMART RESUME MATCHER
          </div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
            <span style={{ color: '#818cf8' }}>96% Fit</span> Across Verified Roles
          </div>
        </div>
      </div>

      {/* ── Bottom Right: Off-Campus Live Hiring Drives ────────────────── */}
      <div
        onClick={() => setActiveChip('drives')}
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          zIndex: 10,
          background: activeChip === 'drives' ? 'rgba(15, 23, 42, 0.88)' : 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(251, 191, 36, 0.4)',
          borderRadius: '14px',
          padding: '8px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <Sparkles size={14} color="#fbbf24" />
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#fcd34d' }}>
            OFF-CAMPUS HIRING DRIVES
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
            Direct MNC Applications
          </div>
        </div>
      </div>

      {/* Interactive Drag & Gyroscope Prompt */}
      <div
        style={{
          position: 'absolute',
          bottom: '8px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 5,
          fontSize: '10px',
          color: 'rgba(148, 163, 184, 0.7)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
          fontWeight: 600,
        }}
      >
        ✦ Drag or move mouse to inspect 3D JobLens
      </div>
    </div>
  );
}
