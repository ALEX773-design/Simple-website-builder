const builder = document.getElementById('builder');
const preview = document.getElementById('preview');
const exportModal = document.getElementById('exportModal');
const exportCode = document.getElementById('exportCode');
let selectedBlock = null;
let undoStack = [];
let redoStack = [];

// Add block
function addBlock(type) {
  const block = document.createElement("div");
  block.classList.add("block");
  block.setAttribute("draggable", "true");
  block.id = `block-${Date.now()}`;

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "❌";
  deleteBtn.className = "delete-btn";
  deleteBtn.onclick = () => block.remove();

  let content;
  switch (type) {
    case "text":
      content = document.createElement("p");
      content.contentEditable = true;
      content.textContent = "Editable Text";
      break;
    case "heading":
      content = document.createElement("h2");
      content.contentEditable = true;
      content.textContent = "Heading Text";
      break;
    case "image":
      content = document.createElement("img");
      content.src = "assets/default.png";
      content.alt = "Image";
      content.style.width = "100%";
      break;
    case "button":
      content = document.createElement("button");
      content.textContent = "Click Me";
      break;
    case "link":
      content = document.createElement("a");
      content.href = "#";
      content.textContent = "Link Text";
      break;
    case "divider":
      content = document.createElement("hr");
      break;
    case "input":
      content = document.createElement("input");
      content.type = "text";
      content.placeholder = "Enter text here";
      break;
    case "card":
      content = document.createElement("div");
      content.classList.add("card");
      const cardTitle = document.createElement("h3");
      cardTitle.contentEditable = true;
      cardTitle.textContent = "Card Title";
      const cardText = document.createElement("p");
      cardText.contentEditable = true;
      cardText.textContent = "Card content here...";
      content.appendChild(cardTitle);
      content.appendChild(cardText);
      break;
    case "form":
      content = document.createElement("form");
      const inputField = document.createElement("input");
      inputField.type = "text";
      inputField.placeholder = "Your input here";
      const submitButton = document.createElement("button");
      submitButton.type = "submit";
      submitButton.textContent = "Submit";
      content.appendChild(inputField);
      content.appendChild(submitButton);
      break;
    default:
      console.warn("Unknown block type:", type);
      return;
  }

  block.appendChild(deleteBtn);
  block.appendChild(content);

  block.addEventListener("dragstart", e => {
    e.dataTransfer.setData("text/plain", block.id);
    block.classList.add("dragging");
  });

  block.addEventListener("dragend", () => {
    block.classList.remove("dragging");
  });

  builder.appendChild(block);
  saveState();
}

// Drag and Drop
builder.addEventListener("dragover", e => {
  e.preventDefault();
  const dragging = document.querySelector(".dragging");
  const after = getDragAfterElement(builder, e.clientY);
  if (!after) {
    builder.appendChild(dragging);
  } else {
    builder.insertBefore(dragging, after);
  }
});

function getDragAfterElement(container, y) {
  const blocks = [...container.querySelectorAll(".block:not(.dragging)")];
  return blocks.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Undo and Redo functionality
function saveState() {
  undoStack.push(builder.innerHTML);
  if (undoStack.length > 20) undoStack.shift(); // Limit the stack size
  redoStack = []; // Clear redo stack on new action
}

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(builder.innerHTML);
    builder.innerHTML = undoStack.pop();
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(builder.innerHTML);
    builder.innerHTML = redoStack.pop();
  }
}

// Dark mode toggle
document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

// Load theme and saved content
window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
  const saved = localStorage.getItem('builderContent');
  if (saved) builder.innerHTML = saved;
});

// Preview
document.getElementById('previewBtn').addEventListener('click', () => {
  if (preview.classList.contains('hidden')) {
    preview.innerHTML = builder.innerHTML;
    preview.classList.remove('hidden');
    builder.classList.add('hidden');
  } else {
    preview.classList.add('hidden');
    builder.classList.remove('hidden');
  }
});

// Save and Export
document.getElementById('saveBtn').addEventListener('click', () => {
  localStorage.setItem('builderContent', builder.innerHTML);
  alert('Saved to localStorage!');
});

document.getElementById('exportBtn').addEventListener('click', () => {
  exportCode.value = builder.innerHTML;
  exportModal.classList.remove('hidden');
});

function closeModal() {
  exportModal.classList.add('hidden');
}

// Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service.worker.js')
      .then(reg => console.log("Service Worker registered:", reg.scope))
      .catch(err => console.error("Service Worker failed:", err));
  });
}

// Block click: open settings panel
builder.addEventListener("click", function (e) {
  const block = e.target.closest(".block");
  if (!block || e.target.classList.contains("delete-btn")) return;

  selectedBlock = e.target.tagName === "DIV" ? block.querySelector("*:not(.delete-btn)") : e.target;
  if (!selectedBlock) return;

  const settingsPanel = document.getElementById("settingsPanel");
  settingsPanel.classList.remove("hidden");

  const computed = window.getComputedStyle(selectedBlock);
  document.getElementById("textColorPicker").value = rgbToHex(computed.color || "#000000");
  document.getElementById("fontSizePicker").value = parseInt(computed.fontSize) || 16;
});

// Apply style settings
function applySettings() {
  if (!selectedBlock) return;
  const color = document.getElementById("textColorPicker").value;
  const fontSize = document.getElementById("fontSizePicker").value;
  selectedBlock.style.color = color;
  selectedBlock.style.fontSize = fontSize + "px";
}

// Convert rgb to hex
function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return "#000000";
  return "#" + result.map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
}

// Collapse layout toggle
function toggleLayout () {
  const sidebar = document.querySelector('.sidebar');
  sidebar.classList.toggle('collapsed');
  document.body.classList.toggle('collapsed');
  sidebar.querySelectorAll('button').forEach(btn => {
    const parts = btn.textContent.trim().split(/ (.+)/);
    const icon = parts[0];
    const label = parts[1] || '';
    if (sidebar.classList.contains('collapsed')) {
      if (!btn.dataset.full) btn.dataset.full = btn.textContent;
      btn.textContent = icon;
    } else {
      btn.textContent = btn.dataset.full || (icon + ' ' + label);
    }
  });
}

// Deselect on outside click
document.addEventListener('click', function (e) {
  const panel = document.getElementById('settingsPanel');
  if (!panel.contains(e.target) && !e.target.closest('.block')) {
    panel.classList.add('hidden');
    selectedBlock = null;
  }
});

// Attach undo/redo to buttons
document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);