function applyGlobalTheme(theme) {
  const themeClasses = ['theme-indigo', 'theme-emerald', 'theme-sunset', 'theme-dark'];
  
  // Clean existing themes from canvas and preview
  themeClasses.forEach(t => {
    builder.classList.remove(t);
    preview.classList.remove(t);
  });

  // Apply selected theme
  builder.classList.add(`theme-${theme}`);
  preview.classList.add(`theme-${theme}`);
  
  saveState();
}

function getThemeClass() {
  const themeClasses = ['theme-indigo', 'theme-emerald', 'theme-sunset', 'theme-dark'];
  for (const t of themeClasses) {
    if (builder.classList.contains(t)) return t;
  }
  return 'theme-indigo';
}

function downloadHTMLFile() {
  const currentTheme = getThemeClass();

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

    /* Theme Variable Definitions */
    body.theme-indigo {
      --primary: #4f46e5;
      --accent-bg: #e0e7ff;
      --accent-text: #3730a3;
      --bg-color: #ffffff;
      --text-color: #1f2937;
      --card-bg: #f9fafb;
      --border-color: #e5e7eb;
    }
    body.theme-emerald {
      --primary: #059669;
      --accent-bg: #d1fae5;
      --accent-text: #065f46;
      --bg-color: #ffffff;
      --text-color: #064e3b;
      --card-bg: #f0fdf4;
      --border-color: #a7f3d0;
    }
    body.theme-sunset {
      --primary: #ea580c;
      --accent-bg: #ffedd5;
      --accent-text: #9a3412;
      --bg-color: #fffaf5;
      --text-color: #431407;
      --card-bg: #fff7ed;
      --border-color: #fed7aa;
    }
    body.theme-dark {
      --primary: #38bdf8;
      --accent-bg: #1e293b;
      --accent-text: #38bdf8;
      --bg-color: #0f172a;
      --text-color: #f8fafc;
      --card-bg: #1e293b;
      --border-color: #334155;
    }

    body {
      font-family: 'Inter', sans-serif;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      background-color: var(--bg-color);
      color: var(--text-color);
      line-height: 1.6;
    }

    .badge-pill {
      display: inline-block;
      padding: 4px 12px;
      background: var(--accent-bg);
      color: var(--accent-text);
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .hero-section { text-align: center; padding: 60px 20px; }
    .hero-section h1 { font-size: 2.8rem; font-weight: 700; margin-bottom: 16px; }
    .hero-section p { font-size: 1.2rem; opacity: 0.8; max-width: 600px; margin: 0 auto 24px auto; }

    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 40px 0; }
    .feature-card { padding: 20px; border: 1px solid var(--border-color); border-radius: 8px; background: var(--card-bg); }

    .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 40px 0; }
    .pricing-card { padding: 30px; border: 1px solid var(--border-color); border-radius: 12px; background: var(--card-bg); text-align: center; }
    .pricing-card.featured { border: 2px solid var(--primary); }
    .pricing-card .price { font-size: 2.5rem; font-weight: 700; margin: 16px 0; }

    .testimonial-card { padding: 24px; background: var(--card-bg); border-left: 4px solid var(--primary); border-radius: 6px; margin: 20px 0; }
    .two-column-grid { display: flex; gap: 20px; margin: 20px 0; }
    .two-column-grid .col { flex: 1; padding: 15px; border: 1px dashed var(--border-color); border-radius: 6px; }

    .custom-action-btn { padding: 12px 24px; background: var(--primary); color: #ffffff; border: none; border-radius: 6px; cursor: pointer; font-size: 1rem; font-weight: 600; }
    .sample-form { display: flex; flex-direction: column; gap: 12px; max-width: 450px; margin: 20px 0; }
    .sample-form input, .sample-form textarea { padding: 12px; border: 1px solid var(--border-color); background: var(--card-bg); color: var(--text-color); border-radius: 6px; font-family: inherit; }
    .sample-form button { padding: 12px; background: var(--primary); color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .site-footer { text-align: center; padding: 30px 0; border-top: 1px solid var(--border-color); margin-top: 40px; opacity: 0.7; }
    ${globalCustomCss}
  </style>
</head>
<body class="${currentTheme}">
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
