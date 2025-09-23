'use client';
import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './Aurora.css';

export default function Aurora({ 
  colorStops = ['#3B82F6', '#8B5CF6', '#06B6D4'], 
  blend = 0.3, 
  amplitude = 0.8, 
  speed = 0.4 
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    console.log('Aurora: Starting initialization...');
    const container = containerRef.current;
    if (!container) {
      console.log('Aurora: No container found');
      return;
    }

    console.log('Aurora: Container found, creating renderer...');

    let renderer, program, mesh, animationId;

    try {
      // Create renderer
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        powerPreference: 'default'
      });

      const { gl } = renderer;
      gl.clearColor(0, 0, 0, 0);

      // Set canvas size to full container
      const resizeCanvas = () => {
        const rect = container.getBoundingClientRect();
        renderer.setSize(rect.width, rect.height);
        program.uniforms.resolution.value = [rect.width, rect.height];
        console.log('Aurora: Canvas resized to', rect.width, 'x', rect.height);
      };

      // Enhanced vertex shader
      const vertex = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
          vUv = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      // Enhanced fragment shader with better aurora effect
      const fragment = `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float blend;
        uniform float amplitude;
        varying vec2 vUv;
        
        // Noise function for more organic movement
        float noise(vec2 p) {
          return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }
        
        float smoothNoise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          
          float a = noise(i);
          float b = noise(i + vec2(1.0, 0.0));
          float c = noise(i + vec2(0.0, 1.0));
          float d = noise(i + vec2(1.0, 1.0));
          
          return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }
        
        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          
          // Create flowing aurora patterns
          float t = time * 0.3;
          
          // Multiple layers of flowing patterns
          float wave1 = sin(uv.x * 2.0 + t) * cos(uv.y * 1.5 + t * 0.7);
          float wave2 = sin(uv.x * 3.0 - t * 0.8) * cos(uv.y * 2.5 - t * 0.5);
          float wave3 = sin(uv.x * 1.5 + t * 1.2) * cos(uv.y * 0.8 + t);
          
          // Add noise for organic movement
          float n1 = smoothNoise(uv * 4.0 + t * 0.2);
          float n2 = smoothNoise(uv * 8.0 - t * 0.15);
          
          // Combine waves with noise
          float combined = (wave1 + wave2 * 0.7 + wave3 * 0.5) * 0.4;
          combined += (n1 + n2 * 0.5) * 0.3;
          combined = (combined + 1.0) * 0.5; // Normalize to 0-1
          
          // Create aurora bands
          float bands = sin(uv.y * 8.0 + combined * 2.0 + t) * 0.5 + 0.5;
          bands = pow(bands, 2.0);
          
          // Color mixing based on position and movement
          vec3 color;
          float mixFactor = uv.x + sin(combined * 3.14159) * 0.3;
          
          if (mixFactor < 0.33) {
            color = mix(color1, color2, mixFactor * 3.0);
          } else if (mixFactor < 0.66) {
            color = mix(color2, color3, (mixFactor - 0.33) * 3.0);
          } else {
            color = mix(color3, color1, (mixFactor - 0.66) * 3.0);
          }
          
          // Apply amplitude and blend
          float intensity = combined * bands * amplitude * blend;
          
          // Create gradient falloff from center
          float centerDist = length(uv - 0.5);
          intensity *= (1.0 - centerDist * 0.8);
          
          color *= intensity;
          
          // Final alpha based on intensity
          float alpha = intensity * blend;
          
          gl_FragColor = vec4(color, alpha);
        }
      `;

      // Create geometry (fullscreen triangle)
      const geometry = new Triangle(gl);

      // Convert color stops
      const colors = colorStops.map(hex => {
        const c = new Color(hex);
        return [c.r, c.g, c.b];
      });

      // Create program
      program = new Program(gl, {
        vertex,
        fragment,
        uniforms: {
          time: { value: 0 },
          resolution: { value: [window.innerWidth, window.innerHeight] },
          color1: { value: colors[0] || [0.23, 0.51, 0.96] },
          color2: { value: colors[1] || [0.55, 0.36, 0.96] },
          color3: { value: colors[2] || [0.02, 0.71, 0.83] },
          blend: { value: blend },
          amplitude: { value: amplitude }
        }
      });

      console.log('Aurora: Program created successfully');

      // Create mesh
      mesh = new Mesh(gl, { geometry, program });

      // Add canvas to container with proper z-index
      container.appendChild(gl.canvas);
      gl.canvas.style.position = 'absolute';
      gl.canvas.style.top = '0';
      gl.canvas.style.left = '0';
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      gl.canvas.style.pointerEvents = 'none';
      gl.canvas.style.zIndex = '-1'; // Ensure it's behind content

      console.log('Aurora: Canvas added to DOM');

      // Initial resize
      resizeCanvas();

      // Animation loop
      let startTime = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - startTime) * 0.001 * speed;
        program.uniforms.time.value = elapsed;
        
        // Enable blending for proper alpha compositing
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        
        renderer.render({ scene: mesh });
        animationId = requestAnimationFrame(animate);
      };

      animate();
      console.log('Aurora: Animation started');

      // Handle resize
      const handleResize = () => resizeCanvas();
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        console.log('Aurora: Cleaning up...');
        if (animationId) cancelAnimationFrame(animationId);
        window.removeEventListener('resize', handleResize);
        if (gl.canvas && container.contains(gl.canvas)) {
          container.removeChild(gl.canvas);
        }
      };

    } catch (error) {
      console.error('Aurora: Error during initialization:', error);
    }
  }, [colorStops, blend, amplitude, speed]);

  return (
    <div 
      ref={containerRef} 
      className="aurora-container"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  );
}