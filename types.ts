
export interface Photo {
  id: string;
  url: string;
  title: string;
  description?: string;
  mood?: string;
}

export type LayoutType = 
  | 'carousel' 
  | 'wall' 
  | 'stack' 
  | 'helix' 
  | 'tunnel' 
  | 'sphere' 
  | 'galaxy' 
  | 'book';

export interface GalleryTheme {
  name: string;
  description: string;
  color: string;
}
