export type PropsMeta = {
  typeName: string;
};
export type ChildrenModel =
  | {
      kind: 'none';
    }
  | {
      kind: 'text';
      mapToProp?: string;
      required?: boolean;
    }
  | {
      kind: 'nodes';
      min?: number;
      max?: number;
    }
  | {
      kind: 'slots';
      slots: Record<
        string,
        | 'none'
        | 'text'
        | 'nodes'
        | {
            kind: 'text' | 'nodes';
            required?: boolean;
          }
      >;
    };
export type EventsDecl = string[];
export type Aliases = Record<string, string>;
export type ComponentManifest = {
  type: string;
  propsTypeName: string;
  children: ChildrenModel;
  events: EventsDecl;
  aliases?: Aliases;
};
export declare function children(): {
  none(): ChildrenModel;
  text(opts?: { mapToProp?: string; required?: boolean }): ChildrenModel;
  nodes(opts?: { min?: number; max?: number }): ChildrenModel;
  slots(slots: any): ChildrenModel;
};
export declare function Component(cfg: {
  name: string;
  props: PropsMeta;
  children?: ChildrenModel;
  events?: EventsDecl;
  aliases?: Aliases;
}): ComponentManifest;
export declare function props<T>(typeName: string): PropsMeta;
