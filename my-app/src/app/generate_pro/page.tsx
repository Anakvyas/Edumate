"use client";

import axios from "axios";
import { BrainCog, ChevronRight, FolderDown, Play, Rocket, Type, AlertCircle, Loader2 } from "lucide-react";
import React, { useMemo, useState } from "react";

import Back from "../components/Back";
import Loader from "../components/loader";

type FrontendFiles = {
  "index.html": string;
  "style.css": string;
  "script.js": string;
};

type BackendFiles = {
  "app.py": string;
  "model.py": string;
  "requirements.txt": string;
  "readme.md": string;
};

type ProjectFiles = {
  project_name: string;
  description: string;
  frontend: FrontendFiles;
  backend?: Partial<BackendFiles>;
};

const emptyProject: ProjectFiles = {
  project_name: "",
  description: "",
  frontend: {
    "index.html": "",
    "style.css": "",
    "script.js": "",
  },
  backend: {
    "app.py": "",
    "model.py": "",
    "requirements.txt": "",
    "readme.md": "",
  },
};

function normalizeProject(payload: any, fallbackDescription = ""): ProjectFiles {
  const frontend = payload?.frontend ?? {};
  const backend = payload?.backend ?? {};

  return {
    project_name: typeof payload?.project_name === "string" ? payload.project_name : "",
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

const Page = () => {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<ProjectFiles>(emptyProject);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const hasProject = useMemo(() => {
    return Boolean(
      files.project_name.trim() &&
        files.description.trim() &&
        files.frontend &&
        files.frontend["index.html"].trim()
    );
  }, [files]);

  const handleGenerateProject = async () => {
    if (!description.trim()) {
      setError("Describe the project first.");
      return;
    }

    try {
      setGenerating(true);
      setError("");
      const res = await axios.post("/api/generate_pro", { description });
      const normalized = normalizeProject(res.data, description);

      if (!normalized.frontend["index.html"].trim()) {
        throw new Error("Project generator did not return frontend files.");
      }

      setFiles(normalized);
    } catch (err: any) {
      setFiles(emptyProject);
      setError(err?.response?.data?.error || err?.response?.data?.message || err.message || "Project generation failed.");
    } finally {
      setGenerating(false);
    }
  };

  if (hasProject) {
    return <Project file={files} />;
  }

  return (
    <div className="relative">
      <Back />
      <div className="flex flex-col w-full gap-2 font2 text-white">
        <div className="p-3 flex flex-col justify-center items-center relative w-full z-10 m-auto">
          <h1 className="text-[2.3rem] font-bold m-auto heading font1">Generate Project</h1>
        </div>
        <div className="flex flex-col gap-4 justify-center items-center mx-auto font5">
          <div className="w-[50vw] min-h-[25vh] bg-[linear-gradient(150deg,#00ffc0,#00000000,#A78BFA)] p-[0.9px] rounded-xl mt-6">
            <div className="flex flex-col gap-5 bg-gray-900 w-full h-auto rounded-xl p-4">
              <div className="flex flex-col gap-2">
                <span className="text-gray-300 italic">
                  <span className="flex flex-row items-center gap-3">
                    <Type />
                    Describe About Project
                  </span>
                </span>
                <textarea
                  className="bg-gray-600 w-full h-[15vh] text-start text-white text-sm outline-none p-4 resize-none font2"
                  placeholder="Generate a login page with authentication and dashboard"
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setError("");
                  }}
                />
              </div>

              {error ? (
                <div className="flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button
                onClick={handleGenerateProject}
                disabled={generating}
                className="bg-gradient-to-r from-green-400 to-green-700 w-full rounded-xl h-[5vh] hover:bg-gradient-to-r hover:from-green-500 hover:to-green-800 cursor-pointer p-1 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <span className="flex flex-row items-center gap-4 justify-center">
                  {generating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket />}
                  {generating ? "Generating Project..." : "Generate Project"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;

const Project = ({ file }: { file: ProjectFiles }) => {
  const [selectedFile, setSelectedFile] = useState<{ name: string; content: string } | null>(null);
  const [showRun, setShowRun] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRun = async () => {
    setShowRun(true);
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setLoading(false);
  };

  return (
    <div className="relative">
      <Back />

      <div className="flex flex-col w-full h-screen">
        <div className="flex flex-row gap-2 font5 w-full p-2">
          <div className="flex flex-col flex-1">
            <h1 className="text-2xl font-bold text-[#00ffc0] flex flex-row gap-4">
              <span className="flex flex-row items-center gap-3">
                <BrainCog />
                Project Name:
              </span>
              <span className="text-gray-300 text-xl">{file.project_name}</span>
            </h1>
            <h2 className="text-md font-semibold mt-1 font2 text-[#00ffc0]">
              Description:
              <span className="text-gray-500 ml-4">{file.description}</span>
            </h2>
          </div>
          <button
            onClick={handleRun}
            className="m-2 bg-purple-400 p-1 w-[10%] duration-400 h-auto transition-all hover:bg-purple-500 cursor-pointer rounded-xl"
          >
            <span className="flex flex-row justify-center items-center gap-2">
              <Play />
              RUN
            </span>
          </button>
          <button className="m-2 bg-purple-400 p-1 w-[13%] h-auto transition-all duration-400 hover:bg-purple-500 cursor-pointer rounded-xl shadow-xl">
            <span className="flex flex-row justify-center items-center gap-2">
              <FolderDown />
              Download Zip
            </span>
          </button>
        </div>

        <div className="w-full flex flex-row flex-1">
          <div className="flex flex-1 rounded-lg overflow-hidden">
            <div className="w-[12rem] bg-gray-900 text-gray-100 overflow-auto border-r border-gray-700">
              <FileTree node={buildFileTree(file)} onSelect={setSelectedFile} />
            </div>

            <div className="flex-1 bg-[#1e1e1e] text-gray-200 p-4 overflow-auto">
              {selectedFile ? (
                <div>
                  <div className="text-sm text-gray-400 mb-2">{selectedFile.name}</div>
                  <pre className="whitespace-pre-wrap text-sm leading-sm text-font">
                    {selectedFile.content}
                  </pre>
                </div>
              ) : (
                <div className="text-gray-500 w-full flex justify-center items-center h-full">
                  Select a file to preview...
                </div>
              )}
            </div>

            {showRun && (
              <div className="w-1/2 bg-white border-l border-gray-700">
                {loading ? (
                  <Loader message="Project is running..." />
                ) : (
                  <iframe srcDoc={file.frontend["index.html"]} className="w-full h-full" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function buildFileTree(proj: ProjectFiles) {
  return {
    name: proj.project_name || "project",
    children: [
      {
        name: "frontend",
        children: Object.entries(proj.frontend || {}).map(([n, c]) => ({
          name: n,
          content: c,
        })),
      },
      proj.backend && {
        name: "backend",
        children: Object.entries(proj.backend).map(([n, c]) => ({
          name: n,
          content: typeof c === "string" ? c : "",
        })),
      },
    ].filter(Boolean),
  };
}

function FileTree({ node, onSelect }: any) {
  const [open, setOpen] = useState(false);
  const isFolder = !!node.children;

  return (
    <div className="select-none">
      <div
        onClick={() => isFolder && setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-gray-800"
      >
        {isFolder ? (
          <ChevronRight className={`transition-transform ${open ? "rotate-90" : ""}`} size={16} />
        ) : (
          <span className="w-4"></span>
        )}
        <span onClick={() => !isFolder && onSelect(node)}>{node.name}</span>
      </div>

      {isFolder && open && (
        <div className="ml-4 border-l border-gray-700 pl-2">
          {node.children.map((child: any, i: number) => (
            <FileTree key={i} node={child} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
