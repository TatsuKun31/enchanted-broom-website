export interface Room {
  id: string;
  type: string;
  quantity?: number;
  serviceType: "standard" | "deep";
  addons: string[];
}