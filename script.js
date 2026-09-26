const builder = document.getElementById('builder');
const preview = document.getElementById('preview');
const exportModal = document.getElementById('exportModal');
const seoModal = document.getElementById('seoModal');
const cssModal = document.getElementById('cssModal');
const exportCode = document.getElementById('exportCode');
const customCssInput = document.getElementById('customCssInput');
const settingsPanel = document.getElementById('settingsPanel');
const richTextBar = document.getElementById('richTextBar');
const saveStatus = document.getElementById('saveStatus');

// Inputs
const textColorPicker = document.getElementById('textColorPicker');
const bgColorPicker = document.getElementById('bgColorPicker');
const fontSizePicker = document.getElementById('fontSizePicker');
const fontFamilyPicker = document.getElementById('fontFamilyPicker');
const alignmentPicker = document.getElementById('alignmentPicker');
const paddingPicker = document.getElementById('paddingPicker');
const borderRadiusPicker = document.getElementById('borderRadiusPicker');
const linkSettingsGroup = document.getElementById('linkSettingsGroup');
const linkUrlInput = document.getElementById('linkUrlInput');
const linkTargetInput = document.getElementById('linkTargetInput');
const imageUploadGroup = document.getElementById('imageUploadGroup');

let selectedBlock = null;
let undoStack = [];
let redoStack = [];
let globalCustomCss = "";
let seoData = { title: "My Custom Website", description: "", image: "" };

function saveState() {
  undoStack.push(builder.innerHTML);
  if (undoStack.length > 25) undoStack.shift();
  redoStack = [];
  updateSaveStatus('Unsaved changes');
}

