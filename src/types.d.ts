export type FamilyNode = {
  id: string
  parentId?: string
  name: string
  sex: "L" | "P"
  spouse?: string
  notes?: string
}
