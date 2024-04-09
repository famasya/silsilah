import { FamilyNode } from '@/types';
import { OrgChart } from 'd3-org-chart';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import useSWR from 'swr';
import { useToast } from './ui/use-toast';

type Props = {
  nodes: FamilyNode[],
  familyId: string | null,
  setLastSync: (lastSync: Date) => void,
  clickNodeAction: (node: FamilyNode) => void
}

const NodeElement = (nodes: FamilyNode[], node: FamilyNode) => {
  return `<div class="border text-base h-full border-2 p-4 border-gray-200 rounded">
  <div class="text-lg font-bold">[${node.sex.toString()}] ${node.name}</div>
  ${node.spouse ? `<div>Pasangan : ${node.spouse}</div>` : ''}
  <div>Anak : ${getChildren(nodes, node.id)}</div>
  ${node.notes ? `<div>Catatan : ${node.notes}</div>` : ''}
  </div>`
}

const getChildren = (nodes: FamilyNode[], parentId: string) => {
  const children = nodes.filter(node => node.parentId === parentId).map(child => child.name);
  if (children.length > 0) {
    return children.join(', ');
  }
  return '-';
}

export default function FamilyTree({ setLastSync, nodes, clickNodeAction, familyId }: Props) {
  const d3Container = useRef(null);
  const chart = useMemo(() => new OrgChart<FamilyNode>(), []);
  const { toast } = useToast();
  const isInitialRender = useRef(true);
  const { mutate } = useSWR('/api/update', () => {
    fetch('/api/update', {
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: familyId,
        payload: nodes
      }),
    }).then(async (res) => {
      if (res.status !== 200) {
        const body = await res.json()
        toast({
          title: 'Ups... Penyimpanan gagal',
          description: body.message,
        })
      }
    })
  }, { revalidateOnFocus: false, revalidateOnMount: false })

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    } else {
      if (familyId !== null) {
        setLastSync(new Date())
        mutate().then(() => {
          const lastSyncDate = new Date()
          toast({
            title: `Tersimpan: ${lastSyncDate.toLocaleTimeString()}`,
            duration: 1000
          })
        })
      }
    }
  }, [nodes, familyId])

  useLayoutEffect(() => {
    let initialZoom = 1;
    if (window.innerWidth < 500) {
      initialZoom = 0.6;
    }

    if (d3Container.current) {
      chart
        .container(d3Container.current)
        .data(nodes)
        .svgHeight(window.innerHeight)
        .linkYOffset(0)
        .rootMargin(100)
        .setActiveNodeCentered(true)
        .buttonContent(({ node, state }) => {
          return `<div class="w-auto m-auto px-2 py-1 text-sm shadow text-gray-700 bg-white rounded border border-gray-300">${node.children
            ? `Tutup`
            : `Buka`
            }</div>`
        })
        .initialZoom(initialZoom)
        .onNodeClick((node) => {
          clickNodeAction(node.data)
        })
        .nodeContent((node) => {
          return NodeElement(nodes, node.data)
        })
        .render();
    }
  }, [chart, nodes]);

  return (
    <div className={'h-full'}>
      <div ref={d3Container} className={"h-full"} />
    </div>
  );
};