function updateSaveStatus(msg) {
  if (saveStatus) saveStatus.textContent = msg;
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

function moveBlock(block, direction) {
  saveState();
  if (direction === 'up' && block.previousElementSibling && !block.previousElementSibling.classList.contains('placeholder')) {
    builder.insertBefore(block, block.previousElementSibling);
  } else if (direction === 'down' && block.nextElementSibling) {
    builder.insertBefore(block.nextElementSibling, block);
  }
}

function duplicateBlock(block) {
  saveState();
  const clone = block.cloneNode(true);
  clone.id = `block-${Date.now()}`;
  attachBlockEvents(clone);
  block.after(clone);
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

  const dupBtn = block.querySelector('.dup-btn');
  if (dupBtn) {
    dupBtn.onclick = (e) => {
      e.stopPropagation();
      duplicateBlock(block);
    };
  }

  const upBtn = block.querySelector('.up-btn');
  if (upBtn) {
    upBtn.onclick = (e) => {
      e.stopPropagation();
      moveBlock(block, 'up');
    };
  }

  const downBtn = block.querySelector('.down-btn');
  if (downBtn) {
    downBtn.onclick = (e) => {
      e.stopPropagation();
      moveBlock(block, 'down');
    };
  }
}

function createControls() {
  const controls = document.createElement('div');
  controls.className = 'block-controls';
  controls.innerHTML = `
    <button class="up-btn" title="Move Up">↑</button>
    <button class="down-btn" title="Move Down">↓</button>
    <button class="dup-btn" title="Duplicate Block">📋</button>
    <button class="delete-btn" title="Delete Block">×</button>
  `;
  return controls;
}

function addBlock(type) {
  saveState();
  const placeholder = builder.querySelector('.placeholder');
  if (placeholder) placeholder.remove();

  const block = document.createElement('div');
  block.classList.add('block');
  block.setAttribute('draggable', 'true');
  block.id = `block-${Date.now()}`;

  block.appendChild(createControls());

  let content;
  switch (type) {
    case 'heading':
      content = document.createElement('h2');
      content.contentEditable = 'true';
      content.textContent = 'Editable Heading';
      break;
    case 'text':
      content = document.createElement('p');
      content.contentEditable = 'true';
      content.textContent = 'High-converting text block for detailed explanations or introduction.';
      break;
    case 'badge':
      content = document.createElement('span');
      content.className = 'badge-pill';
      content.contentEditable = 'true';
      content.textContent = 'NEW FEATURE';
      break;
    case 'image':
      content = document.createElement('img');
      content.src = 'https://via.placeholder.com/800x400';
      content.alt = 'Graphic container';
      content.style.width = '100%';
      break;
    case 'button':
      content = document.createElement('button');
      content.className = 'custom-action-btn';
      content.textContent = 'Get Started Now';
      break;
    case 'hero':
      content = document.createElement('div');
      content.className = 'hero-section';
      content.innerHTML = `
        <span class="badge-pill" contenteditable="true">v2.0 Released</span>
        <h1 contenteditable="true">Build Faster Without Complexity</h1>
        <p contenteditable="true">Create, customize, and publish beautiful web apps directly in your browser.</p>
        <button class="custom-action-btn">Start Free Trial</button>
      `;
      break;
    case 'features':
      content = document.createElement('div');
      content.className = 'feature-grid';
      content.innerHTML = `
        <div class="feature-card"><h4 contenteditable="true">⚡ Fast Performance</h4><p contenteditable="true">Zero heavy frameworks, clean static HTML output.</p></div>
        <div class="feature-card"><h4 contenteditable="true">🎨 Theme Engine</h4><p contenteditable="true">Instantly switch font and color styling across elements.</p></div>
        <div class="feature-card"><h4 contenteditable="true">📱 Fully Responsive</h4><p contenteditable="true">Layouts render cleanly on desktop, tablet, and phone.</p></div>
      `;
      break;
    case 'pricing':
      content = document.createElement('div');
      content.className = 'pricing-grid';
      content.innerHTML = `
        <div class="pricing-card">
          <h3 contenteditable="true">Starter</h3>
          <div class="price" contenteditable="true">$0</div>
          <p contenteditable="true">Basic site builder features</p>
          <button class="custom-action-btn">Choose Starter</button>
        </div>
        <div class="pricing-card featured">
          <h3 contenteditable="true">Pro</h3>
          <div class="price" contenteditable="true">$19/mo</div>
          <p contenteditable="true">Unlimited exports & SEO tools</p>
          <button class="custom-action-btn">Choose Pro</button>
        </div>
      `;
      break;
    case 'faq':
      content = document.createElement('div');
      content.className = 'faq-container';
      content.innerHTML = `
        <details><summary contenteditable="true">Can I host exported sites on GitHub Pages?</summary><p contenteditable="true">Yes! Exported files are clean, standard HTML/CSS files.</p></details>
        <details><summary contenteditable="true">Do I need a backend server?</summary><p contenteditable="true">No server is needed. Everything executes inside the user browser.</p></details>
      `;
      break;
    case 'testimonial':
      content = document.createElement('div');
      content.className = 'testimonial-card';
      content.innerHTML = `
        <p contenteditable="true">"This builder made launching our project homepage simple and fast."</p>
        <strong contenteditable="true">— Jane Doe, Product Creator</strong>
      `;
      break;
    case 'columns':
      content = document.createElement('div');
      content.className = 'two-column-grid';
      content.innerHTML = `
        <div class="col" contenteditable="true">Left column content block.</div>
        <div class="col" contenteditable="true">Right column content block.</div>
      `;
      break;
    case 'footer':
      content = document.createElement('footer');
      content.className = 'site-footer';
      content.innerHTML = `
        <p contenteditable="true">© 2026 Web App Builder. All rights reserved.</p>
      `;
      break;
    case 'video':
      content = document.createElement('div');
      content.className = 'video-container';
      content.innerHTML = '<iframe width="100%" height="315" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>';
      break;
    case 'form':
      content = document.createElement('form');
      content.className = 'sample-form';
      content.innerHTML = `
        <input type="text" placeholder="Your Name" required />
        <input type="email" placeholder="Your Email" required />
        <textarea placeholder="Message details..."></textarea>
        <button type="submit">Send Message</button>
      `;
      break;
    case 'input':
      content = document.createElement('input');
      content.type = 'text';
      content.placeholder = 'Sample form input box';
      break;
    case 'divider':
      content = document.createElement('hr');
      break;
    case 'html':
      content = document.createElement('div');
      content.className = 'raw-html-block';
      content.contentEditable = 'true';
      content.textContent = '<div style="padding:15px; background:#e0f2fe; border-radius:6px;">Custom Raw HTML Block</div>';
      break;
    default:
      return;
  }

  block.appendChild(content);
  attachBlockEvents(block);
  builder.appendChild(block);
}

// Drag & Drop
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

// Block Selection & Floating Text Toolbar
document.addEventListener('selectionchange', () => {
  const selection = window.getSelection();
  if (selection.toString().trim().length > 0 && builder.contains(selection.anchorNode)) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    richTextBar.style.top = `${rect.top - 45 + window.scrollY}px`;
    richTextBar.style.left = `${rect.left + window.scrollX}px`;
    richTextBar.classList.remove('hidden');
  } else {
    richTextBar.classList.add('hidden');
  }
});

function formatText(command) {
  document.execCommand(command, false, null);
}

function promptLink() {
  const url = prompt('Enter link URL:', 'https://');
  if (url) document.execCommand('createLink', false, url);
}

