"use client"

import { FamilyNode } from "@/types";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
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
  return <div className='w-full h-full flex justify-center items-center'>
    <span className="flex items-center gap-2 text-base text-gray-500">Klik tombol <PlusIcon className='rounded border border-gray-300' /> di kiri atas untuk mulai menambahkan data</span>
  </div>
}

export default function Renderer({ nodes, title, id, updatedAt }: Props) {
  const [data, setData] = useState<FamilyNode[]>(nodes);
  const [editingNode, setEditingNode] = useState<FamilyNode | null>(null)
  const [openEditor, setOpenEditor] = useState(false)
  const [lastSync, setLastSync] = useState<Date>(updatedAt ?? new Date())
  const [family, setFamily] = useState<{ id: string; title: string }>({
    id: id,
    title: title
  });

  useEffect(() => {
    if (!openEditor) {
      setEditingNode(null)
    }
  }, [openEditor])

  return <div id="wrapper" className="h-screen" >
    <div className="absolute w-full text-center p-4">
      <div className='flex justify-center'>
        <span className='flex-none'>
          <Button size={'icon'} onClick={() => setOpenEditor(true)} className="shadow"><PlusIcon size={16} /></Button>
          <Editor setNodes={setData} nodes={data} editingNode={editingNode} openEditor={openEditor} setOpenEditor={setOpenEditor} />
        </span>
        <span className='flex-1 flex justify-center items-center'>
          <h1 className="lg:text-3xl md:text-xl font-semibold">Silsilah Keluarga {family.title}</h1>
        </span>
        <span className='flex-none'>
          <Menu nodes={data} setFamily={setFamily} family={family} lastSync={lastSync} />
        </span>
      </div>
    </div>
    {data.length > 0 ? <FamilyTree
      nodes={data}
      familyId={family.id}
      setLastSync={setLastSync}
      clickNodeAction={(node) => {
        setOpenEditor(true)
        setEditingNode(node)
      }}
    /> : <EmptyState />
    }
  </div>
}
