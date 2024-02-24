export interface BlogItem {
  id: number;
  title: string;
  explanation: string;
  image?: string;
  link?: string;
  expanded: boolean;
  subItems?: BlogItem[];
  parentId?: number;
}

export function parseJsonToGuideItems(jsonResponse: string): BlogItem[] {
  let trimmedResponse;

  // Attempt to trim the response and catch any potential errors
  try {
    trimmedResponse = jsonResponse.replace(/`json\n|`/g, "");
  } catch (e) {
    // If an error occurs, throw it to be handled by the caller
    throw new Error(
      `Error trimming jsonResponse: ${e instanceof Error ? e.message : e}`
    );
  }

  let data;
  try {
    data = JSON.parse(trimmedResponse);
  } catch (e) {
    // Throw an error for JSON parsing issues
    throw new Error(
      `JSON parsing error: ${e instanceof Error ? e.message : e}`
    );
  }

  if (!data.guideItems || !Array.isArray(data.guideItems)) {
    // Throw an error if guideItems are not in the expected format
    throw new Error("Invalid format: guideItems array not found");
  }

  const guideItems = data.guideItems.map((item: any) => ({
    ...item,
    explanation: item.explanation.replace(/\【\d+†source】/g, "").trim(), // Remove source references
    subItems: [],
    expanded: false,
    parentId:
      item.parentId === null || item.parentId === undefined
        ? null
        : item.parentId,
  }));

  const guideItemsMap = new Map<number, BlogItem>(
    guideItems.map((item: any) => [item.id, item])
  );

  guideItems.forEach((item: any) => {
    if (item.parentId !== null) {
      const parentItem = guideItemsMap.get(item.parentId);
      if (!parentItem) {
        console.log(guideItemsMap);

        throw new Error(
          `Parent item with id ${item.parentId} not found for item ${item.id}`
        );
      }
      if (!parentItem.subItems) {
        parentItem.subItems = [];
      }
      parentItem.subItems.push(item);
    }
  });

  return guideItems.filter((item: any) => item.parentId === null);
}
