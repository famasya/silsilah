"use client"

import { FamilyNode } from "@/types";
import { OrgChart } from "d3-org-chart";
import { PlusIcon } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import useLocalStorage from "use-local-storage";
import Menu from "./dropdown-menu";
import Editor from "./editor";
import FamilyTree from "./family-tree";
import { Button } from "./ui/button";

type Props = {
  nodes: FamilyNode[],
  title: string,
  id: string,
  updatedAt: Date | null,
}

const EmptyState = () => {
  return <div className="w-full h-full flex justify-center items-center">
    <span className="text-center text-base text-gray-500">Klik tombol <strong>+</strong> di kiri atas untuk mulai menambahkan data</span>
  </div>
}

export default function Renderer({ nodes, title, id, updatedAt }: Props) {
  const [data, setData] = useState<FamilyNode[]>(nodes);
  const [editingNode, setEditingNode] = useState<FamilyNode | null>(null)
  const [openEditor, setOpenEditor] = useState(false)
  const [nodesView, setNodesView] = useState<"expand" | "collapse" | "default">("default")
  const [lastSync, setLastSync] = useState<Date>(updatedAt ?? new Date())
  const [localStorage, setLocalStorage] = useLocalStorage<FamilyNode[]>("nodes", []);
  const [family, setFamily] = useState<{ id: string; title: string }>({
    id: id,
    title: title
  });
  const chart = useRef(new OrgChart<FamilyNode>());
  const loadLocal = useSearchParams().get("local") === "true";

  const openLocalVersion = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("local", "true")
    window.open(url.toString(), "_blank");
  }

  useEffect(() => {
    if (loadLocal) {
      setData(localStorage)
    }
  }, [loadLocal, localStorage])

  useEffect(() => {
    if (!openEditor) {
      setEditingNode(null)
    }
  }, [openEditor])

  return <div id="wrapper" className="h-screen" >
    <div className="absolute w-full text-center p-2 backdrop-blur-sm bg-white/30">
      <div className="flex justify-center">
        <span className="flex-none">
          <Button size={"icon"} onClick={() => setOpenEditor(true)} className="shadow"><PlusIcon size={16} /></Button>
          <Editor setNodes={setData} nodes={data} editingNode={editingNode} openEditor={openEditor} setOpenEditor={setOpenEditor} />
        </span>
        <span className="flex-1 flex flex-col justify-center items-center">
          <h1 className="lg:text-3xl md:text-xl font-semibold rounded">{family.title !== "" ? family.title : "Silsilah Keluarga"}</h1>
          <span className="text-xs mt-2 bg-gray-100 p-1 rounded font-bold text-gray-500">Sinkronisasi: {family.id ? lastSync.toLocaleString() : "Belum disimpan"}</span>
        </span>
        <span className="flex-none">
          <Menu
            loadLocalStorage={openLocalVersion}
            chart={chart.current}
            toggleNodesView={() => setNodesView(nodesView === "expand" || nodesView === "default" ? "collapse" : "expand")}
            nodes={data}
            setFamily={setFamily}
            family={family}
            lastSync={lastSync} />
        </span>
      </div>
    </div>
    {data.length > 0 ? <FamilyTree
      saveToLocalStorage={setLocalStorage}
      chart={chart.current}
      nodes={data}
      familyId={family.id}
      nodesView={nodesView}
      setLastSync={setLastSync}
      clickNodeAction={(node) => {
        setOpenEditor(true)
        setEditingNode(node)
      }}
    /> : <EmptyState />
    }
  </div>
}