builder.addEventListener('click', e => {
  const block = e.target.closest('.block');
  if (!block || e.target.closest('.block-controls')) return;

  selectedBlock = e.target === block ? block.querySelector('*:not(.block-controls)') : e.target;
  if (!selectedBlock) return;

  settingsPanel.classList.remove('hidden');

  if (selectedBlock.tagName === 'A') {
    linkSettingsGroup.classList.remove('hidden');
    linkUrlInput.value = selectedBlock.getAttribute('href') || '';
    linkTargetInput.checked = selectedBlock.getAttribute('target') === '_blank';
  } else {
    linkSettingsGroup.classList.add('hidden');
  }

  if (selectedBlock.tagName === 'IMG') {
    imageUploadGroup.classList.remove('hidden');
  } else {
    imageUploadGroup.classList.add('hidden');
  }

  const computed = window.getComputedStyle(selectedBlock);
  textColorPicker.value = rgbToHex(computed.color || '#000000');
  bgColorPicker.value = rgbToHex(computed.backgroundColor || '#ffffff');
  fontSizePicker.value = parseInt(computed.fontSize, 10) || 16;
  fontFamilyPicker.value = computed.fontFamily.includes('serif') ? 'Lora, serif' : (computed.fontFamily.includes('monospace') ? 'Roboto Mono, monospace' : 'Inter, sans-serif');
  alignmentPicker.value = computed.textAlign || 'left';
  paddingPicker.value = parseInt(computed.padding, 10) || 0;
  borderRadiusPicker.value = parseInt(computed.borderRadius, 10) || 0;
});

function applySettings() {
  if (!selectedBlock) return;
  saveState();
  selectedBlock.style.color = textColorPicker.value;
  selectedBlock.style.backgroundColor = bgColorPicker.value;
  selectedBlock.style.fontSize = fontSizePicker.value + 'px';
  selectedBlock.style.fontFamily = fontFamilyPicker.value;
  selectedBlock.style.textAlign = alignmentPicker.value;
  selectedBlock.style.padding = paddingPicker.value + 'px';
  selectedBlock.style.borderRadius = borderRadiusPicker.value + 'px';

  if (selectedBlock.tagName === 'A') {
    selectedBlock.setAttribute('href', linkUrlInput.value);
    if (linkTargetInput.checked) {
      selectedBlock.setAttribute('target', '_blank');
    } else {
      selectedBlock.removeAttribute('target');
    }
  }
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file || !selectedBlock || selectedBlock.tagName !== 'IMG') return;

  const reader = new FileReader();
  reader.onload = function(e) {
    selectedBlock.src = e.target.result;
    saveState();
  };
  reader.readAsDataURL(file);
}

function setCanvasView(view, btn) {
  document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  builder.className = `builder-area view-${view} ${getThemeClass()}`;
  preview.className = `preview-area hidden view-${view} ${getThemeClass()}`;
}

function applyGlobalTheme(theme) {
  builder.className = builder.className.replace(/theme-\w+/g, '') + ` theme-${theme}`;
  preview.className = preview.className.replace(/theme-\w+/g, '') + ` theme-${theme}`;
}

function getThemeClass() {
  const match = builder.className.match(/theme-\w+/);
  return match ? match[0] : 'theme-indigo';
}

function filterBlocks() {
  const query = document.getElementById('blockSearch').value.toLowerCase();
  const items = document.querySelectorAll('.block-item');
  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(query) ? 'block' : 'none';
  });
}

function loadTemplate(templateName) {
  if (!confirm('Loading a template will replace your canvas blocks. Continue?')) return;
  saveState();
  builder.innerHTML = '';

  if (templateName === 'saas') {
    addBlock('hero');
    addBlock('features');
    addBlock('pricing');
    addBlock('faq');
    addBlock('footer');
  } else if (templateName === 'portfolio') {
    addBlock('heading');
    addBlock('text');
    addBlock('image');
    addBlock('testimonial');
    addBlock('form');
    addBlock('footer');
  } else if (templateName === 'blank') {
    builder.innerHTML = '<p class="placeholder">Canvas cleared. Select blocks from sidebar to build.</p>';
  }
}

function exportToJson() {
  const data = {
    html: builder.innerHTML,
    css: globalCustomCss,
    seo: seoData,
    theme: getThemeClass()
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'website-project.json';
  link.click();
}

function importJsonFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);
      if (data.html) {
        saveState();
        builder.innerHTML = data.html;
        globalCustomCss = data.css || "";
        seoData = data.seo || seoData;
        customCssInput.value = globalCustomCss;
        if (data.theme) applyGlobalTheme(data.theme.replace('theme-', ''));
        rebindEvents();
        updateSaveStatus('Project loaded');
      }
    } catch (err) {
      alert('Invalid project JSON file.');
    }
  };
  reader.readAsText(file);
}

