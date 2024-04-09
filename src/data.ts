import { FamilyNode } from "./types";

export const familyTree: FamilyNode[] = [{
  name: 'Ayah',
  spouse: 'Ibu',
  sex: 'L',
  id: 'id',
}, {
  name: 'Anak 1',
  id: 'id1',
  sex: 'L',
  parentId: 'id'
}, {
  name: 'Anak 2',
  id: 'id2',
  sex: 'L',
  parentId: 'id'
}, {
  name: 'Cucu 1',
  id: 'id3',
  sex: 'L',
  parentId: 'id2'
}];
