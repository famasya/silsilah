'use client'

import { familyTree } from '@/data';
import { FamilyNode } from '@/types';
import dynamic from 'next/dynamic';
import { useState } from "react";

const FamilyTree = dynamic(() => import('@/components/family-tree'), { ssr: false });

export default function Home() {
  const [data, setData] = useState<FamilyNode[]>(familyTree);

  return <div id="wrapper" className="h-screen" >
    <FamilyTree
      familyTree={data}
    />
  </div>
}
