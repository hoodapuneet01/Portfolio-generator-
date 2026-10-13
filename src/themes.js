export const esc = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const safeUrl = (u) => (/^https?:\/\//i.test(u) || /^mailto:/i.test(u) ? esc(u) : "#");

const photoTag = (d) =>
  d.photo && d.photo.startsWith("data:image/")
    ? `<img class="photo" src="${d.photo}" alt="Profile photo">`
    : "";

/* ---------- Resume (A4) layout ---------- */
const buildResume = (d) => {
  const s = d.socials;
  const row = (k, v) => (v ? `<div class="r"><b>${k}:</b> ${v}</div>` : "");
  const link = (u) => `<a href="${safeUrl(u)}">${esc(u)}</a>`;
  const sec = (title, body) => (body ? `<section><h3>${title}</h3>${body}</section>` : "");

  const edu = (d.education || [])
    .filter((e) => e.institution || e.degree)
    .map(
      (e) =>
        `<tr><td><b>${esc(e.degree)}</b><br>${esc(e.institution)}</td><td class="yr">${esc(e.year)}</td></tr>`
    )
    .join("");

  const projects = d.projects
    .filter((p) => p.title)
    .map(
      (p) =>
        `<div class="item"><b>${esc(p.title)}</b>${p.link ? " - " + link(p.link) : ""}<p>${esc(p.description)}</p></div>`
    )
    .join("");

  const skills = d.skills.length
    ? `<ul class="cols">${d.skills.map((k) => `<li>${esc(k)}</li>`).join("")}</ul>`
    : "";

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.name) || "Resume"}</title>
<link rel="stylesheet" href="style.css"></head>
<body><main>
<h1>${esc(d.name) || "Your Name"}</h1>
<div class="top"><div class="info">
${row("Address", esc(d.address))}
${row("Telephone", esc(d.phone))}
${row("E-mail", s.email ? `<a href="mailto:${esc(s.email)}">${esc(s.email)}</a>` : "")}
${row("Date of Birth", esc(d.dob))}
${row("Languages", esc(d.languages))}
${row("GitHub", s.github ? link(s.github) : "")}
${row("LinkedIn", s.linkedin ? link(s.linkedin) : "")}
</div>${photoTag(d)}</div>
${sec("Career Objective", d.bio ? `<p>${esc(d.bio)}</p>` : "")}
${sec("Education", edu ? `<table>${edu}</table>` : "")}
${sec("Skills", skills)}
${sec("Projects", projects)}
</main></body></html>`;
};

const resumeCss = `*{box-sizing:border-box}
body{margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11pt;line-height:1.45;color:#000;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}
main{max-width:210mm;margin:0 auto;padding:14mm}
h1{text-align:center;font-size:17pt;text-transform:uppercase;margin:0 0 12px}
.top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:10px}
.info{flex:1}.r{margin:2px 0}
.photo{width:35mm;height:45mm;object-fit:cover;border:1px solid #000;padding:2px;flex-shrink:0}
section{border-top:2px solid #000;padding-top:8px;margin-top:10px}
h3{font-size:11.5pt;margin:0 0 6px}
p{margin:2px 0}
table{width:100%;border-collapse:collapse}
td{vertical-align:top;padding:3px 0}
.yr{text-align:right;white-space:nowrap;width:1%;padding-left:12px}
ul{margin:0;padding-left:22px}.cols{columns:2}
.item{margin-bottom:8px;break-inside:avoid}
a{color:#000}
@media(max-width:520px){.top{flex-direction:column-reverse}.cols{columns:1}}
@media print{main{padding:0}@page{size:A4;margin:14mm}}`;

/* ---------- Other themes ---------- */
const buildHtml = (d, theme) => {
  const s = d.socials;
  const links = [
    s.github && `<a href="${safeUrl(s.github)}">GitHub</a>`,
    s.linkedin && `<a href="${safeUrl(s.linkedin)}">LinkedIn</a>`,
    s.email && `<a href="mailto:${esc(s.email)}">Email</a>`,
  ].filter(Boolean).join("");

  const projects = d.projects
    .filter((p) => p.title)
    .map(
      (p) => `<article class="card"><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p>${
        p.link ? `<a href="${safeUrl(p.link)}">View project</a>` : ""
      }</article>`
    ).join("");

  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(d.name) || "Portfolio"}</title>
<link rel="stylesheet" href="style.css"></head>
<body class="${theme}"><main>
<header class="head">${photoTag(d)}<div><h1>${esc(d.name) || "Your Name"}</h1><h2>${esc(d.title)}</h2><p>${esc(d.bio)}</p><nav>${links}</nav></div></header>
${d.skills.length ? `<section><h3>Skills</h3><ul class="skills">${d.skills.map((k) => `<li>${esc(k)}</li>`).join("")}</ul></section>` : ""}
${projects ? `<section><h3>Projects</h3><div class="grid">${projects}</div></section>` : ""}
</main></body></html>`;
};

const base = `*{box-sizing:border-box}body{margin:0;line-height:1.6;-webkit-print-color-adjust:exact;print-color-adjust:exact}main{max-width:760px;margin:0 auto;padding:48px 20px}
h1{font-size:2.4rem;margin:0}h2{font-weight:400;margin:4px 0 16px}nav a{margin-right:16px}
.skills{list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:8px}.skills li{padding:4px 12px}
.grid{display:grid;gap:16px}.card{padding:16px}.card h3{margin:0 0 6px}a{text-decoration:none}
.head{display:flex;gap:20px;align-items:flex-start}.photo{width:35mm;height:45mm;object-fit:cover;border-radius:4px;flex-shrink:0}
@media(max-width:520px){.head{flex-direction:column}}
@media print{main{padding:0}.card,.skills li{break-inside:avoid}@page{margin:15mm}}`;

export const themes = {
  resume: { label: "Resume (A4)", html: buildResume, css: resumeCss },
  minimal: {
    label: "Minimal",
    html: (d) => buildHtml(d, "minimal"),
    css: base + `body{font-family:Georgia,serif;background:#fff;color:#222}a{color:#1a56db}
.skills li{border:1px solid #ccc;border-radius:4px}.card{border-bottom:1px solid #ddd}`,
  },
  dark: {
    label: "Dark",
    html: (d) => buildHtml(d, "dark"),
    css: base + `body{font-family:system-ui,sans-serif;background:#12141a;color:#e6e8ee}a{color:#7cc4ff}
h2{color:#9aa3b5}.skills li{background:#232733;border-radius:999px}.card{background:#1b1e27;border-radius:10px}`,
  },
  colorful: {
    label: "Colorful",
    html: (d) => buildHtml(d, "colorful"),
    css: base + `body{font-family:"Trebuchet MS",sans-serif;background:#fff6e5;color:#2b2140}a{color:#d6336c;font-weight:700}
h1{color:#5f3dc4}.skills li{background:#ffd43b;border-radius:8px;font-weight:700}
.card{background:#fff;border:3px solid #5f3dc4;border-radius:12px;box-shadow:4px 4px 0 #5f3dc4}`,
  },
};
