import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.Next_GROP_API_KEY! });

function normalizeProject(payload: any, fallbackDescription: string) {
  const frontend = payload?.frontend ?? {};
  const backend = payload?.backend ?? {};

  return {
    project_name:
      typeof payload?.project_name === "string" && payload.project_name.trim()
        ? payload.project_name
        : "generated-project",
    description:
      typeof payload?.description === "string" && payload.description.trim()
        ? payload.description
        : fallbackDescription,
    frontend: {
      "index.html": typeof frontend?.["index.html"] === "string" ? frontend["index.html"] : "",
      "style.css": typeof frontend?.["style.css"] === "string" ? frontend["style.css"] : "",
      "script.js": typeof frontend?.["script.js"] === "string" ? frontend["script.js"] : "",
    },
    backend: {
      "app.py": typeof backend?.["app.py"] === "string" ? backend["app.py"] : "",
      "model.py": typeof backend?.["model.py"] === "string" ? backend["model.py"] : "",
      "requirements.txt": typeof backend?.["requirements.txt"] === "string" ? backend["requirements.txt"] : "",
      "readme.md": typeof backend?.["readme.md"] === "string" ? backend["readme.md"] : "",
    },
  };
}

export async function POST(req: NextRequest) {
  try {
    const { description } = await req.json();
    // console.log(description)
    if(description == ""){
      return NextResponse.json({ error: "Description is required." });
    }

    const prompt = `You are an AI Project Generator.

Your job is to generate a runnable project based on the user's description.

Before generating, determine what type of project the user wants:

## 1) If the user asks for a UI page, component, screen, login page, signup page, homepage, landing page, or simple frontend:
RETURN THIS JSON ONLY:

{
  "project_name": "",
  "description": "",
  "frontend": {
    "index.html": "",
    "style.css": "",
    "script.js": ""
  }
}

## 2) If the user requests a full project, app, system, tool, analyzer, API, chatbot, or anything requiring logic or data:
RETURN THIS JSON STRUCTURE:

{
  "project_name": "",
  "description": "",
  "frontend": {
    "index.html": "",
    "style.css": "",
    "script.js": ""
  },
  "backend": {
    "app.py": "",
    "model.py": "",
    "requirements.txt": "",
    "readme.md": ""
  }
}

### UI / Frontend Quality Rules
- Use modern, clean, visually appealing UI design.
- Apply consistent color theme based on user request.
- Use spacing, layout, alignment, and readable fonts.
- Buttons must have hover transitions.
- Optional enhancement: soft shadows, rounded corners, hero section image.
- make ui good polish and modern.

### Important Rules
- Always return valid JSON (no markdown, no text before/after).
- All code must be returned as plain text with normal line breaks (NO literal "\\n\\n" insertions).
- Do not leave fields empty or null. Always give full working code.
- If project is UI-only → DO NOT include backend.
- Style must be modern and visually appealing.
- Online image links allowed (Unsplash / Pexels).
- If ML is needed, generate small dummy training data inside model.py.
- genrate index.html and style.css with proper structure and styling use good ui designs so user have good experience with ui.
### USER REQUEST:
{{description_here}}
`

    const newprompt = prompt.replace("{{description_here}}", description);
    const chat = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: newprompt }],
    });

    const content = chat.choices?.[0]?.message?.content ?? "{}";
    const json = JSON.parse(content);
    const normalized = normalizeProject(json, description);

    if (!normalized.frontend["index.html"]) {
      normalized.frontend["index.html"] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${normalized.project_name}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="shell">
    <section class="card">
      <p class="eyebrow">Generated Project</p>
      <h1>${normalized.project_name}</h1>
      <p>${normalized.description}</p>
      <button id="action-button">Get Started</button>
    </section>
  </main>
  <script src="script.js"></script>
</body>
</html>`;
    }

    if (!normalized.frontend["style.css"]) {
      normalized.frontend["style.css"] = `:root {
  --bg: #0b1020;
  --panel: #121a30;
  --accent: #64ffb0;
  --text: #f5f7ff;
  --muted: #b7bfdc;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: grid;
  place-items: center;
  font-family: Arial, sans-serif;
  background: radial-gradient(circle at top, #17213f, var(--bg));
  color: var(--text);
}

.shell { padding: 24px; width: min(100%, 960px); }
.card {
  padding: 32px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
  border: 1px solid rgba(100,255,176,0.2);
  box-shadow: 0 24px 80px rgba(0,0,0,0.35);
}
.eyebrow {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.18em;
  font-size: 12px;
}
h1 { margin: 12px 0; font-size: clamp(2rem, 4vw, 3.5rem); }
p { color: var(--muted); line-height: 1.6; }
button {
  margin-top: 16px;
  border: 0;
  border-radius: 999px;
  padding: 14px 22px;
  background: linear-gradient(135deg, #64ffb0, #36cfff);
  color: #04111d;
  font-weight: 700;
  cursor: pointer;
}`;
    }

    if (!normalized.frontend["script.js"]) {
      normalized.frontend["script.js"] = `const button = document.getElementById("action-button");
if (button) {
  button.addEventListener("click", () => {
    button.textContent = "Ready";
  });
}`;
    }

    return NextResponse.json(normalized);


  } catch (err: any) {
    console.log(err);
     return NextResponse.json(
      { error: err.message || "Server error occurred." },
      { status: 500 }
    );
  }
}


// import fs from "fs";
// import path from "path";

// export async function saveProject(projectName: any, files: any) {
//   const safeName = projectName.replace(/\s+/g, "-").toLowerCase();
//   const dir = path.join(process.cwd(), "public/generated_projects", safeName);
//   fs.mkdirSync(dir, { recursive: true });

//   for (const file in files) {
//     fs.writeFileSync(path.join(dir, file), files[file]);
//   }

//   return safeName;
// }
