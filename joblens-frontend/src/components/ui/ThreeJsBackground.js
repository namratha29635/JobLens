import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeJsBackground({ className = '', style = {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // 1. SCENE, CAMERA & LIGHTS
    // ──────────────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 18, 55);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Subtle atmospheric dual lighting (Indigo + Cyan highlights on light surface)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x4f46e5, 0.8);
    dirLight1.position.set(-30, 40, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 0.65);
    dirLight2.position.set(30, -20, 30);
    scene.add(dirLight2);

    // ──────────────────────────────────────────────────────────────────────────
    // 2. DYNAMIC 3D FLOWING WAVE SURFACE
    // ──────────────────────────────────────────────────────────────────────────
    const planeWidth = 240;
    const planeHeight = 160;
    const segmentsX = 46;
    const segmentsY = 32;

    const waveGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);
    waveGeometry.rotateX(-Math.PI / 2.3);

    const count = waveGeometry.attributes.position.count;
    const originalPositions = new Float32Array(count * 3);
    const posAttr = waveGeometry.attributes.position;

    for (let i = 0; i < count; i++) {
      originalPositions[i * 3] = posAttr.getX(i);
      originalPositions[i * 3 + 1] = posAttr.getY(i);
      originalPositions[i * 3 + 2] = posAttr.getZ(i);
    }

    // Material 1: Soft shaded wave ribbon surface
    const waveMaterial = new THREE.MeshPhongMaterial({
      color: 0xf1f5f9,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.05,
      specular: 0x06b6d4,
      shininess: 30,
      transparent: true,
      opacity: 0.38,
      side: THREE.DoubleSide,
      flatShading: true,
    });

    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    waveMesh.position.set(0, -14, -10);
    scene.add(waveMesh);

    // Material 2: Luminous wireframe geometric grid on top of the waves
    const wireframeMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });

    const wireframeMesh = new THREE.Mesh(waveGeometry, wireframeMaterial);
    wireframeMesh.position.set(0, -13.9, -10);
    scene.add(wireframeMesh);

    // Material 3: Luminous constellation nodes floating on the wave peaks
    const nodeGeometry = new THREE.BufferGeometry();
    const nodeCount = 65;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVelocities = [];

    for (let i = 0; i < nodeCount; i++) {
      nodePositions[i * 3] = (Math.random() - 0.5) * 160;
      nodePositions[i * 3 + 1] = Math.random() * 25 - 5;
      nodePositions[i * 3 + 2] = (Math.random() - 0.5) * 60;

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.04,
        y: (Math.random() - 0.5) * 0.03,
        z: (Math.random() - 0.5) * 0.03,
      });
    }

    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    const nodeMaterial = new THREE.PointsMaterial({
      color: 0x0891b2,
      size: 3.2,
      transparent: true,
      opacity: 0.4,
      blending: THREE.NormalBlending,
    });

    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodes);

    // Dynamic Theme Adaptation
    const updateThemeColors = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        waveMaterial.color.setHex(0x0f172a);
        waveMaterial.emissive.setHex(0x1e1b4b);
        waveMaterial.specular.setHex(0x38bdf8);
        waveMaterial.opacity = 0.65;
        wireframeMaterial.color.setHex(0x818cf8);
        wireframeMaterial.opacity = 0.28;
        nodeMaterial.color.setHex(0x38bdf8);
        dirLight1.intensity = 1.1;
        dirLight2.intensity = 0.9;
      } else {
        waveMaterial.color.setHex(0xf1f5f9);
        waveMaterial.emissive.setHex(0x1e1b4b);
        waveMaterial.specular.setHex(0x06b6d4);
        waveMaterial.opacity = 0.38;
        wireframeMaterial.color.setHex(0x6366f1);
        wireframeMaterial.opacity = 0.16;
        nodeMaterial.color.setHex(0x0891b2);
        dirLight1.intensity = 0.8;
        dirLight2.intensity = 0.65;
      }
    };
    updateThemeColors();

    const themeObserver = new MutationObserver(() => {
      updateThemeColors();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ──────────────────────────────────────────────────────────────────────────
    // 3. INTERACTIVE MOUSE RIPPLE & SCROLL REACTION
    // ──────────────────────────────────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let scrollYProgress = 0;
    let targetScrollProgress = 0;

    const handleMouseMove = (e) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScrollProgress = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // ──────────────────────────────────────────────────────────────────────────
    // 4. ANIMATION LOOP
    // ──────────────────────────────────────────────────────────────────────────
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (document.hidden) return;

      const time = clock.getElapsedTime();

      // Smooth mouse and scroll interpolation
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
      scrollYProgress += (targetScrollProgress - scrollYProgress) * 0.05;

      // Update Wave Vertices in Real Time
      const posArray = waveGeometry.attributes.position.array;

      for (let i = 0; i < count; i++) {
        const u = originalPositions[i * 3];
        const v = originalPositions[i * 3 + 1];

        // Complex undulating multi-octave wave
        const wave1 = Math.sin(u * 0.04 + time * 0.7) * Math.cos(v * 0.04 + time * 0.5) * 4.2;
        const wave2 = Math.sin(u * 0.08 - time * 0.4 + v * 0.06) * 2.1;
        const wave3 = Math.cos(u * 0.03 + v * 0.05 - time * 0.3) * 1.8;

        // Interactive mouse ripple effect
        const dx = u - mouseX * 45;
        const dy = v - mouseY * 35;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseRipple = Math.sin(dist * 0.15 - time * 2) * Math.max(0, 1 - dist / 60) * 2.8;

        posArray[i * 3 + 2] = originalPositions[i * 3 + 2] + wave1 + wave2 + wave3 + mouseRipple;
      }

      waveGeometry.attributes.position.needsUpdate = true;
      waveGeometry.computeVertexNormals();

      // Move floating nodes
      const nPos = nodeGeometry.attributes.position.array;
      for (let i = 0; i < nodeCount; i++) {
        nPos[i * 3] += nodeVelocities[i].x;
        nPos[i * 3 + 1] += nodeVelocities[i].y;
        nPos[i * 3 + 2] += nodeVelocities[i].z;

        if (nPos[i * 3] < -80 || nPos[i * 3] > 80) nodeVelocities[i].x = -nodeVelocities[i].x;
        if (nPos[i * 3 + 1] < -10 || nPos[i * 3 + 1] > 25) nodeVelocities[i].y = -nodeVelocities[i].y;
        if (nPos[i * 3 + 2] < -30 || nPos[i * 3 + 2] > 30) nodeVelocities[i].z = -nodeVelocities[i].z;
      }
      nodeGeometry.attributes.position.needsUpdate = true;

      // Scroll Parallax: Camera glides through space smoothly
      camera.position.x = mouseX * 8;
      camera.position.y = 18 - mouseY * 6 - scrollYProgress * 10;
      camera.position.z = 55 - scrollYProgress * 12;
      camera.lookAt(0, -6 + scrollYProgress * 6, -10);

      // Gentle wave mesh tilt
      waveMesh.rotation.z = Math.sin(time * 0.1) * 0.03 + scrollYProgress * 0.08;
      wireframeMesh.rotation.z = waveMesh.rotation.z;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      themeObserver.disconnect();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      waveGeometry.dispose();
      waveMaterial.dispose();
      wireframeMaterial.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();

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
      ref={containerRef}
      className={`three-bg-canvas ${className}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  );
}
