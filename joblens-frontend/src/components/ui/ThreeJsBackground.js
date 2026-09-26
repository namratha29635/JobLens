import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Modern, Lightweight, Aesthetic 3D Background
 * Features:
 * - Ultra-smooth undulating organic wave ribbons (no heavy/dense grid wireframes)
 * - Luminous star/particle constellation field with soft circular sprites
 * - Interactive mouse parallax & gentle scroll-driven camera glide
 * - Dynamic theme adaptation (softer slate/cyan in dark mode, crisp sky/indigo in light mode)
 */
export default function ThreeJsBackground({ className = '', style = {} }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    // ──────────────────────────────────────────────────────────────────────────
    // 1. SCENE, CAMERA & RENDERER SETUP
    // ──────────────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 12, 48);

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

    // Dynamic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const light1 = new THREE.DirectionalLight(0x6366f1, 0.85);
    light1.position.set(-25, 30, 20);
    scene.add(light1);

    const light2 = new THREE.DirectionalLight(0x06b6d4, 0.75);
    light2.position.set(25, -15, 25);
    scene.add(light2);

    // ──────────────────────────────────────────────────────────────────────────
    // 2. SOFT, LIGHTWEIGHT FLOWING WAVE RIBBONS (No heavy grids)
    // ──────────────────────────────────────────────────────────────────────────
    const planeWidth = 200;
    const planeHeight = 120;
    const segmentsX = 36;
    const segmentsY = 24;

    const waveGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, segmentsX, segmentsY);
    waveGeometry.rotateX(-Math.PI / 2.35);

    const count = waveGeometry.attributes.position.count;
    const originalPositions = new Float32Array(count * 3);
    const posAttr = waveGeometry.attributes.position;

    for (let i = 0; i < count; i++) {
      originalPositions[i * 3] = posAttr.getX(i);
      originalPositions[i * 3 + 1] = posAttr.getY(i);
      originalPositions[i * 3 + 2] = posAttr.getZ(i);
    }

    // Material 1: Soft translucent velvety wave surface
    const waveMaterial = new THREE.MeshPhongMaterial({
      color: 0x93c5fd,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.08,
      specular: 0x38bdf8,
      shininess: 45,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    const waveMesh = new THREE.Mesh(waveGeometry, waveMaterial);
    waveMesh.position.set(0, -12, -8);
    scene.add(waveMesh);

    // Secondary subtle ribbon wave
    const waveGeo2 = new THREE.PlaneGeometry(planeWidth * 0.9, planeHeight * 0.8, 28, 18);
    waveGeo2.rotateX(-Math.PI / 2.3);
    const count2 = waveGeo2.attributes.position.count;
    const origPos2 = new Float32Array(count2 * 3);
    const posAttr2 = waveGeo2.attributes.position;
    for (let i = 0; i < count2; i++) {
      origPos2[i * 3] = posAttr2.getX(i);
      origPos2[i * 3 + 1] = posAttr2.getY(i);
      origPos2[i * 3 + 2] = posAttr2.getZ(i);
    }

    const waveMat2 = new THREE.MeshPhongMaterial({
      color: 0x818cf8,
      emissive: 0x0e1726,
      emissiveIntensity: 0.04,
      specular: 0x06b6d4,
      shininess: 30,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      flatShading: false,
    });

    const waveMesh2 = new THREE.Mesh(waveGeo2, waveMat2);
    waveMesh2.position.set(0, -14, -12);
    scene.add(waveMesh2);

    // ──────────────────────────────────────────────────────────────────────────
    // 3. LUMINOUS FLOATING SPARK / CONSTELLATION NODES
    // ──────────────────────────────────────────────────────────────────────────
    // Create soft circular sprite texture dynamically
    const createParticleTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.25, 'rgba(224, 242, 254, 0.85)');
      grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.3)');
      grad.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(canvas);
    };

    const particleTexture = createParticleTexture();

    const nodeCount = 50;
    const nodeGeometry = new THREE.BufferGeometry();
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVelocities = [];

    for (let i = 0; i < nodeCount; i++) {
      nodePositions[i * 3] = (Math.random() - 0.5) * 140;
      nodePositions[i * 3 + 1] = Math.random() * 26 - 4;
      nodePositions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.03,
        y: (Math.random() - 0.5) * 0.025,
        z: (Math.random() - 0.5) * 0.025,
      });
    }

    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    const nodeMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 4.5,
      map: particleTexture,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodes);

    // Subtle background ambient dust
    const dustCount = 80;
    const dustGeometry = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 160;
      dustPositions[i + 1] = (Math.random() - 0.5) * 80;
      dustPositions[i + 2] = (Math.random() - 0.5) * 60;
    }
    dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

    const dustMaterial = new THREE.PointsMaterial({
      color: 0x818cf8,
      size: 2.2,
      map: particleTexture,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const dustPoints = new THREE.Points(dustGeometry, dustMaterial);
    scene.add(dustPoints);

    // ──────────────────────────────────────────────────────────────────────────
    // 4. THEME COLOR SYNCHRONIZATION
    // ──────────────────────────────────────────────────────────────────────────
    const updateThemeColors = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      if (isDark) {
        waveMaterial.color.setHex(0x38bdf8);
        waveMaterial.emissive.setHex(0x1e293b);
        waveMaterial.specular.setHex(0x818cf8);
        waveMaterial.opacity = 0.22;

        waveMat2.color.setHex(0x818cf8);
        waveMat2.emissive.setHex(0x1e1b4b);
        waveMat2.opacity = 0.16;

        nodeMaterial.color.setHex(0x38bdf8);
        nodeMaterial.opacity = 0.75;
        dustMaterial.color.setHex(0xa5b4fc);
        dustMaterial.opacity = 0.4;

        light1.intensity = 0.95;
        light2.intensity = 0.8;
      } else {
        waveMaterial.color.setHex(0x93c5fd);
        waveMaterial.emissive.setHex(0xe0e7ff);
        waveMaterial.specular.setHex(0x06b6d4);
        waveMaterial.opacity = 0.2;

        waveMat2.color.setHex(0xc7d2fe);
        waveMat2.emissive.setHex(0xf1f5f9);
        waveMat2.opacity = 0.14;

        nodeMaterial.color.setHex(0x0284c7);
        nodeMaterial.opacity = 0.55;
        dustMaterial.color.setHex(0x6366f1);
        dustMaterial.opacity = 0.25;

        light1.intensity = 0.75;
        light2.intensity = 0.6;
      }
    };

    updateThemeColors();

    const themeObserver = new MutationObserver(() => {
      updateThemeColors();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ──────────────────────────────────────────────────────────────────────────
    // 5. INTERACTION (MOUSE & SCROLL)
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
    // 6. ANIMATION LOOP
    // ──────────────────────────────────────────────────────────────────────────
    let animId;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (document.hidden) return;

      const time = clock.getElapsedTime();

      // Smooth interpolation
      mouseX += (targetMouseX - mouseX) * 0.035;
      mouseY += (targetMouseY - mouseY) * 0.035;
      scrollYProgress += (targetScrollProgress - scrollYProgress) * 0.045;

      // Primary Wave Undulation
      const posArray = waveGeometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        const u = originalPositions[i * 3];
        const v = originalPositions[i * 3 + 1];

        const wave1 = Math.sin(u * 0.035 + time * 0.6) * Math.cos(v * 0.035 + time * 0.45) * 3.6;
        const wave2 = Math.sin(u * 0.06 - time * 0.35 + v * 0.045) * 1.8;

        const dx = u - mouseX * 35;
        const dy = v - mouseY * 25;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseRipple = Math.sin(dist * 0.12 - time * 1.8) * Math.max(0, 1 - dist / 55) * 2.2;

        posArray[i * 3 + 2] = originalPositions[i * 3 + 2] + wave1 + wave2 + mouseRipple;
      }
      waveGeometry.attributes.position.needsUpdate = true;
      waveGeometry.computeVertexNormals();

      // Secondary Wave Undulation
      const posArray2 = waveGeo2.attributes.position.array;
      for (let i = 0; i < count2; i++) {
        const u = origPos2[i * 3];
        const v = origPos2[i * 3 + 1];
        const w1 = Math.sin(u * 0.04 - time * 0.45) * Math.cos(v * 0.04 + time * 0.4) * 2.8;
        const w2 = Math.cos(u * 0.05 + time * 0.25) * 1.5;
        posArray2[i * 3 + 2] = origPos2[i * 3 + 2] + w1 + w2;
      }
      waveGeo2.attributes.position.needsUpdate = true;
      waveGeo2.computeVertexNormals();

      // Move constellation nodes
      const nPos = nodeGeometry.attributes.position.array;
      for (let i = 0; i < nodeCount; i++) {
        nPos[i * 3] += nodeVelocities[i].x;
        nPos[i * 3 + 1] += nodeVelocities[i].y;
        nPos[i * 3 + 2] += nodeVelocities[i].z;

        if (nPos[i * 3] < -70 || nPos[i * 3] > 70) nodeVelocities[i].x *= -1;
        if (nPos[i * 3 + 1] < -8 || nPos[i * 3 + 1] > 24) nodeVelocities[i].y *= -1;
        if (nPos[i * 3 + 2] < -25 || nPos[i * 3 + 2] > 25) nodeVelocities[i].z *= -1;
      }
      nodeGeometry.attributes.position.needsUpdate = true;

      // Slow ambient dust drift
      dustPoints.rotation.y = time * 0.02;
      dustPoints.rotation.x = Math.sin(time * 0.015) * 0.05;

      // Gentle camera parallax
      camera.position.x = mouseX * 6;
      camera.position.y = 12 - mouseY * 5 - scrollYProgress * 8;
      camera.position.z = 48 - scrollYProgress * 10;
      camera.lookAt(0, -5 + scrollYProgress * 5, -8);

      // Ribbon gentle rotation
      waveMesh.rotation.z = Math.sin(time * 0.08) * 0.025 + scrollYProgress * 0.06;
      waveMesh2.rotation.z = -Math.sin(time * 0.07) * 0.02 + scrollYProgress * 0.05;

      try {
        renderer.render(scene, camera);
      } catch (e) {}
    };

    animate();

    // Cleanup
    return () => {
      try {
        cancelAnimationFrame(animId);
        if (themeObserver) themeObserver.disconnect();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);

        if (waveGeometry) waveGeometry.dispose();
        if (waveMaterial) waveMaterial.dispose();
        if (waveGeo2) waveGeo2.dispose();
        if (waveMat2) waveMat2.dispose();
        if (nodeGeometry) nodeGeometry.dispose();
        if (nodeMaterial) nodeMaterial.dispose();
        if (dustGeometry) dustGeometry.dispose();
        if (dustMaterial) dustMaterial.dispose();
        if (particleTexture) particleTexture.dispose();

        if (renderer) {
          renderer.dispose();
          if (renderer.domElement && renderer.domElement.parentNode) {
            renderer.domElement.parentNode.removeChild(renderer.domElement);
          }
        }
      } catch (e) {}
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
