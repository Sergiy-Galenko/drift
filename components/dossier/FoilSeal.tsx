import { StyleSheet, View } from 'react-native';
import { Canvas, Circle, Rect } from '@shopify/react-native-skia';

import { Colors } from '@/constants/tokens';

type FoilSealProps = { size?: number; rare?: boolean };

/** GPU canvas seal used for the reveal ceremony; no bitmap animation payload. */
export function FoilSeal({ size = 76, rare = false }: FoilSealProps) {
  const ink = rare ? Colors.goldFoil : Colors.blueInk;
  const middle = size / 2;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Canvas style={StyleSheet.absoluteFill}>
        <Circle cx={middle} cy={middle} r={middle} color={ink} />
        <Circle cx={middle} cy={middle} r={middle - 5} color={Colors.dossier} />
        <Circle cx={middle} cy={middle} r={middle - 10} color={ink} />
        <Rect x={middle - 1} y={11} width={2} height={size - 22} color={Colors.dossier} />
        <Rect x={11} y={middle - 1} width={size - 22} height={2} color={Colors.dossier} />
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({ wrap: { alignItems: 'center', justifyContent: 'center' } });
