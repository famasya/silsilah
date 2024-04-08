import { FamilyNode } from '@/types';
import { OrgChart } from 'd3-org-chart';
import { useLayoutEffect, useRef, useState } from 'react';
import { EditMember } from './edit-member';

type Props = {
  familyTree: FamilyNode[]
}

const NodeElement = (familyTree: FamilyNode[], node: FamilyNode) => {
  return `<div class="border text-base h-full border-2 p-4 border-gray-200 rounded">
  <div class="text-lg font-bold">${node.name}</div>
  ${node.spouse ? `<div>Pasangan : ${node.spouse}</div>` : ''}
  <div>Anak : ${getChildren(familyTree, node.id)}</div>
  ${node.notes ? `<div>Catatan : ${node.notes}</div>` : ''}
  </div>`
}

const getChildren = (familyTree: FamilyNode[], parentId: string) => {
  return familyTree.filter(node => node.parentId === parentId).map(child => child.name).join(', ');
}

export default function FamilyTree({ familyTree }: Props) {
  const d3Container = useRef(null);
  const [editMember, setEditMember] = useState<{ state: boolean; node: FamilyNode | null }>({
    state: false,
    node: null
  });
  const chart = new OrgChart<FamilyNode>();

  const openEditMemberModal = (state: boolean, node: FamilyNode | null) => {
    setEditMember({
      state,
      node
    })
  }

  useLayoutEffect(() => {
    if (d3Container.current) {
      chart
        .container(d3Container.current)
        .data(familyTree)
        .svgHeight(window.innerHeight)
        .linkYOffset(0)
        .setActiveNodeCentered(true)
        .buttonContent(({ node, state }) => {
          return `<div class="w-auto m-auto px-2 py-1 text-sm shadow text-gray-700 bg-white rounded border border-gray-300">${node.children
            ? `Tutup`
            : `Buka`
            }</div>`
        })
        .onNodeClick((node) => {
          openEditMemberModal(true, node.data)
        })
        .nodeContent((node) => {
          return NodeElement(familyTree, node.data)
        })
        .render();
    }
  }, [d3Container.current]);

  return (
    <div className={'h-full'}>
      <div ref={d3Container} className={"h-full"} />
      <EditMember open={editMember.state} data={editMember.node} setOpen={() => openEditMemberModal(false, null)} />
    </div>
  );
};
