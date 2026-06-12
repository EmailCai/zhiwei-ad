(() => {
  const groups = [
    [".hero-header", ".slogan-particles"],
    [".about-heading", ".about-copy"],
    [".services-heading", ".services-title", ".services-description", ".service-list", ".service-graphic"],
    [".cases-heading", ".case-item"],
    [".contact-heading", ".contact-details", ".wechat-contact"]
  ];

  const elements = [];
  groups.forEach(selectors => {
    let index = 0;
    selectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(element => {
        element.classList.add("section-reveal");
        element.style.setProperty("--reveal-delay", `${Math.min(index * 90, 450)}ms`);
        elements.push(element);
        index += 1;
      });
    });
  });

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    elements.forEach(element => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: .08 });

  elements.forEach(element => observer.observe(element));
})();
