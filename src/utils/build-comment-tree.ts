export const buildCommentTree = (comments: any[]): any[] => {
  const map: Record<string, any[]> = {};
  const roots: any[] = [];

  for (const c of comments) {
    c.childs = [];
    const parentId = c.parentCommentId ? String(c.parentCommentId) : "";
    if (!map[parentId]) map[parentId] = [];
    map[parentId].push(c);
  }

  for (const c of comments) {
    const id = String(c.id || c._id);
    if (map[id]) c.childs = map[id];
    if (!c.parentCommentId) roots.push(c);
  }

  return roots;
};
