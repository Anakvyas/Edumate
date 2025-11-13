"use client"
import ReactFlow, { MiniMap, Controls, Background } from "reactflow";
import "reactflow/dist/style.css";

export default function ConceptMapGraph({ data }: { data: any }) {
  if (!data) return <div className="text-gray-400 p-4">Generating concept map...</div>;

  const nodes = data.nodes.map((n: any, i: number) => ({
    id: n.id,
    position: { x: (i % 5) * 200, y: Math.floor(i / 5) * 150 }, // nice grid layout
    data: { label: n.label }
  }));

  const edges = data.edges.map((e: any, i: number) => ({
    id: `e${i}`,
    source: e.source,
    target: e.target,
    label: e.label,
    animated: true,
    style: { strokeWidth: 2 }
  }));

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        {/* <MiniMap /> */}
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
