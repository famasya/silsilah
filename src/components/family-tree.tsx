import { FamilyNode } from '@/types';
import { OrgChart } from 'd3-org-chart';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { toast } from "sonner";
import useSWR from 'swr';

type Props = {
  nodes: FamilyNode[],
  nodesView?: 'expand' | 'collapse' | 'default',
  familyId: string | null,
  chart: OrgChart<FamilyNode>,
  setLastSync: (lastSync: Date) => void,
  clickNodeAction: (node: FamilyNode) => void
}

const NodeElement = (nodes: FamilyNode[], node: FamilyNode) => {
  return `<div class="border bg-gray-100 text-base h-full border border-2 p-4 border-gray-200 rounded">
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

export default function FamilyTree({ setLastSync, chart, nodesView = 'default', nodes, clickNodeAction, familyId }: Props) {
  const d3Container = useRef(null);
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
    }).then(async (res: any) => {
      if (res.status !== 200) {
        const body = await res.json()
        toast.error(`Penyimpanan gagal`, {
          description: body.message
        })
      } else {
        toast.info('Tersimpan', {
          duration: 1000
        })
      }
    })
  }, { revalidateOnFocus: false, revalidateOnMount: false })

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
    } else {
      if (familyId !== "") {
        setLastSync(new Date())
        mutate()
      }
    }
  }, [nodes, familyId, mutate])

  useLayoutEffect(() => {
    let initialZoom = 1;
    if (window.innerWidth < 500) {
      initialZoom = 0.6;
    }

    if (d3Container.current) {
      if (nodesView === 'collapse') {
        chart.collapseAll()
      } else if (nodesView === 'expand') {
        chart.expandAll()
      }
      chart
        .container(d3Container.current)
        .data(nodes)
        .compact(true)
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
  }, [chart, nodes, clickNodeAction, nodesView]);

  return (
    <div className={'h-full'}>
      <div ref={d3Container} className={"h-full"} />
    </div>
  );
};
