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
        console.log('Aurora: Canvas resized to', rect.width, 'x', rect.height);
      };

      // Simple vertex shader
      const vertex = `
        attribute vec2 position;
        void main() {
          gl_Position = vec4(position, 0.0, 1.0);
        }
      `;

      // Simple fragment shader that should definitely work
      const fragment = `
        precision mediump float;
        uniform float time;
        uniform vec2 resolution;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        uniform float blend;
        
        void main() {
          vec2 uv = gl_FragCoord.xy / resolution.xy;
          
          // Simple gradient effect
          float wave = sin(uv.x * 3.14159 + time * 0.5) * 0.5 + 0.5;
          
          vec3 color;
          if (uv.x < 0.5) {
            color = mix(color1, color2, uv.x * 2.0);
          } else {
            color = mix(color2, color3, (uv.x - 0.5) * 2.0);
          }
          
          color *= wave * blend;
          gl_FragColor = vec4(color, blend * 0.8);
        }
      `;

      // Create geometry
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
          color1: { value: colors[0] },
          color2: { value: colors[1] },
          color3: { value: colors[2] },
          blend: { value: blend }
        }
      });

      console.log('Aurora: Program created successfully');

      // Create mesh
      mesh = new Mesh(gl, { geometry, program });

      // Add canvas to container
      container.appendChild(gl.canvas);
      gl.canvas.style.position = 'absolute';
      gl.canvas.style.top = '0';
      gl.canvas.style.left = '0';
      gl.canvas.style.width = '100%';
      gl.canvas.style.height = '100%';
      gl.canvas.style.pointerEvents = 'none';

      console.log('Aurora: Canvas added to DOM');

      // Initial resize
      resizeCanvas();

      // Animation loop
      let startTime = Date.now();
      const animate = () => {
        const elapsed = (Date.now() - startTime) * 0.001 * speed;
        program.uniforms.time.value = elapsed;
        
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
