export interface BlogPost {
  title: string;
  href: string;
  imagePath: string;
  items: BlogItem[];
  date?: string;
  category?: string;
  description?: string;
  readingTime?: number;
}

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
