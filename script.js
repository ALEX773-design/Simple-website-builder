const builder = document.getElementById('builder');
const preview = document.getElementById('preview');
const exportModal = document.getElementById('exportModal');
const exportCode = document.getElementById('exportCode');
const settingsPanel = document.getElementById('settingsPanel');
const textColorPicker = document.getElementById('textColorPicker');
const fontSizePicker = document.getElementById('fontSizePicker');

let selectedBlock = null;

function addBlock(type) {
  const placeholder = builder.querySelector('.placeholder');
  if (placeholder) placeholder.remove();

  const block = document.createElement('div');
  block.className = 'block';

  const controls = document.createElement('div');
  controls.className = 'block-controls';
  controls.innerHTML = '<button onclick="this.parentElement.parentElement.remove()">Delete</button>';
  block.appendChild(controls);

  let content;
  if (type === 'heading') {
    content = document.createElement('h2');
    content.contentEditable = 'true';
    content.textContent = 'Sample Heading';
  } else if (type === 'text') {
    content = document.createElement('p');
    content.contentEditable = 'true';
    content.textContent = 'Sample paragraph text editable by clicking.';
  } else if (type === 'image') {
    content = document.createElement('img');
    content.src = 'https://via.placeholder.com/600x200';
    content.style.maxWidth = '100%';
  } else if (type === 'button') {
    content = document.createElement('button');
    content.className = 'custom-btn';
    content.textContent = 'Click Action';
  } else if (type === 'card') {
    content = document.createElement('div');
    content.className = 'card-box';
    content.innerHTML = '<h3 contenteditable="true">Card Title</h3><p contenteditable="true">Card description body text.</p>';
  } else if (type === 'divider') {
    content = document.createElement('hr');
  }

  block.appendChild(content);
  builder.appendChild(block);
}

builder.addEventListener('click', e => {
  const block = e.target.closest('.block');
  if (!block || e.target.closest('.block-controls')) return;

  selectedBlock = e.target === block ? block.querySelector('*:not(.block-controls)') : e.target;
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

function applyTheme(theme) {
  builder.className = `builder-area theme-${theme}`;
  preview.className = `preview-area hidden theme-${theme}`;
}

function getCleanHTML() {
  const clone = builder.cloneNode(true);
  clone.querySelectorAll('.block-controls, .placeholder').forEach(el => el.remove());
  clone.querySelectorAll('.block').forEach(b => b.classList.remove('block'));
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
  return clone.innerHTML.trim();
}

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
  alert('Saved locally!');
});

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Clear workspace?')) {
    builder.innerHTML = '<p class="placeholder">Select an element from the left sidebar to add it to your canvas.</p>';
  }
});

document.getElementById('exportBtn').addEventListener('click', () => {
  exportCode.value = getCleanHTML();
  exportModal.classList.remove('hidden');
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const page = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Exported Page</title><style>body{font-family:system-ui;padding:20px;max-width:1000px;margin:0 auto;}.custom-btn{padding:8px 16px;background:#4f46e5;color:white;border:none;border-radius:6px;}.card-box{padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;}</style></head><body>${getCleanHTML()}</body></html>`;
  const blob = new Blob([page], { type: 'text/html' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'index.html';
  a.click();
});

function closeModal() {
  exportModal.classList.add('hidden');
}

function rgbToHex(rgb) {
  const res = rgb.match(/\d+/g);
  return res ? '#' + res.slice(0, 3).map(x => parseInt(x, 10).toString(16).padStart(2, '0')).join('') : '#000000';
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('builderContent');
  if (saved) builder.innerHTML = saved;
});
