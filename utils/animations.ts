import { withSpring, type WithSpringConfig } from 'react-native-reanimated';

export const springConfig: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
};

export const sheetSpringConfig: WithSpringConfig = {
  damping: 20,
  stiffness: 200,
};

export const quickSpring: WithSpringConfig = {
  damping: 20,
  stiffness: 300,
};

export function animateSpring(value: number, config = springConfig) {
  'worklet';
  return withSpring(value, config);
}
