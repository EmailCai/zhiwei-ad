(() => {
  const TWO_PI = Math.PI * 2;
  const pointer = { x: -9999, y: -9999, px: -9999, py: -9999, speed: 0 };
  const fields = [];

  const palettes = {
    hero: ["rgba(255,255,255,.2)", "rgba(251,187,10,.34)"],
    about: ["rgba(7,84,199,.42)", "rgba(255,255,255,.28)"],
    services: ["rgba(7,84,199,.34)", "rgba(251,187,10,.3)"],
    cases: ["rgba(7,84,199,.3)", "rgba(251,187,10,.28)"],
    contact: ["rgba(255,255,255,.2)", "rgba(251,187,10,.34)"]
  };

  class DotField {
    constructor(section) {
      this.section = section;
      this.canvas = document.createElement("canvas");
      this.canvas.className = "section-dot-field";
      this.canvas.setAttribute("aria-hidden", "true");
      section.prepend(this.canvas);
      this.context = this.canvas.getContext("2d", { alpha: true });
      this.colors = palettes[[...section.classList].find(name => palettes[name])] || palettes.services;
      this.dots = [];
      this.visible = false;
      this.engagement = 0;
      this.resize();
    }

    resize() {
      const rect = this.section.getBoundingClientRect();
      const dpr = innerWidth < 700
        ? Math.min(devicePixelRatio || 1, 1.35)
        : Math.min(devicePixelRatio || 1, 2);
      this.width = rect.width;
      this.height = rect.height;
      this.canvas.width = Math.round(this.width * dpr);
      this.canvas.height = Math.round(this.height * dpr);
      this.context.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.buildDots();
    }

    buildDots() {
      const step = innerWidth < 700 ? 28 : 24;
      const padX = (this.width % step) / 2 + step / 2;
      const padY = (this.height % step) / 2 + step / 2;
      const dots = [];
      for (let y = padY; y < this.height; y += step) {
        for (let x = padX; x < this.width; x += step) {
          dots.push({ ax: x, ay: y, x, y });
        }
      }
      this.dots = dots;
    }

    draw() {
      const rect = this.section.getBoundingClientRect();
      const mouseX = pointer.x - rect.left;
      const mouseY = pointer.y - rect.top;
      const inside = mouseX >= 0 && mouseX <= this.width && mouseY >= 0 && mouseY <= this.height;
      const target = inside ? Math.min(pointer.speed / 7, 1) : 0;
      this.engagement += (target - this.engagement) * .08;

      const context = this.context;
      context.clearRect(0, 0, this.width, this.height);
      const gradient = context.createLinearGradient(0, 0, this.width, this.height);
      gradient.addColorStop(0, this.colors[0]);
      gradient.addColorStop(1, this.colors[1]);
      context.fillStyle = gradient;
      context.beginPath();

      const radius = Math.min(280, Math.max(150, this.width * .28));
      for (const dot of this.dots) {
        const dx = mouseX - dot.ax;
        const dy = mouseY - dot.ay;
        const distance = Math.hypot(dx, dy) || 1;
        let targetX = dot.ax;
        let targetY = dot.ay;
        let size = 1.2;

        if (inside && distance < radius && this.engagement > .005) {
          const influence = 1 - distance / radius;
          const push = influence * influence * 74 * this.engagement;
          targetX -= dx / distance * push;
          targetY -= dy / distance * push;
          size += influence * 1.35 * this.engagement;
        }

        dot.x += (targetX - dot.x) * .16;
        dot.y += (targetY - dot.y) * .16;
        context.moveTo(dot.x + size, dot.y);
        context.arc(dot.x, dot.y, size, 0, TWO_PI);
      }
      context.fill();
    }
  }

  document.querySelectorAll("main.hero, section.about, section.services, section.cases, section.contact")
    .forEach(section => fields.push(new DotField(section)));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const field = fields.find(item => item.section === entry.target);
      if (field) field.visible = entry.isIntersecting;
    });
  }, { threshold: .01 });
  fields.forEach(field => observer.observe(field.section));

  window.addEventListener("pointermove", event => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  }, { passive: true });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => fields.forEach(field => field.resize()), 120);
  });

  let lastFrame = 0;
  function animate(time) {
    if (time - lastFrame < 50) {
      requestAnimationFrame(animate);
      return;
    }
    lastFrame = time;
    const anyVisible = fields.some(f => f.visible);
    if (!anyVisible && pointer.speed < .02) {
      requestAnimationFrame(animate);
      return;
    }
    const dx = pointer.x - pointer.px;
    const dy = pointer.y - pointer.py;
    const currentSpeed = Math.hypot(dx, dy);
    pointer.speed += (currentSpeed - pointer.speed) * .36;
    pointer.speed *= .9;
    pointer.px = pointer.x;
    pointer.py = pointer.y;
    fields.forEach(field => {
      if (field.visible) field.draw();
    });
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
})();
