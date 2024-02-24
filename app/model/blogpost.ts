import { BlogItem } from "./guide";

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
