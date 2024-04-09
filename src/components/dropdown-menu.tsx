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
import { GithubIcon, HelpCircle, MenuIcon, SaveIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import useSWR from "swr";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "./ui/use-toast";

type Props = {
  nodes: FamilyNode[],
  setFamily: ({ id, title }: { id: string, title: string }) => void,
  lastSync: Date,
  family: {
    id: string
    title: string
  }
}

export default function Menu({ nodes, setFamily, family, lastSync }: Props) {
  const { toast } = useToast()
  const router = useRouter()
  const [familyName, setFamilyName] = useState('')
  const [saveModal, openSaveModal] = useState(false);
  const { isLoading, mutate } = useSWR('/api/create', () => fetch('api/create', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: familyName,
      payload: nodes
    }),
  }).then(async (res) => {
    if (res.status !== 200) {
      const body = await res.json()
      toast({
        title: 'Ups... Penyimpanan gagal',
        description: body.message,
      })
    } else {
      toast({
        title: 'Berhasil!',
        description: <>Silsilah <strong>{familyName}</strong> telah disimpan</>
      })
      const body = await res.json()
      router.push(`/?fid=${body.id}`)
      setFamily({
        id: body.id,
        title: familyName
      })
      openSaveModal(false)
    }
  }), {
    revalidateOnFocus: false,
    revalidateOnMount: false,
  })

  return <>
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size={'icon'} className='shadow'><MenuIcon size={16} /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Menu</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => openSaveModal(true)} disabled={family.id !== ''}><SaveIcon size={16} className="mr-2" /> Simpan silsilah</DropdownMenuItem>
        <DropdownMenuItem><HelpCircle size={16} className="mr-2" /> Bantuan</DropdownMenuItem>
        <DropdownMenuItem onClick={() => window.open("https://github.com/famasya/silsilah", "_blank")}><GithubIcon size={16} className="mr-2" /> Repository</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-xs flex flex-col items-start gap-2">
          <span>ID : <strong>{family.id ? family.id.split('-')[0] : '-'}</strong></span>
          <span>
            Sinkronisasi: <strong>{lastSync.toLocaleString()}</strong>
          </span>
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
  </>
}
