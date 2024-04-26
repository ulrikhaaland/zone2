export interface GuideItem {
  id: number;
  title: string;
  explanation: string;
  expanded: boolean;
  subItems?: GuideItem[];
  parentId?: number;
  videoLink?: string;
  blogPostLink?: string;
}

export function jsonToGuideItem(
  jsonResponse: string,
  guideItems?: GuideItem[]
): GuideItem {
  let trimmedResponse;

  // Attempt to trim the response and catch any potential errors
  try {
    trimmedResponse = jsonResponse
      .replace(/\\(?![/u"bfnrt])/g, "") // Remove invalid backslashes
      .replace(/\【[\d:]+†[^】]*\】/g, ""); // Remove citations like &#8203;``【oaicite:0】``&#8203;
  } catch (e) {
    // If an error occurs, throw it to be handled by the caller
    // throw new Error(
    //   `Error trimming jsonResponse: ${e instanceof Error ? e.message : e}`
    // );
  }

  let item;
  try {
    item = JSON.parse(trimmedResponse ?? jsonResponse);
  } catch (e) {
    // Throw an error for JSON parsing issues
    console.log(trimmedResponse);
    throw new Error(
      `JSON parsing error: ${e instanceof Error ? e.message : e}`
    );
  }

  const guideItem: GuideItem = {
    ...item,
    explanation: item.explanation.replace(/\【\d+†source】/g, "").trim(), // Remove source references
    subItems: [],
    expanded: false,
    parentId:
      item.parentId === null || item.parentId === undefined
        ? null
        : item.parentId,
  };

  // add video link of what zone 2 looks like
  if (guideItem.title.toLowerCase() === "what to think about during zone 2") {
    const parent = guideItems?.find(
      (item) => item.title.toLowerCase() === "methods for determining zone 2"
    );
    const item: GuideItem = {
      id: 200,
      title: "Video: What Zone 2 Looks Like",
      explanation: "A video showing what Zone 2 looks like.",
      videoLink: "https://youtu.be/1RqY5EYOM0k?si=ysR7w0_yxYtdkyJ5",
      expanded: false,
      parentId: guideItem.id,
    };
    if (parent) {
      parent.subItems?.push(item);
    }
  }

  return guideItem;
}

export function parseJsonToGuideItems(jsonResponse: string): GuideItem[] {
  console.log(jsonResponse);
  let trimmedResponse;

  // Attempt to trim the response and catch any potential errors
  try {
    trimmedResponse = jsonResponse.replace(/`json\n|`/g, "");
  } catch (e) {
    // If an error occurs, throw it to be handled by the caller
    // throw new Error(
    //   `Error trimming jsonResponse: ${e instanceof Error ? e.message : e}`
    // );
  }

  let data;
  try {
    data = JSON.parse(trimmedResponse ?? jsonResponse);
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

  const guideItems: GuideItem[] = data.guideItems.map((item: any) => ({
    ...item,
    explanation: item.explanation.replace(/\【\d+†source】/g, "").trim(), // Remove source references
    subItems: [],
    expanded: false,
    parentId:
      item.parentId === null || item.parentId === undefined
        ? null
        : item.parentId,
  }));

  const guideItemsMap = new Map<number, GuideItem>(
    guideItems.map((item: GuideItem) => [item.id, item])
  );

  guideItems.forEach((item: GuideItem) => {
    if (item.parentId !== null) {
      const parentItem = guideItemsMap.get(item.parentId!);
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
  // add video link of what zone 2 looks like
  const methodsItem: GuideItem | undefined = guideItems.find(
    (item: GuideItem) => item.title === "Methods for Determining Zone 2"
  );

  if (methodsItem) {
    const item: GuideItem = {
      id: 200,
      title: "Video: What Zone 2 Looks Like",
      explanation: "A video showing what Zone 2 looks like.",
      videoLink: "https://youtu.be/1RqY5EYOM0k?si=ysR7w0_yxYtdkyJ5",
      expanded: false,
      parentId: methodsItem.id,
    };
    methodsItem.subItems?.push(item);
  }

  return guideItems.filter((item: GuideItem) => item.parentId === null);
}

export function appendGuideItem(guideItems: GuideItem[], guideItem: GuideItem) {
  if (guideItem.parentId === null) {
    if (guideItem.title.toLowerCase() === "fitness level exceeded") {
      const parent = guideItems.find(
        (item) => item.title.toLowerCase() === "realistic goals & expectations"
      );
      if (parent) {
        guideItem.parentId = parent.id;
        parent.subItems?.push(guideItem);
        return;
      }
    }
    guideItems.push(guideItem);
    return;
  }

  const found = findParentItem(guideItems, guideItem.parentId!);
  if (found) {
    found.subItems!.push(guideItem);
  } else {
    // Handle the case where no parent is found; depending on your logic, this might be an error or a default behavior.
    console.warn("Parent item not found for", guideItem);
    guideItems.push(guideItem); // Default to pushing to the root level if no parent is found, or handle differently
  }
}

function findParentItem(
  guideItems: GuideItem[],
  parentId: number
): GuideItem | undefined {
  for (const item of guideItems) {
    if (item.id === parentId) {
      return item;
    }
    if (item.subItems) {
      const found = findParentItem(item.subItems, parentId);
      if (found) {
        return found;
      }
    }
  }
  return undefined;
}
