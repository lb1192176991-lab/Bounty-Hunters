export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  path: string;
}

export type DropPosition = 'before' | 'after' | 'inside';

export interface DragState {
  draggedNode: FileNode | null;
  dropTarget: { node: FileNode; position: DropPosition } | null;
}

export function canDrop(dragged: FileNode, target: FileNode, position: DropPosition): boolean {
  if (dragged.id === target.id) return false;
  if (position === 'inside' && target.type !== 'folder') return false;
  return true;
}

export function moveNode(tree: FileNode[], draggedId: string, targetId: string, position: DropPosition): FileNode[] {
  const newTree = JSON.parse(JSON.stringify(tree));
  
  function findParent(nodes: FileNode[], id: string): { parent: FileNode[]; index: number } | null {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === id) return { parent: nodes, index: i };
      if (nodes[i].children) {
        const found = findParent(nodes[i].children!, id);
        if (found) return found;
      }
    }
    return null;
  }

  const draggedParent = findParent(newTree, draggedId);
  const targetParent = findParent(newTree, targetId);
  
  if (!draggedParent || !targetParent) return tree;
  
  const [dragged] = draggedParent.parent.splice(draggedParent.index, 1);
  
  if (position === 'inside') {
    targetParent.parent[targetParent.index].children = targetParent.parent[targetParent.index].children || [];
    targetParent.parent[targetParent.index].children!.push(dragged);
  } else {
    const insertAt = position === 'before' ? targetParent.index : targetParent.index + 1;
    targetParent.parent.splice(insertAt, 0, dragged);
  }
  
  return newTree;
}
