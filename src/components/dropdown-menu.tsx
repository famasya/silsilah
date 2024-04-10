import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FamilyNode } from "@/types";
import { OrgChart } from "d3-org-chart";
import { CloudDownloadIcon, ExpandIcon, FileIcon, FullscreenIcon, GithubIcon, HardDriveUpload, HelpCircleIcon, MenuIcon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

type Props = {
  nodes: FamilyNode[],
  setFamily: ({ id, title }: { id: string, title: string }) => void,
  loadLocalStorage: () => void,
  lastSync: Date,
  chart: OrgChart<FamilyNode>,
  toggleNodesView: () => void
  family: {
    id: string
    title: string
  }
}

export default function Menu({ nodes, toggleNodesView, chart, loadLocalStorage, setFamily, family, lastSync }: Props) {
  const router = useRouter()
  const [familyName, setFamilyName] = useState("")
  const [saveModal, openSaveModal] = useState(false);
  const [openHelp, openHelpModal] = useState(false);
  const { isLoading, mutate } = useSWR("/api/create", () => fetch("api/create", {
    method: "post",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name: familyName,
      payload: nodes
    }),
  }).then(async (res) => {
    const body = await res.json()
    if (res.status !== 200) {
      toast.error("Penyimpanan gagal", {
        description: body.message
      })
    } else {
      router.push(`/?fid=${body.id}`)
      setFamily({
        id: body.id,
        title: familyName
      })
      toast.success(<>Silsilah <strong>{familyName}</strong> telah disimpan</>)
      openSaveModal(false)
    }
  }), {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={"icon"} className="shadow"><MenuIcon size={16} /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* FILE */}
        <DropdownMenuLabel>Berkas</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => location.href = "/"} ><FileIcon size={16} className="mr-2" /> Silsilah baru</DropdownMenuItem>
        <DropdownMenuItem onClick={() => openSaveModal(true)} disabled={family.id !== ""}><SaveIcon size={16} className="mr-2" /> {family.id ? "Tersimpan otomatis" : "Simpan silsilah"} </DropdownMenuItem>
        <DropdownMenuItem onClick={loadLocalStorage} disabled={nodes.length === 0}><HardDriveUpload size={16} className="mr-2" /> Lihat versi lokal </DropdownMenuItem>
        <DropdownMenuItem onClick={() => chart.exportImg({ backgroundColor: "#f5f5f5" })} disabled={nodes.length === 0}><CloudDownloadIcon size={16} className="mr-2" /> Simpan gambar (PNG)</DropdownMenuItem>

        {/* CONTROL */}
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Kontrol</DropdownMenuLabel>
        <DropdownMenuItem onClick={toggleNodesView} disabled={nodes.length === 0}><ExpandIcon size={16} className="mr-2" /> Buka / tutup semua</DropdownMenuItem>
        <DropdownMenuItem onClick={() => chart.fit()} disabled={nodes.length === 0}><FullscreenIcon size={16} className="mr-2" /> Sesuikan dengan layar</DropdownMenuItem>

        {/* OTHERS */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openHelpModal(true)}><HelpCircleIcon size={16} className="mr-2" /> Bantuan</DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open("https://github.com/famasya/silsilah", "_blank")}><GithubIcon size={16} className="mr-2" /> Kode sumber</DropdownMenuItem>
        <DropdownMenuItem className="text-xs flex flex-col items-start gap-2">
          <span>ID : <strong>{family.id ? family.id.split("-")[0] : "-"}</strong></span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    <Dialog open={saveModal} onOpenChange={openSaveModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nama keluarga</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}>
          <Input
            id="name"
            required
            disabled={isLoading}
            onChange={(e) => setFamilyName(e.currentTarget.value)}
            name="name"
            placeholder="Misal: Bani Djojoredjo"
          />
          <Button type="submit" disabled={isLoading} className="w-full font-semibold mt-2 shadow">Simpan</Button>
        </form>
      </DialogContent>
    </Dialog>

    <Dialog open={openHelp} onOpenChange={openHelpModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bantuan</DialogTitle>
        </DialogHeader>
        <div>
          <p>1. Kami tidak menyimpan data pribadi Anda.</p>
          <p>2. Gunakan menu <strong>Lihat dari Lokal</strong> untuk membandingkan dengan versi lokal peramban ini (misal: jika sinkronisasi <em>cloud</em> gagal).</p>
          <p className="text-xs mt-4">
            Dibuat pada hari Selasa, 29 Ramadhan 1445 H.
          </p>
        </div>
      </DialogContent>
    </Dialog>

  </>
}
