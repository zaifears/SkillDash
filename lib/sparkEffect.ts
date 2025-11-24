/**
 * Lightweight Spark Effect - Fireworks on Click
 * Minimal performance impact, auto-cleanup after animation
 */

export function initSparkEffect() {
  // Only initialize on client side
  if (typeof document === 'undefined') return;

  const styles = `
    .spark-container {
      position: absolute;
      width: 22px;
      height: 22px;
      list-style: none;
      margin: -6px 0 0 -32px;
      pointer-events: none;
    }

    .spark-container li {
      padding: 0px;
      width: 0px;
      height: 0px;
      position: absolute;
      left: auto;
      right: auto;
    }

    .spark-container li:nth-child(1) {
      left: 50%;
      top: -22px;
      width: 1px;
      height: 0px;
      rotate: 0deg;
      border-left: 1px solid #3b82f6;
      animation: spark-vert 0.25s linear forwards;
    }

    .spark-container li:nth-child(2) {
      left: 50%;
      bottom: -22px;
      width: 1px;
      height: 0px;
      rotate: 0deg;
      border-left: 1px solid #3b82f6;
      animation: spark-vert 0.25s linear forwards;
    }

    .spark-container li:nth-child(3) {
      left: -6px;
      top: 11px;
      rotate: 0deg;
      width: 0px;
      height: 1px;
      border-bottom: 1px solid #3b82f6;
      animation: spark-horiz 0.25s linear forwards;
    }

    .spark-container li:nth-child(4) {
      right: -6px;
      rotate: 0deg;
      top: 11px;
      width: 0px;
      height: 1px;
      border-bottom: 1px solid #3b82f6;
      animation: spark-horiz 0.25s linear forwards;
    }

    .spark-container li:nth-child(5) {
      left: 0px;
      top: -11px;
      rotate: 45deg;
      width: 0px;
      height: 1px;
      border-bottom: 1px solid #3b82f6;
      animation: spark-horiz 0.25s linear forwards;
    }

    .spark-container li:nth-child(6) {
      right: 0px;
      top: -11px;
      rotate: -45deg;
      width: 0px;
      height: 1px;
      border-bottom: 1px solid #3b82f6;
      animation: spark-horiz 0.25s linear forwards;
    }

    .spark-container li:nth-child(7) {
      left: 0px;
      bottom: -11px;
      rotate: -45deg;
      width: 0px;
      height: 1px;
      border-bottom: 1px solid #3b82f6;
      animation: spark-horiz 0.25s linear forwards;
    }

    .spark-container li:nth-child(8) {
      right: 0px;
      bottom: -11px;
      rotate: 45deg;
      width: 0px;
      height: 1px;
      border-bottom: 1px solid #3b82f6;
      animation: spark-horiz 0.25s linear forwards;
    }

    @keyframes spark-vert {
      from {
        height: 22px;
      }
      to {
        height: 0px;
      }
    }

    @keyframes spark-horiz {
      from {
        width: 22px;
      }
      to {
        width: 0px;
      }
    }
  `;

  // Inject styles into document head
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);

  // Add click event listener
  document.addEventListener('click', (event: MouseEvent) => {
    // Ignore clicks on interactive elements
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.contentEditable === 'true'
    ) {
      return;
    }

    createSparkEffect(event.pageX, event.pageY);
  });
}

function createSparkEffect(x: number, y: number) {
  const container = document.createElement('ul');
  container.className = 'spark-container';
  container.style.left = x + 'px';
  container.style.top = y + 'px';

  // Create 8 spark lines
  for (let i = 0; i < 8; i++) {
    const li = document.createElement('li');
    container.appendChild(li);
  }

  document.body.appendChild(container);

  // Remove after animation completes
  setTimeout(() => {
    container.remove();
  }, 250);
}
