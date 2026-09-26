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

    // Setup scene
    const scene = new THREE.Scene();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000);
    camera.position.set(0, 10, 65);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'low-power',
      });
    } catch (e) {
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // ──────────────────────────────────────────────────────────────────────────
    // 1. TOPOGRAPHICAL 3D MAP-LIKE TERRAIN STRUCTURE WITH LIGHT SQUARES
    // ──────────────────────────────────────────────────────────────────────────
    const gridCols = 38;
    const gridRows = 28;
    const gridGeo = new THREE.PlaneGeometry(280, 200, gridCols, gridRows);

    // Perturb vertices to create an undulating topographical landscape / map
    const posAttr = gridGeo.attributes.position;
    const baseZ = new Float32Array(posAttr.count);

    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      // Realistic digital contour height formula
      const elevation =
        Math.sin(x * 0.035) * Math.cos(y * 0.035) * 6 +
        Math.sin(x * 0.08 + y * 0.06) * 2.5 +
        Math.cos(x * 0.05 - y * 0.04) * 3;
      posAttr.setZ(i, elevation);
      baseZ[i] = elevation;
    }
    gridGeo.computeVertexNormals();

    // Layer A: Light semi-translucent square face tiles (the "light squares")
    const faceMaterial = new THREE.MeshBasicMaterial({
      color: 0x6366f1,
      transparent: true,
      opacity: 0.035,
      side: THREE.DoubleSide,
    });
    const mapFacesMesh = new THREE.Mesh(gridGeo, faceMaterial);
    mapFacesMesh.rotation.x = -1.18;
    mapFacesMesh.position.set(0, -18, -15);
    scene.add(mapFacesMesh);

    // Layer B: Crisp luminous wireframe grid lines
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x4f46e5,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
    });
    const mapWireMesh = new THREE.Mesh(gridGeo, wireMat);
    mapWireMesh.rotation.x = -1.18;
    mapWireMesh.position.set(0, -18, -15);
    scene.add(mapWireMesh);

    // Layer C: Subtle glowing nodes at map grid junctions
    const gridPointsMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 2.4,
      transparent: true,
      opacity: 0.35,
    });
    const gridPoints = new THREE.Points(gridGeo, gridPointsMat);
    gridPoints.rotation.x = -1.18;
    gridPoints.position.set(0, -18, -15);
    scene.add(gridPoints);

    // ──────────────────────────────────────────────────────────────────────────
    // 2. FLOATING DATA NODES & DELICATE CONSTELLATION PULSES
    // ──────────────────────────────────────────────────────────────────────────
    const nodeCount = 50;
    const nodePositions = new Float32Array(nodeCount * 3);
    const nodeVelocities = [];

    for (let i = 0; i < nodeCount; i++) {
      nodePositions[i * 3] = (Math.random() - 0.5) * 140;
      nodePositions[i * 3 + 1] = (Math.random() - 0.5) * 90;
      nodePositions[i * 3 + 2] = (Math.random() - 0.5) * 30;

      nodeVelocities.push({
        x: (Math.random() - 0.5) * 0.05,
        y: (Math.random() - 0.5) * 0.05,
        z: (Math.random() - 0.5) * 0.03,
      });
    }

    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 3.0,
      transparent: true,
      opacity: 0.45,
    });
    const nodesMesh = new THREE.Points(nodeGeo, nodeMat);
    scene.add(nodesMesh);

    // ──────────────────────────────────────────────────────────────────────────
    // 3. SCROLL & MOUSE INTERACTION
    // ──────────────────────────────────────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;
    let currentScroll = 0;
    let targetScroll = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 1.2;
      mouseY = (event.clientY / window.innerHeight - 0.5) * 1.2;
    };

    const handleScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      targetScroll = Math.min(Math.max(window.scrollY / maxScroll, 0), 1);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle Resize
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

      const elapsed = clock.getElapsedTime();

      // Smooth scroll interpolation
      currentScroll += (targetScroll - currentScroll) * 0.06;

      // Dynamic wave on map structure vertices
      const posArray = gridGeo.attributes.position.array;
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const dynamicWave =
          Math.sin(elapsed * 0.6 + x * 0.04) * 1.2 +
          Math.cos(elapsed * 0.4 + y * 0.04) * 1.0;
        posArray[i * 3 + 2] = baseZ[i] + dynamicWave;
      }
      gridGeo.attributes.position.needsUpdate = true;

      // Move & wrap floating node particles
      const nodePosArray = nodeGeo.attributes.position.array;
      for (let i = 0; i < nodeCount; i++) {
        nodePosArray[i * 3] += nodeVelocities[i].x;
        nodePosArray[i * 3 + 1] += nodeVelocities[i].y;
        nodePosArray[i * 3 + 2] += nodeVelocities[i].z;

        if (nodePosArray[i * 3] < -70 || nodePosArray[i * 3] > 70) nodeVelocities[i].x = -nodeVelocities[i].x;
        if (nodePosArray[i * 3 + 1] < -45 || nodePosArray[i * 3 + 1] > 45) nodeVelocities[i].y = -nodeVelocities[i].y;
        if (nodePosArray[i * 3 + 2] < -15 || nodePosArray[i * 3 + 2] > 15) nodeVelocities[i].z = -nodeVelocities[i].z;
      }
      nodeGeo.attributes.position.needsUpdate = true;

      // Scroll response: as the user scrolls through the page (Hero -> Features -> etc.)
      // the map-like structure in the background translates and tilts smoothly
      const scrollYOffset = currentScroll * 22;
      const scrollRotZ = currentScroll * 0.12;

      mapFacesMesh.position.y = -18 + scrollYOffset;
      mapFacesMesh.rotation.z = scrollRotZ;

      mapWireMesh.position.y = -18 + scrollYOffset;
      mapWireMesh.rotation.z = scrollRotZ;

      gridPoints.position.y = -18 + scrollYOffset;
      gridPoints.rotation.z = scrollRotZ;

      // Smooth mouse parallax
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX * 10;
      camera.position.y = 10 - targetY * 6;
      camera.lookAt(0, 0, -10);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);

      gridGeo.dispose();
      faceMaterial.dispose();
      wireMat.dispose();
      gridPointsMat.dispose();
      nodeGeo.dispose();
      nodeMat.dispose();

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
