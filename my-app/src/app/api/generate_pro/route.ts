import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const client = new Groq({ apiKey: process.env.Next_GROP_API_KEY! });

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
    if (
      !json.project_name ||
      !json.frontend ||
      !json.frontend["index.html"] ||
      !json.frontend["style.css"]
    ) {
      return NextResponse.json({ error: "Invalid response. Try again." });
    }
    saveProject(json.project_name, { ...json.frontend, ...json.backend });

    return NextResponse.json(json);


  } catch (err: any) {
    console.log(err);
  }
}


import fs from "fs";
import path from "path";

export async function saveProject(projectName: any, files: any) {
  const safeName = projectName.replace(/\s+/g, "-").toLowerCase();
  const dir = path.join(process.cwd(), "public/generated_projects", safeName);
  fs.mkdirSync(dir, { recursive: true });

  for (const file in files) {
    fs.writeFileSync(path.join(dir, file), files[file]);
  }

  return safeName;
}