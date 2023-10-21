export interface Node {
  id: number;
  label: string;
  color: string;
  x: number;
  y: number;
}

export interface Edge {
  from: number;
  to: number;
}