import { useState, useEffect, useRef, useCallback } from 'react';
import type { GamepadState } from '../types';

const BUTTON_MAP: { [key: number]: string } = {
  0: 'A', 1: 'B', 2: 'X', 3: 'Y',
  4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT',
  8: 'BACK', 9: 'START',
  10: 'LSB', 11: 'RSB',
  12: 'UP', 13: 'DOWN', 14: 'LEFT', 15: 'RIGHT'
};

const AXES_MAP: { [key: number]: string } = {
  0: 'LS_X', 1: 'LS_Y', 2: 'RS_X', 3: 'RS_Y'
};

export const useGamepad = (): GamepadState => {
  const [gamepadState, setGamepadState] = useState<GamepadState>({
    isConnected: false,
    buttons: {},
    axes: {},
  });
  // FIX: The error "Expected 1 arguments, but got 0" occurs because useRef<number>() requires an initial value.
  // Initialize useRef with null to explicitly provide an initial value.
  const animationFrameId = useRef<number | null>(null);

  const pollGamepads = useCallback(() => {
    const gamepads = navigator.getGamepads();
    const gp = gamepads[0];

    if (gp) {
      const buttons: { [key: string]: boolean } = {};
      gp.buttons.forEach((button, index) => {
        const key = BUTTON_MAP[index];
        if (key) {
            // Triggers are often buttons and axes. Treat buttons 6 and 7 as axes only.
            if(index === 6 || index === 7) {
                 buttons[key] = false; // We'll use the axes value for triggers
            } else {
                 buttons[key] = button.pressed;
            }
        }
      });
      
      const axes: { [key: string]: number } = {
        LS_X: gp.axes[0],
        LS_Y: gp.axes[1],
        RS_X: gp.axes[2],
        RS_Y: gp.axes[3],
        LT: (gp.buttons[6]?.value ?? 0),
        RT: (gp.buttons[7]?.value ?? 0),
      };

      setGamepadState({ isConnected: true, buttons, axes });
    } else {
      setGamepadState(prevState => ({ ...prevState, isConnected: false }));
    }

    animationFrameId.current = requestAnimationFrame(pollGamepads);
  }, []);

  const handleGamepadConnected = useCallback((event: GamepadEvent) => {
    console.log('Gamepad connected:', event.gamepad);
    if (!animationFrameId.current) {
      pollGamepads();
    }
  }, [pollGamepads]);

  const handleGamepadDisconnected = useCallback((event: GamepadEvent) => {
    console.log('Gamepad disconnected:', event.gamepad);
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      // FIX: Set ref to null as per its new type.
      animationFrameId.current = null;
    }
    setGamepadState({ isConnected: false, buttons: {}, axes: {} });
  }, []);

  useEffect(() => {
    window.addEventListener('gamepadconnected', handleGamepadConnected);
    window.addEventListener('gamepaddisconnected', handleGamepadDisconnected);

    pollGamepads(); // Initial poll for already connected gamepads

    return () => {
      window.removeEventListener('gamepadconnected', handleGamepadConnected);
      window.removeEventListener('gamepaddisconnected', handleGamepadDisconnected);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleGamepadConnected, handleGamepadDisconnected]);

  return gamepadState;
};
