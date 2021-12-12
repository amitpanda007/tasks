export interface Label {
  id?: string;
  name: string;
  color: string;
  taskIds?: string[];
  isSelected?: boolean;
  created: Date;
  modified: Date;
}
