import { useEffect, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { themes } from "./themes.js";

// Step 2: data model
const initialData = {
  name: "", title: "", bio: "",
  skills: [],
  projects: [{ title: "", description: "", link: "" }],
  socials: { github: "", linkedin: "", email: "" },
  theme: "minimal",
  photo: "",
};

const isUrl = (u) => !u || /^https?:\/\/\S+\.\S+/i.test(u);

// Step 9: validation
function validate(d) {
  const e = [];
  if (!d.name.trim()) e.push("Name is required.");
  if (!isUrl(d.socials.github)) e.push("GitHub must be a full URL (https://…).");
  if (!isUrl(d.socials.linkedin)) e.push("LinkedIn must be a full URL (https://…).");
  d.projects.forEach((p, i) => { if (!isUrl(p.link)) e.push(`Project ${i + 1} link must be a full URL.`); });
  return e;
}

function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      {props.rows ? <textarea {...props} /> : <input {...props} />}
    </label>
  );
}

// Step 3: form components
function PersonalForm({ data, set }) {
  return (
    <fieldset>
      <legend>About you</legend>
      <Field label="Name" value={data.name} onChange={(e) => set({ name: e.target.value })} />
      <Field label="Title" value={data.title} onChange={(e) => set({ title: e.target.value })} />
      <Field label="Bio" rows={3} value={data.bio} onChange={(e) => set({ bio: e.target.value })} />
    </fieldset>
  );
}

function SkillsForm({ data, set }) {
  const [skill, setSkill] = useState("");
  const add = () => {
    const s = skill.trim();
    if (s && !data.skills.includes(s)) set({ skills: [...data.skills, s] });
    setSkill("");
  };
  return (
    <fieldset>
      <legend>Skills</legend>
      <div className="row">
        <input value={skill} placeholder="e.g. React" onChange={(e) => setSkill(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())} />
        <button type="button" onClick={add}>Add skill</button>
      </div>
      <div className="chips">
        {data.skills.map((s) => (
          <button key={s} type="button" className="chip" aria-label={`Remove ${s}`}
            onClick={() => set({ skills: data.skills.filter((x) => x !== s) })}>{s} ×</button>
        ))}
      </div>
    </fieldset>
  );
}

function ProjectsForm({ data, set }) {
  const update = (i, patch) =>
    set({ projects: data.projects.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  return (
    <fieldset>
      <legend>Projects</legend>
      {data.projects.map((p, i) => (
        <div className="project" key={i}>
          <Field label="Title" value={p.title} onChange={(e) => update(i, { title: e.target.value })} />
          <Field label="Description" rows={2} value={p.description} onChange={(e) => update(i, { description: e.target.value })} />
          <Field label="Link" value={p.link} placeholder="https://" onChange={(e) => update(i, { link: e.target.value })} />
          <button type="button" className="ghost"
            onClick={() => set({ projects: data.projects.filter((_, idx) => idx !== i) })}>Remove project</button>
        </div>
      ))}
      <button type="button" onClick={() => set({ projects: [...data.projects, { title: "", description: "", link: "" }] })}>
        Add project
      </button>
    </fieldset>
  );
}

function SocialsForm({ data, set }) {
  const up = (k, v) => set({ socials: { ...data.socials, [k]: v } });
  return (
    <fieldset>
      <legend>Links</legend>
      <Field label="GitHub URL" value={data.socials.github} onChange={(e) => up("github", e.target.value)} />
      <Field label="LinkedIn URL" value={data.socials.linkedin} onChange={(e) => up("linkedin", e.target.value)} />
      <Field label="Email" value={data.socials.email} onChange={(e) => up("email", e.target.value)} />
    </fieldset>
  );
}

function PhotoForm({ data, set }) {
  const onFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 350; c.height = 450;
      const r = Math.max(350 / img.width, 450 / img.height);
      const w = img.width * r, h = img.height * r;
      c.getContext("2d").drawImage(img, (350 - w) / 2, (450 - h) / 2, w, h);
      set({ photo: c.toDataURL("image/jpeg", 0.85) });
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  };
  return (
    <fieldset>
      <legend>Photo</legend>
      <input type="file" accept="image/*" onChange={onFile} />
      {data.photo && <button type="button" className="ghost" onClick={() => set({ photo: "" })}>Remove photo</button>}
    </fieldset>
  );
}

export default function App() {
  // Step 8: save progress
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("portfolio");
      return saved ? { ...initialData, ...JSON.parse(saved) } : initialData;
    } catch { return initialData; }
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try { localStorage.setItem("portfolio", JSON.stringify(data)); } catch {}
  }, [data]);

  const set = (patch) => setData((d) => ({ ...d, ...patch }));
  const errors = validate(data);
  const theme = themes[data.theme];

  // Step 7: export to ZIP
  async function exportSite() {
    setBusy(true);
    try {
      const zip = new JSZip();
      zip.file("index.html", inlineHtml);
      saveAs(await zip.generateAsync({ type: "blob" }), "portfolio.zip");
    } finally { setBusy(false); }
  }

  const reset = () => {
    if (confirm("Clear everything and start over?")) {
      localStorage.removeItem("portfolio");
      setData(initialData);
    }
  };

  // Step 5: live preview (the template escapes all user input)
  const inlineHtml = theme.html(data).replace(
    '<link rel="stylesheet" href="style.css">', `<style>${theme.css}</style>`);
  const srcDoc = inlineHtml;

  function downloadPdf() {
    const html = inlineHtml.replace("</body>",
      "<script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body>");
    const w = window.open("", "_blank");
    if (!w) { alert("Allow pop-ups for this site, then try again."); return; }
    w.document.write(html);
    w.document.close();
  }

  return (
    <div className="layout">
      <aside className="editor">
        <h1>Portfolio Generator</h1>
        {/* Step 6: theme switcher */}
        <label className="field">
          <span>Theme</span>
          <select value={data.theme} onChange={(e) => set({ theme: e.target.value })}>
            {Object.entries(themes).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
          </select>
        </label>
        <PersonalForm data={data} set={set} />
        <PhotoForm data={data} set={set} />
        <SkillsForm data={data} set={set} />
        <ProjectsForm data={data} set={set} />
        <SocialsForm data={data} set={set} />
        {errors.length > 0 && <ul className="errors">{errors.map((e) => <li key={e}>{e}</li>)}</ul>}
        <div className="actions">
          <button className="primary" disabled={errors.length > 0 || busy} onClick={exportSite}>
            {busy ? "Preparing…" : "Download ZIP"}
          </button>
          <button disabled={errors.length > 0} onClick={downloadPdf}>Download PDF</button>
          <button className="ghost" onClick={reset}>Reset</button>
        </div>
      </aside>
      <iframe className="preview" title="Portfolio preview" srcDoc={srcDoc} sandbox="" />
    </div>
  );
}
