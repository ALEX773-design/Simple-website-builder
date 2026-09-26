const builder = document.getElementById('builder');
const preview = document.getElementById('preview');
const exportModal = document.getElementById('exportModal');
const exportCode = document.getElementById('exportCode');
const settingsPanel = document.getElementById('settingsPanel');
const textColorPicker = document.getElementById('textColorPicker');
const fontSizePicker = document.getElementById('fontSizePicker');

let selectedBlock = null;
let undoStack = [];
let redoStack = [];

function saveState() {
  undoStack.push(builder.innerHTML);
  if (undoStack.length > 20) undoStack.shift();
  redoStack = [];
}

function undo() {
  if (undoStack.length > 0) {
    redoStack.push(builder.innerHTML);
    builder.innerHTML = undoStack.pop();
    rebindEvents();
  }
}

function redo() {
  if (redoStack.length > 0) {
    undoStack.push(builder.innerHTML);
    builder.innerHTML = redoStack.pop();
    rebindEvents();
  }
}

function rebindEvents() {
  const blocks = builder.querySelectorAll('.block');
  blocks.forEach(block => attachBlockEvents(block));
}

function attachBlockEvents(block) {
  block.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', block.id);
    block.classList.add('dragging');
  });

  block.addEventListener('dragend', () => {
    block.classList.remove('dragging');
  });

  const deleteBtn = block.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      saveState();
      block.remove();
    };
  }
}

function addBlock(type) {
  saveState();
  const placeholder = builder.querySelector('.placeholder');
  if (placeholder) placeholder.remove();

  const block = document.createElement('div');
  block.classList.add('block');
  block.setAttribute('draggable', 'true');
  block.id = `block-${Date.now()}`;

  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '×';
  deleteBtn.className = 'delete-btn';

  let content;
  switch (type) {
    case 'text':
      content = document.createElement('p');
      content.contentEditable = 'true';
      content.textContent = 'Editable text paragraph.';
      break;
    case 'heading':
      content = document.createElement('h2');
      content.contentEditable = 'true';
      content.textContent = 'Heading text';
      break;
    case 'image':
      content = document.createElement('img');
      content.src = 'https://via.placeholder.com/600x300';
      content.alt = 'Placeholder image';
      content.style.width = '100%';
      break;
    case 'button':
      content = document.createElement('button');
      content.textContent = 'Click Me';
      break;
    case 'link':
      content = document.createElement('a');
      content.href = '#';
      content.textContent = 'Sample link';
      break;
    case 'divider':
      content = document.createElement('hr');
      break;
    case 'input':
      content = document.createElement('input');
      content.type = 'text';
      content.placeholder = 'Enter input text';
      break;
    case 'card':
      content = document.createElement('div');
      content.classList.add('card');
      content.innerHTML = '<h3 contenteditable="true">Card title</h3><p contenteditable="true">Card body content goes here.</p>';
      break;
    case 'form':
      content = document.createElement('form');
      content.innerHTML = '<input type="text" placeholder="Your name"><button type="submit">Submit</button>';
      break;
    default:
      return;
  }

  block.appendChild(deleteBtn);
  block.appendChild(content);
  attachBlockEvents(block);
  builder.appendChild(block);
}

builder.addEventListener('dragover', e => {
  e.preventDefault();
  const dragging = document.querySelector('.dragging');
  if (!dragging) return;
  const after = getDragAfterElement(builder, e.clientY);
  if (!after) {
    builder.appendChild(dragging);
  } else {
    builder.insertBefore(dragging, after);
  }
});

function getDragAfterElement(container, y) {
  const blocks = [...container.querySelectorAll('.block:not(.dragging)')];
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

builder.addEventListener('click', e => {
  const block = e.target.closest('.block');
  if (!block || e.target.classList.contains('delete-btn')) return;

  selectedBlock = e.target === block ? block.querySelector('*:not(.delete-btn)') : e.target;
  if (!selectedBlock) return;

  settingsPanel.classList.remove('hidden');
  const computed = window.getComputedStyle(selectedBlock);
  textColorPicker.value = rgbToHex(computed.color || '#000000');
  fontSizePicker.value = parseInt(computed.fontSize, 10) || 16;
});

function applySettings() {
  if (!selectedBlock) return;
  selectedBlock.style.color = textColorPicker.value;
  selectedBlock.style.fontSize = fontSizePicker.value + 'px';
}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return '#000000';
  return '#' + result.slice(0, 3).map(x => parseInt(x, 10).toString(16).padStart(2, '0')).join('');
}

function toggleLayout() {
  document.body.classList.toggle('collapsed');
}

document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

document.getElementById('previewBtn').addEventListener('click', () => {
  if (preview.classList.contains('hidden')) {
    preview.innerHTML = getCleanHTML();
    preview.classList.remove('hidden');
    builder.classList.add('hidden');
  } else {
    preview.classList.add('hidden');
    builder.classList.remove('hidden');
  }
});

document.getElementById('saveBtn').addEventListener('click', () => {
  localStorage.setItem('builderContent', builder.innerHTML);
  alert('Project saved to local storage!');
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Clear all blocks from canvas?')) {
    saveState();
    builder.innerHTML = '<p class="placeholder">Start building your app here...</p>';
  }
});

document.getElementById('exportBtn').addEventListener('click', () => {
  exportCode.value = getCleanHTML();
  exportModal.classList.remove('hidden');
});

function closeModal() {
  exportModal.classList.add('hidden');
}

function getCleanHTML() {
  const clone = builder.cloneNode(true);
  clone.querySelectorAll('.delete-btn, .placeholder').forEach(el => el.remove());
  clone.querySelectorAll('.block').forEach(block => {
    block.removeAttribute('draggable');
    block.removeAttribute('id');
    block.classList.remove('block', 'dragging');
  });
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
  return clone.innerHTML.trim();
}

document.addEventListener('click', e => {
  if (!settingsPanel.contains(e.target) && !e.target.closest('.block')) {
    settingsPanel.classList.add('hidden');
    selectedBlock = null;
  }
});

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);

window.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
  const saved = localStorage.getItem('builderContent');
  if (saved) {
    builder.innerHTML = saved;
    rebindEvents();
  }
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service.worker.js')
      .then(reg => console.log('Service Worker registered:', reg.scope))
      .catch(err => console.error('Service Worker failed:', err));
  });
}