function downloadHTMLFile() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${seoData.title}</title>
  <meta name="description" content="${seoData.description}">
  <meta property="og:title" content="${seoData.title}">
  <meta property="og:description" content="${seoData.description}">
  <meta property="og:image" content="${seoData.image}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,600;1,400&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; padding: 20px; max-width: 1200px; margin: 0 auto; color: #1f2937; line-height: 1.6; }
    .badge-pill { display: inline-block; padding: 4px 12px; background: #e0e7ff; color: #4338ca; border-radius: 999px; font-size: 0.8rem; font-weight: 600; margin-bottom: 12px; }
    .hero-section { text-align: center; padding: 60px 20px; }
    .hero-section h1 { font-size: 2.8rem; font-weight: 700; margin-bottom: 16px; }
    .hero-section p { font-size: 1.2rem; color: #4b5563; max-width: 600px; margin: 0 auto 24px auto; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0; }
    .feature-card { padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; }
    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 40px 0; }
    .pricing-card { padding: 30px; border: 1px solid #e5e7eb; border-radius: 12px; text-align: center; }
    .pricing-card.featured { border: 2px solid #4f46e5; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.15); }
    .pricing-card .price { font-size: 2.5rem; font-weight: 700; margin: 16px 0; }
    .testimonial-card { padding: 24px; background: #f9fafb; border-left: 4px solid #4f46e5; border-radius: 6px; margin: 20px 0; }
    .two-column-grid { display: flex; gap: 20px; margin: 20px 0; }
    .two-column-grid .col { flex: 1; padding: 15px; border: 1px dashed #e5e7eb; border-radius: 6px; }
    .custom-action-btn { padding: 12px 24px; background: #4f46e5; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: 600; }
    .sample-form { display: flex; flex-direction: column; gap: 12px; max-width: 450px; margin: 20px 0; }
    .sample-form input, .sample-form textarea { padding: 12px; border: 1px solid #ccc; border-radius: 6px; font-family: inherit; }
    .sample-form button { padding: 12px; background: #10b981; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .site-footer { text-align: center; padding: 30px 0; border-top: 1px solid #e5e7eb; margin-top: 40px; color: #6b7280; }
    ${globalCustomCss}
  </style>
</head>
<body>
${getCleanHTML()}
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'index.html';
  link.click();
  URL.revokeObjectURL(link.href);
}

function getCleanHTML() {
  const clone = builder.cloneNode(true);
  clone.querySelectorAll('.block-controls, .placeholder').forEach(el => el.remove());
  clone.querySelectorAll('.block').forEach(block => {
    block.removeAttribute('draggable');
    block.removeAttribute('id');
    block.classList.remove('block', 'dragging');
  });
  clone.querySelectorAll('[contenteditable]').forEach(el => el.removeAttribute('contenteditable'));
  return clone.innerHTML.trim();
}

function rgbToHex(rgb) {
  const result = rgb.match(/\d+/g);
  if (!result) return '#000000';
  return '#' + result.slice(0, 3).map(x => parseInt(x, 10).toString(16).padStart(2, '0')).join('');
}

function toggleLayout() {
  document.body.classList.toggle('collapsed');
}

function closeSettingsPanel() {
  settingsPanel.classList.add('hidden');
}

function saveCustomCss() {
  globalCustomCss = customCssInput.value;
  closeModal('cssModal');
}

function saveSeoData() {
  seoData.title = document.getElementById('seoTitle').value || seoData.title;
  seoData.description = document.getElementById('seoDescription').value || seoData.description;
  seoData.image = document.getElementById('seoImage').value || seoData.image;
  closeModal('seoModal');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.add('hidden');
}

// Event Listeners
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

document.getElementById('clearBtn').addEventListener('click', () => {
  if (confirm('Clear all blocks from canvas?')) {
    saveState();
    builder.innerHTML = '<p class="placeholder">Select a block from the sidebar or choose a template from the toolbar to start.</p>';
  }
});

document.getElementById('exportBtn').addEventListener('click', () => {
  exportCode.value = getCleanHTML();
  exportModal.classList.remove('hidden');
});

document.getElementById('customCssBtn').addEventListener('click', () => {
  cssModal.classList.remove('hidden');
});

document.getElementById('seoModalBtn').addEventListener('click', () => {
  document.getElementById('seoTitle').value = seoData.title;
  document.getElementById('seoDescription').value = seoData.description;
  document.getElementById('seoImage').value = seoData.image;
  seoModal.classList.remove('hidden');
});

document.getElementById('exportJsonBtn').addEventListener('click', exportToJson);
document.getElementById('importJsonBtn').addEventListener('click', () => {
  document.getElementById('jsonFileInput').click();
});

document.getElementById('downloadBtn').addEventListener('click', downloadHTMLFile);

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
