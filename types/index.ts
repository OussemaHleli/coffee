export type Category = {
  id: string;
  name: string;
  parentId: string | null;
};

export type Unit = 'kg' | 'g' | 'l' | 'ml' | 'pcs' | 'box';

export type InventoryItem = {
  id: string;
  name: string;
  categoryId: string;
  quantity: number;
  unit: Unit;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export type UsageLogEntry = {
  id: string;
  itemId: string;
  quantity: number;
  previousQuantity: number;
  note: string;
  createdAt: string;
};

export type DailyNote = {
  id: string;
  date: string;
  content: string;
  createdAt: string;
};

export type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: JSX.Element;
};

export type CategoryWithItems = Category & {
  items: InventoryItem[];
};

export type DateGroupedHistory = {
  [date: string]: UsageLogEntry[];
};

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    colors?: string[];
  }[];
}

export interface BarChartData extends ChartData {
  legend?: string[];
}

export interface PieChartData extends ChartData {
  names?: string[];
}