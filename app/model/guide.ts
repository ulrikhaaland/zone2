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
      .replace(/\【[\d:]+†[^】]*\】/g, "")
      .replace("  .", ".")
      .replace(" .", "."); // Remove citations like &#8203;``【oaicite:0】``&#8203;
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

  // check if guide item id has decimal
  if (guideItem.id % 1 !== 0) {
    // extract all numbers before decimal
    const parentId = Math.floor(guideItem.id);
    guideItem.parentId = parentId;
    // extract all numbers after decimal
    const subId = guideItem.id % 1;
    guideItem.id = subId + parentId;
  }

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
  let parentItem: GuideItem | undefined;

  // set expanded === true for first 3 items
  if (guideItems.length < 3) {
    guideItem.expanded = true;
  }

  if (guideItem.parentId === null) {
    parentItem = findParentItemByTitle(
      guideItems,
      guideItem.title.toLowerCase().trim()
    );
    if (parentItem) guideItem.parentId = parentItem.id;
  }

  if (!parentItem) parentItem = findParentItem(guideItems, guideItem.parentId!);

  if (parentItem) {
    parentItem.subItems!.push(guideItem);
  } else {
    // Handle the case where no parent is found; depending on your logic, this might be an error or a default behavior.
    // console.warn("Parent item not found for", guideItem);
    guideItems.push(guideItem); // Default to pushing to the root level if no parent is found, or handle differently
  }
}

export function findParentItemByTitle(
  guideItems: GuideItem[],
  title: string
): GuideItem | undefined {
  if (
    title === "minimum" ||
    title === "moderate" ||
    title === "moderate (recommended)" ||
    title === "moderate  (recommended)" ||
    title === "maximum" ||
    title === "high vs low-impact"
  ) {
    return guideItems.find(
      (item) => item.title.toLowerCase() === "effective exercise doses"
    );
  } else if (
    title === "professional methods" ||
    title === "accessible methods" ||
    title === "combining methods"
  ) {
    return guideItems.find(
      (item) => item.title.toLowerCase() === "methods for determining zone 2"
    );
  } else if (
    title === "fitness level exceeded" ||
    title === "assessing progress"
  ) {
    return guideItems.find(
      (item) => item.title.toLowerCase() === "realistic goals & expectations"
    );
  } else if (
    title === "stress accumulation" ||
    title === "recovery" ||
    title === "preventing overtraining"
  ) {
    return guideItems.find(
      (item) =>
        item.title.toLowerCase() === "recovery & preventing overtraining"
    );
  } else if (title === "duration" || title === "frequency") {
    const effExerciseDoses = guideItems.find(
      (item) => item.title.toLowerCase() === "effective exercise doses"
    );
    if (effExerciseDoses) {
      return effExerciseDoses.subItems![effExerciseDoses.subItems!.length - 1];
    }
  } else {
    return undefined;
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
