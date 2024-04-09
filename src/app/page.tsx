import { sql } from "@vercel/postgres";
import { Metadata } from "next";
import dynamic from "next/dynamic";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });

export const fetchCache = "force-no-store";
async function loadData(fid: string | undefined) {
  try {
    if (fid === undefined) {
      return {
        id: null,
        title: null,
        updatedAt: null,
        nodes: null
      }
    }
    const { rows } = await sql`SELECT * FROM family_tree WHERE id = ${fid}`;
    return {
      id: rows[0].id,
      title: rows[0].name,
      nodes: rows[0].payload,
      updatedAt: new Date(rows[0].updatedAt)
    }
  } catch (e) {
    console.error(e)
    return {
      id: null,
      title: null,
      updatedAt: null,
      nodes: null
    }
  }
}


export async function generateMetadata(
  { searchParams }: { searchParams: any },
): Promise<Metadata> {
  const { title, updatedAt } = await loadData(searchParams.fid)
  if (title === null) {
    return {
      title: "Silsilah Keluarga",
      description: "Buat silsilah keluargamu disini. Gratis!",
    }
  }
  return {
    title: `Silsilah Keluarga ${title}`,
    description: `Terakhir diperbarui ${updatedAt?.toLocaleString()}`
  }
}


export default async function Home({ searchParams }: { searchParams: any }) {
  const { id, nodes, updatedAt, title } = await loadData(searchParams.fid)
  return <Renderer id={id ?? ""} title={title ?? ""} nodes={nodes ?? []} updatedAt={updatedAt} />
}
