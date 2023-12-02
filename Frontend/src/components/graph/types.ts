export type Node = {
    id: number;
    label: string;
    title: string;
    color: string | { border: string; background: string };
    shape: string;
    borderRadius?: number;
    width?: number;
    margin?: number;
};

export type Edge = { 
    label: string;
    from: number;
    to: number; 
    width: number;
    color: string;
    font?: {
        align?: 'top' | 'middle' | 'bottom';
        color?: string;
        size?: number;
    };
};