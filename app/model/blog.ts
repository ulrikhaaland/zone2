export interface BlogPost {
  title: string;
  href: string;
  imagePath: string;
  items: BlogItem[];
  date?: string;
  categories?: string[];
  description?: string;
  readingTime?: number;
}

export interface BlogItem {
  id: number;
  title?: string;
  // each item is a paragraph
  content: string[];
  image?: string;
  link?: string;
  expanded?: boolean;
  subItems?: BlogItem[];
  parentId?: number;
}
