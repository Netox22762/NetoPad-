
export type MappingType = 'button' | 'stick' | 'dpad' | 'trigger' | 'bumper' | 'combo';

export interface BaseMapping {
  id: number;
  type: MappingType;
  x: number;
  y: number;
  label: string;
}

export type ButtonKey = 'A' | 'B' | 'X' | 'Y' | 'START' | 'BACK' | 'LSB' | 'RSB';
export type StickKey = 'LS' | 'RS';
export type DpadKey = 'DPAD';
export type TriggerKey = 'LT' | 'RT';
export type BumperKey = 'LB' | 'RB';
export type ComboModifierKey = TriggerKey | BumperKey;

export interface ButtonMapping extends BaseMapping {
  type: 'button';
  key: ButtonKey;
}

export interface BumperMapping extends BaseMapping {
    type: 'bumper';
    key: BumperKey;
}

export interface StickMapping extends BaseMapping {
  type: 'stick';
  key: StickKey;
}

export interface DpadMapping extends BaseMapping {
    type: 'dpad';
    key: DpadKey;
}

export interface TriggerMapping extends BaseMapping {
    type: 'trigger';
    key: TriggerKey;
}

export interface ComboMapping extends BaseMapping {
    type: 'combo';
    modifierKey: ComboModifierKey;
    actionKey: ButtonKey;
}

export type Mapping = ButtonMapping | StickMapping | DpadMapping | TriggerMapping | BumperMapping | ComboMapping;

export interface Profile {
  name: string;
  mappings: Mapping[];
  backgroundImage: string | null;
}

export interface GamepadState {
    isConnected: boolean;
    buttons: { [key: string]: boolean };
    axes: { [key: string]: number };
}

export interface AIMappingSuggestion {
  label: string;
  type: MappingType;
  suggested_key: string;
  x_percent: number;
  y_percent: number;
}
