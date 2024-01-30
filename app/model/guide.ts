export interface GuideItem {
  id: number;
  title: string;
  explanation: string;
  image?: string;
  link?: string;
  expanded: boolean;
  subItems?: GuideItem[];
  parentId?: number;
}

export function parseJsonToGuideItems(jsonResponse: string): GuideItem[] {
  const trimmedResponse = jsonResponse.replace(/`json\n|`/g, "");

  // Parse the JSON string
  let data;
  try {
    data = JSON.parse(trimmedResponse);
  } catch (e) {
    console.error("JSON parsing error:", e);
    return [];
  }

  if (!data.guideItems || !Array.isArray(data.guideItems)) {
    console.error("Invalid format: guideItems array not found");
    return [];
  }

  // Clean the explanation field and create guide items
  const guideItems = data.guideItems.map((item: any) => ({
    ...item,
    explanation: item.explanation.replace(/\【\d+†source】/g, "").trim(), // Remove source references
    subItems: [],
    expanded: false,
  }));

  // Create a map for easy access and to build hierarchy
  const guideItemsMap = new Map<number, GuideItem>(
    guideItems.map((item: any) => [item.id, item])
  );

  // Assign subItems to their respective parents
  guideItems.forEach((item: any) => {
    if (item.parentId !== undefined) {
      const parentItem = guideItemsMap.get(item.parentId);
      if (parentItem) {
        if (!parentItem.subItems) {
          parentItem.subItems = [];
        }
        parentItem.subItems.push(item);
      }
    }
  });

  // Extract top-level items (items without a parentId)
  return guideItems.filter((item: any) => item.parentId === undefined);
}
