'use client'

import { FamilyNode } from '@/types';
import dynamic from 'next/dynamic';
import { useState } from "react";

const FamilyTree = dynamic(() => import('@/components/family-tree'), { ssr: false });

export const familyTree = [{
  name: 'Ayah',
  spouse: 'Ibu',
  id: 'id',
}, {
  name: 'Anak 1',
  id: 'id1',
  parentId: 'id'
}, {
  name: 'Anak 2',
  id: 'id2',
  parentId: 'id'
}, {
  name: 'Cucu 1',
  id: 'id3',
  parentId: 'id2'
}];
export default function Home() {
  const [data, setData] = useState<FamilyNode[]>(familyTree);

  return <div id="wrapper" className="h-screen" >
    <FamilyTree
      familyTree={data}
    />
  </div>
}
