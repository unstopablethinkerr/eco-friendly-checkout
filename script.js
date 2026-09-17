const dustbin = document.getElementById("dustbin");
const dustbinImage = document.getElementById("dustbin-image");
const cleanupArea = document.getElementById("cleanup-area");
const cleanupCard = document.getElementById("cleanup-card");
const sortCounter = document.getElementById("sort-counter");
const successMessage = document.getElementById("success-message");
const interactionHint = document.getElementById("interaction-hint");
const checkoutButton = document.getElementById("checkout-button");
const demoMessage = document.getElementById("demo-message");

const wasteItems = [...document.querySelectorAll(".waste")];

let sortedCount = 0;
let activeWaste = null;
let pointerOffsetX = 0;
let pointerOffsetY = 0;

// --------------------------------------------------
// Dustbin states
// --------------------------------------------------

function openDustbin() {
  dustbinImage.src = "asset/dustbin-open.png";
  dustbinImage.alt = "Open dustbin";
  dustbin.classList.add("drag-over");
}

function closeDustbin() {
  dustbinImage.src = "asset/dustbin-closed.png";
  dustbinImage.alt = "Closed dustbin";
  dustbin.classList.remove("drag-over");
}

// --------------------------------------------------
// Check whether a point is inside the dustbin
// --------------------------------------------------

function isInsideDustbin(clientX, clientY) {
  const rect = dustbin.getBoundingClientRect();

  return (
    clientX >= rect.left - 18 &&
    clientX <= rect.right + 18 &&
    clientY >= rect.top - 18 &&
    clientY <= rect.bottom + 18
  );
}

// --------------------------------------------------
// Sort one waste item
// --------------------------------------------------

function sortWaste(item) {
  if (!item || item.classList.contains("removing")) return;

  item.classList.remove("dragging");
  item.classList.add("removing");

  sortedCount++;
  sortCounter.textContent = `${sortedCount} / ${wasteItems.length} sorted`;

  // Remove visual position styles after animation
  setTimeout(() => {
    item.style.display = "none";
  }, 450);

  if (sortedCount < wasteItems.length) {
    interactionHint.textContent = "Nice! Keep going.";
  }

  if (sortedCount === wasteItems.length) {
    setTimeout(() => {
      cleanupCard.classList.add("completed");
      successMessage.classList.add("show");
      interactionHint.textContent = "";
      checkoutButton.disabled = false;
    }, 450);
  }
}

// --------------------------------------------------
// Native desktop drag and drop
// --------------------------------------------------

wasteItems.forEach((item) => {
  item.addEventListener("dragstart", (event) => {
    activeWaste = item;
    item.classList.add("dragging");

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item.dataset.waste);

    openDustbin();
  });

  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
    closeDustbin();
    activeWaste = null;
  });

  // Keyboard accessibility
  item.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      sortWaste(item);
    }
  });
});

dustbin.addEventListener("dragover", (event) => {
  event.preventDefault();
  openDustbin();
  event.dataTransfer.dropEffect = "move";
});

dustbin.addEventListener("dragleave", () => {
  closeDustbin();
});

dustbin.addEventListener("drop", (event) => {
  event.preventDefault();

  const item = activeWaste;
  closeDustbin();

  if (item) {
    sortWaste(item);
  }

  activeWaste = null;
});

// --------------------------------------------------
// Touch / pointer drag for mobile
// --------------------------------------------------

wasteItems.forEach((item) => {
  item.addEventListener("pointerdown", (event) => {
    if (item.classList.contains("removing")) return;

    event.preventDefault();

    activeWaste = item;

    const rect = item.getBoundingClientRect();

    pointerOffsetX = event.clientX - rect.left;
    pointerOffsetY = event.clientY - rect.top;

    item.classList.add("dragging");

    item.setPointerCapture?.(event.pointerId);
  });

  item.addEventListener("pointermove", (event) => {
    if (activeWaste !== item) return;

    const areaRect = cleanupArea.getBoundingClientRect();

    item.style.left = `${event.clientX - areaRect.left - pointerOffsetX}px`;
    item.style.top = `${event.clientY - areaRect.top - pointerOffsetY}px`;
    item.style.right = "auto";
    item.style.transform = "scale(1.12) rotate(5deg)";

    if (isInsideDustbin(event.clientX, event.clientY)) {
      openDustbin();
    } else {
      closeDustbin();
    }
  });

  item.addEventListener("pointerup", (event) => {
    if (activeWaste !== item) return;

    const droppedInBin = isInsideDustbin(event.clientX, event.clientY);

    if (droppedInBin) {
      openDustbin();
      sortWaste(item);

      // Close the bin after the waste-drop animation
      setTimeout(() => {
        closeDustbin();
      }, 500);
    } else {
      resetWastePosition(item);
      closeDustbin();
    }

    activeWaste = null;
  });

  item.addEventListener("pointercancel", () => {
    resetWastePosition(item);
    closeDustbin();
    activeWaste = null;
  });
});

// --------------------------------------------------
// Reset item if dropped outside the bin
// --------------------------------------------------

function resetWastePosition(item) {
  item.style.left = "";
  item.style.top = "";
  item.style.right = "";
  item.style.transform = "";
  item.classList.remove("dragging");
}

// --------------------------------------------------
// Checkout button
// --------------------------------------------------

checkoutButton.addEventListener("click", () => {
  const addressForm = document.getElementById("address-form");

  if (!addressForm.checkValidity()) {
    addressForm.reportValidity();
    return;
  }

  demoMessage.textContent =
    "Demo: payment step is ready to open ✓";

  checkoutButton.textContent = "Payment step ready ✓";
  checkoutButton.disabled = true;
});
