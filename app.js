// Load user settings
fetch('settings.json')
  .then(res => res.json())
  .then(settings => {
    if (settings.theme === 'dark') {
      document.body.classList.add('dark-mode');
    }
    document.documentElement.style.setProperty('--default-font-size', settings.defaultFontSize || '16px');
  })
  .catch(err => console.error('Settings load failed:', err));

// Toggle Dark Mode
document.getElementById('darkModeToggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
});

// Add Blocks
function addBlock(type) {
  const builder = document.getElementById('builder');
  const block = document.createElement('div');
  block.className = 'block';

  switch (type) {
    case 'text':
      block.innerHTML = '<p>Editable text block</p>';
      break;
    case 'image':
      block.innerHTML = '<img src="https://via.placeholder.com/150" alt="Placeholder Image">';
      break;
    case 'button':
      block.innerHTML = '<button>Click Me</button>';
      break;
    case 'heading':
      block.innerHTML = '<h2>Heading Block</h2>';
      break;
    case 'link':
      block.innerHTML = '<a href="#">Link Block</a>';
      break;
    case 'divider':
      block.innerHTML = '<hr>';
      break;
  }

  builder.appendChild(block);
}

// Layout Toggle
function toggleLayout() {
  document.querySelector('.sidebar').classList.toggle('collapsed');
  document.querySelector('.builder-container').classList.toggle('expanded');
}

// Preview
document.getElementById('previewBtn').addEventListener('click', () => {
  const builder = document.getElementById('builder');
  const preview = document.getElementById('preview');

  preview.innerHTML = builder.innerHTML;
  preview.classList.toggle('hidden');
  builder.classList.toggle('hidden');
});

// Save
document.getElementById('saveBtn').addEventListener('click', () => {
  const content = document.getElementById('builder').innerHTML;
  localStorage.setItem('builderContent', content);
  alert('Content saved locally!');
});

// Export
document.getElementById('exportBtn').addEventListener('click', () => {
  const exportCode = document.getElementById('exportCode');
  exportCode.value = document.getElementById('builder').innerHTML;
  document.getElementById('exportModal').classList.remove('hidden');
});

// Close modal
function closeModal() {
  document.getElementById('exportModal').classList.add('hidden');
}

// Restore saved content on load
window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('builderContent');
  if (saved) {
    document.getElementById('builder').innerHTML = saved;
  }
});

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('service.worker.js')
    .then(reg => console.log("Service Worker registered:", reg.scope))
    .catch(err => console.error("SW registration failed:", err));
}