"use client";

import { useState } from "react";
import axios from "axios";

export default function ChatWithPdf({ persist_dir }: { persist_dir: string }) {
  const [messages, setMessages] = useState<{ role: string, text: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
    if (!input.trim()) return;

    setMessages(prev => [...prev, { role: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + "/askquestion", {
        question: input,
        store: persist_dir
      });

      setMessages(prev => [...prev, { role: "bot", text: res.data.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: "bot", text: "⚠️ Something went wrong." }]);
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full text-white bg-gray-900 font2">
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scroll">

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm leading-relaxed
              ${msg.role === "user" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-200"}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-2 rounded-2xl bg-gray-700 text-gray-300 flex items-center gap-1">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse animation-delay-200">●</span>
              <span className="animate-pulse animation-delay-400">●</span>
            </div>
          </div>
        )}

      </div>

      <div className="p-3 border-t border-gray-700 flex gap-2 bg-gray-900">
        <input
          className="flex-1 bg-gray-800 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 transition"
          placeholder="Ask something from the PDF..."
          value={input}
          onChange={e => setInput(e.target.value)}
        />
        <button
          onClick={askQuestion}
          className="bg-green-600 hover:bg-green-700 px-5 py-3 rounded-xl font-semibold transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}
