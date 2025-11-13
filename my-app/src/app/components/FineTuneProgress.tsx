
import { useEffect, useRef, useState } from "react";

type ProgressMsg = {
  percent?: number;
  phase?: number;
  epoch?: number;
  loss?: number | string;
};

export default function FineTuneProgress({ jobId }: { jobId: string }) {
  const [percent, setPercent] = useState(0);
  const [phase, setPhase] = useState(1);
  const [epoch, setEpoch] = useState(1);
  const [loss, setLoss] = useState<number | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [modelURL, setModelURL] = useState("");
  const [error, setError] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/events/${jobId}`;
    const es = new EventSource(url);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        if (msg.type === "progress") {
          // Only update loss/percent on explicit progress messages
          setPercent(msg.percent ?? 0);
          setPhase(msg.phase ?? phase);
          setEpoch(msg.epoch ?? epoch);
          setLoss(typeof msg.loss === "number" ? msg.loss : parseFloat(msg.loss ?? "0"));
        }

        if (msg.type === "status") {
          const now = new Date().toLocaleTimeString();
          setLogs((prev) => [`[${now}] ${msg.message}`, ...prev].slice(0, 200)); // keep last 200
        }

        if (msg.type === "error") {
          // Show error banner and also append to logs
          setError(msg.error || "Unknown error");
          const now = new Date().toLocaleTimeString();
          setLogs((prev) => [`[${now}] ERROR: ${msg.error}`, ...prev].slice(0, 200));
          // keep connection open to receive final finished if backend sends one
        }

        if (msg.type === "done") {
          setDone(true);
          setModelURL(msg.model_dir);
          const now = new Date().toLocaleTimeString();
          setLogs((prev) => [`[${now}] Training complete. Model: ${msg.model_dir}`, ...prev].slice(0, 200));
          es.close();
        }

        if (msg.type === "finished") {
          // backend finished (maybe with error), close connection
          es.close();
        }
      } catch (err) {
        // ignore parse errors
      }
    };

    es.onerror = () => {
      // network fallback: show message but don't spam
      setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Connection error to SSE`, ...prev].slice(0, 200));
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [jobId]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-gray-900 text-white rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold mb-4 text-center">Fine-Tuning Progress</h2>

      <div className="flex items-center gap-4">
        <div className="w-full">
          <div className="w-full bg-gray-700 h-4 rounded overflow-hidden">
            <div
              className="h-4 rounded transition-all"
              style={{ width: `${percent}%`, background: percent > 80 ? "linear-gradient(90deg,#16a34a,#a3e635)" : undefined }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-300">
            Phase: <b>{phase}</b> • Epoch: <b>{epoch}</b> • Progress: <b>{percent}%</b>
          </p>
        </div>

        <div className="w-40 text-right">
          <p className="text-sm text-gray-300">Loss (live)</p>
          <p className="text-lg font-mono">{loss !== null ? loss : "---"}</p>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-700 p-2 rounded">
          <b>Error:</b> {error}
        </div>
      )}

      <div className="mt-4 h-48 overflow-y-auto bg-black p-3 text-sm border border-gray-600 rounded">
        {logs.length === 0 ? (
          <p className="text-gray-500">Waiting for logs...</p>
        ) : (
          logs.map((l, i) => <p key={i} className="whitespace-pre-wrap">{l}</p>)
        )}
      </div>

      <div className="mt-4 flex gap-2">
        {done ? (
          <div className="flex-1 bg-green-700 text-center p-2 rounded font-bold">
            Training Complete!{" "}
            <a href={modelURL} target="_blank" rel="noreferrer" className="underline text-green-200">
              Open model
            </a>
          </div>
        ) : (
          <div className="flex-1 bg-yellow-800 text-center p-2 rounded">
            Training in progress...
          </div>
        )}

        <button
          onClick={() => {
            // copy model URL if ready
            if (modelURL) {
              navigator.clipboard.writeText(modelURL);
              setLogs((prev) => [`[${new Date().toLocaleTimeString()}] Copied model URL to clipboard`, ...prev].slice(0, 200));
            }
          }}
          className="px-3 py-2 bg-gray-800 rounded"
        >
          Copy Model URL
        </button>
      </div>
    </div>
  );
}
