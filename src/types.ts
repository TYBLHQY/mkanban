export type Direction = "prev" | "next";
export type BoardType = "board" | "column" | "card";
export type Theme = "latte" | "mocha" | "frappe" | "macchiato";

type Board_ = {
  id: string;
  type: BoardType;
  position: number;
  parent_id: string | null;
};

export type BoardRow = Board_ & { doc: string };
export type BoardData = Board_ & { doc: DocV1 };

export interface DocV1 {
  _v: 1; // 版本
  title: string; // 标题
  description?: string; // 描述
  estimate?: number; // 预估时间
  assignees?: string[]; // 负责人
  tags?: string[]; // 标签
  priority?: 1 | 2 | 3 | 4 | 5; // 优先级
  dueDate?: string; // 截止日期
}

export interface Preferences {
  theme?: Theme;
  opened_board_id?: string | null;
}
