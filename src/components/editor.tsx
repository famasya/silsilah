import { FamilyNode } from "@/types"
import { v4 as uuid } from "@lukeed/uuid"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

type Props = {
  editingNode: FamilyNode | null,
  nodes: FamilyNode[]
  setNodes: (nodes: FamilyNode[]) => void
  openEditor: boolean
  setOpenEditor: (state: boolean) => void
}

const ParentSelector = ({ nodes, onSelect, defaultValue }: { nodes: FamilyNode[], defaultValue?: string, onSelect: (value: string) => void }) => {
  return <Select defaultValue={defaultValue} disabled={nodes.length === 0} onValueChange={onSelect}>
    <SelectTrigger className="w-[280px]">
      <SelectValue placeholder="Pilih" />
    </SelectTrigger>
    <SelectContent>
      {nodes.map(node => <SelectItem key={node.id} value={node.id}>{node.name}</SelectItem>)}
    </SelectContent>
  </Select>
}

const removeParentAndChildren = (nodes: FamilyNode[], id: string): FamilyNode[] => {
  return nodes.filter(node => {
    if (node.id === id) {
      return false;
    }
    if (node.parentId === id) {
      return removeParentAndChildren(nodes, node.id).length === 0;
    }
    return true;
  })
}


export default function Editor({ editingNode, nodes, setNodes, openEditor, setOpenEditor
}: Props) {

  const defaultNodeValue: FamilyNode = {
    name: "",
    id: "",
    sex: "P",
  }
  const [node, setNode] = useState<FamilyNode>(defaultNodeValue)

  useEffect(() => {
    if (editingNode) {
      setNode({
        name: editingNode.name,
        id: editingNode.id,
        sex: editingNode.sex,
        spouse: editingNode.spouse,
        notes: editingNode.notes,
        parentId: editingNode.parentId
      })
    }
  }, [editingNode])

  const setNodeValue = (key: "name" | "sex" | "spouse" | "notes" | "parentId", value: string) => {
    setNode({ ...node, [key]: value })
  }

  return <Dialog open={openEditor} onOpenChange={() => {
    setNode(defaultNodeValue);
    setOpenEditor(false)
  }}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle className="font-bold">{editingNode ? "Ubah Data" : "Tambah Data"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nama
          </Label>
          <Input
            onChange={(e) => setNodeValue("name", e.currentTarget.value)}
            id="name"
            defaultValue={editingNode?.name}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="sex" className="text-right">
            Jenis Kelamin
          </Label>
          <RadioGroup
            id="sex" orientation="horizontal" name="sex" required className="flex flex-row" defaultValue={editingNode?.sex ?? "P"} onValueChange={(e) => setNodeValue("sex", e)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="P" id="p" />
              <Label htmlFor="p">Perempuan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem
                value="L" id="l" />
              <Label htmlFor="l">Laki</Label>
            </div>
          </RadioGroup>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="parent" className="text-right">
            Orangtua
          </Label>
          <ParentSelector nodes={nodes} defaultValue={editingNode?.parentId} onSelect={(value) => setNodeValue("parentId", value)} />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="spouse" className="text-right">
            Pasangan
          </Label>
          <Input
            defaultValue={editingNode?.spouse}
            id="spouse"
            onChange={(e) => setNodeValue("spouse", e.currentTarget.value)}
            placeholder="Opsional"
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="notes" className="text-right">
            Catatan
          </Label>
          <Input
            id="notes"
            defaultValue={editingNode?.notes}
            onChange={(e) => setNodeValue("notes", e.currentTarget.value)}
            placeholder="Opsional"
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button disabled={!editingNode && (node.name === "" || (node.parentId === undefined && nodes.length > 0))} onClick={() => {
          if (editingNode !== null) {
            const editedNodes = nodes.map(existingNode => {
              if (existingNode.id === editingNode.id) {
                return node
              }
              return existingNode
            })
            setNodes(editedNodes)
          } else {
            setNodes([...nodes, { ...node, id: uuid() }])
          }
          setOpenEditor(false)
        }}>Simpan</Button>
        {editingNode !== null ? <Button variant={"destructive"}
          onClick={() => {
            setNodes(removeParentAndChildren(nodes, editingNode.id))
            setOpenEditor(false)
          }}
        >Hapus</Button> : null}
      </DialogFooter>
    </DialogContent>
  </Dialog>


}
