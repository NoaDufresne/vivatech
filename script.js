const wrapper = document.getElementById("svg-wrapper");
const header = document.querySelector(".top-header"); // <-- Reference the header
let selectedGlow = null;


// Define which zones we want to make clickable
const levelIds = ["level-1", "level-2", "level-3", "level-4"];

fetch("test-code2.svg")
  .then(res => res.text())
  .then(svgText => {
    wrapper.innerHTML = svgText;
    const svg = wrapper.querySelector("svg");

    // Move all glow ellipses behind everything
    levelIds.forEach(levelId => {
      const group = svg.getElementById(`${levelId}-group`);
      if (group) {
        const glow = group.querySelector(".glow");
        if (glow) {
          const clonedGlow = glow.cloneNode(true);
          svg.insertBefore(clonedGlow, svg.firstChild);
          glow.remove();
          group._glow = clonedGlow;
        }
      }
    });

    // Event bindings
    levelIds.forEach(levelId => {
      const polygon = svg.getElementById(levelId);
      const group = svg.getElementById(`${levelId}-group`);
      const glow = group?._glow;

      if (polygon) {
        // Zoom on click and show popup
        polygon.addEventListener("click", () => {
          zoomToPolygon(polygon, svg);
          showPopup(levelId);

          // Show glow for selected level
          if (selectedGlow) {
            selectedGlow.style.opacity = 0;
          }
          if (glow) {
            glow.style.transition = "opacity 0.3s ease";
            glow.style.opacity = 1;
            selectedGlow = glow;
          }
        });

        // Glow on hover
        if (glow) {
          polygon.addEventListener("mouseenter", () => {
            glow.style.transition = "opacity 0.3s ease";
            glow.style.opacity = 1;
          });
          polygon.addEventListener("mouseleave", () => {
          if (glow !== selectedGlow) {
            glow.style.transition = "opacity 0.3s ease";
            glow.style.opacity = 0;
            }
          });
        }
      }
    });

    // Escape key resets zoom and popup
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        resetZoom(svg);
        hidePopup();
      }
    });

    // Click outside polygons resets zoom and popup
    document.addEventListener("click", (e) => {
      const isInside = levelIds.some(id => {
        const polygon = svg.getElementById(id);
        return polygon && polygon.contains(e.target);
      });

      if (!isInside) {
        resetZoom(svg);
        hidePopup();
      }
    });

    // Close button on popup
    const popupClose = document.getElementById("popup-close");
    popupClose.addEventListener("click", () => {
      resetZoom(svg);
      hidePopup();
    });
  });

function zoomToPolygon(polygon, svg) {
  const bbox = polygon.getBBox();
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;

  const scale = 2;

  svg.style.transition = "transform 2s cubic-bezier(0.4, 0, 0.2, 1)";
  svg.style.transformOrigin = `${cx}px ${cy}px`;
  svg.style.transform = `scale(${scale})`;

  // Hide header when zooming in
  if (header) {
    header.style.opacity = "0";
    header.style.pointerEvents = "none";
  }

  const polygonRect = polygon.getBoundingClientRect();
  const polygonCenterX = polygonRect.left + polygonRect.width / 2;
  const polygonCenterY = polygonRect.top + polygonRect.height / 2;

  const viewportCenterX = window.innerWidth / 2;
  const viewportCenterY = window.innerHeight / 2;

  const scrollX = polygonCenterX - viewportCenterX;
  const scrollY = polygonCenterY - viewportCenterY;

  window.scrollBy({
    top: scrollY,
    left: scrollX,
    behavior: 'smooth'
  });
}

function resetZoom(svg) {
  svg.style.transition = "transform 2s cubic-bezier(0.4, 0, 0.2, 1)";
  svg.style.transform = "scale(1)";

  if (header) {
    header.style.opacity = "1";
    header.style.pointerEvents = "auto";
  }

  if (selectedGlow) {
    selectedGlow.style.opacity = 0;
    selectedGlow = null;
  }
}


function showPopup(levelId) {
  const popup = document.getElementById("popup");
  const title = document.getElementById("popup-title");
  const content = document.getElementById("popup-content");

  const levelData = {
    "level-1": {
      title: "Artificial intelligence",
      content: "Welcome to the heart of innovation in AI. This floor brings together breakthroughs in machine learning, generative models, robotics, and autonomous systems. From real-world applications in business and health to ethical challenges and creative uses of AI, explore how artificial intelligence is reshaping industries—and our everyday lives. Engage with demos, meet pioneers, and imagine the possibilities.",
      className: "level-1",
      position: "popup-bottom-right"
    },
    "level-2": {
      title: "Cyber Security",
      content: "Dive into the digital battleground. As technology becomes more powerful, so do the threats we face. This level is dedicated to cybersecurity in all its forms: data protection, ethical hacking, digital sovereignty, and resilience in a connected world. Explore how organizations and innovators are building trust, defending privacy, and staying ahead of cyber risks in a rapidly evolving landscape.",
      className: "level-2",
      position: "popup-bottom-left"
    },
    "level-3": {
      title: "Health",
      content: "Discover how technology is transforming the way we understand and care for the human body and mind. This floor brings together innovations in biotech, medtech, mental health, nutrition, and personalized medicine. From AI-assisted diagnosis to longevity research and digital therapeutics, explore how tech is not only extending lifespans—but improving quality of life for all.",
      className: "level-3",
      position: "popup-bottom-right"
    },
    "level-4": {
      title: "Sustainability",
      content: "The top floor is dedicated to the urgent challenges of our planet and the bold solutions shaping a sustainable future. Discover innovations in clean energy, smart mobility, eco-design, and circular economy systems. Explore how technology, policy, and creativity intersect to build greener cities, reduce emissions, and rethink how we live, move, and consume in harmony with the Earth.",
      className: "level-4",
      position: "popup-bottom-left"
    }
  };

  // Remove previous classes
  popup.classList.remove("level-1", "level-2", "level-3", "level-4");
  popup.classList.remove("popup-bottom-right", "popup-bottom-left");

  const data = levelData[levelId];
  if (data) {
    title.textContent = data.title;
    content.textContent = data.content;
    popup.classList.add(data.className);
    popup.classList.add(data.position);
    popup.classList.add("visible");
    popup.classList.remove("hidden");
  }
}

function hidePopup() {
  const popup = document.getElementById("popup");
  popup.classList.remove("visible");
  popup.classList.add("hidden");

  // Hide glow if needed
  if (selectedGlow) {
    selectedGlow.style.opacity = 0;
    selectedGlow = null;
  }
}


document.getElementById("popup-close").addEventListener("click", () => {
  const popup = document.getElementById("popup");
  popup.classList.remove("visible");
});
