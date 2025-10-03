export type CommonModifiers = Record<string, unknown>;

export type TextProps = {
  id?: string;
  modifiers?: CommonModifiers;
  value?: string;
};

export type ButtonProps = {
  id?: string;
  modifiers?: CommonModifiers;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  onAction?: any[];
};

export type RowProps = {
  id?: string;
  modifiers?: CommonModifiers;
};

export type ColumnProps = {
  id?: string;
  modifiers?: CommonModifiers;
};
