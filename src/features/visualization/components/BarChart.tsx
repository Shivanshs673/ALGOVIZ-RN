import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Text as SvgText, G } from 'react-native-svg';
import { VisualizationStep } from '../../../types/algorithm.types';

interface BarChartProps {
  step: VisualizationStep;
  width: number;
  height: number;
}

const COLORS = {
  default:   '#6C63FF',   // purple
  comparing: '#FFB347',   // orange
  swapping:  '#FF4757',   // red
  sorted:    '#43C59E',   // green
  pivot:     '#FF6584',   // pink
  found:     '#43C59E',   // green
  checking:  '#FFB347',   // orange
};

export function BarChart({ step, width, height }: BarChartProps) {
  if (!step.array || step.array.length === 0) return null;

  const arr = step.array;
  const n = arr.length;
  const maxVal = Math.max(...arr);
  const barWidth = (width - 20) / n;
  const padding = 2;
  const chartHeight = height - 40;

  function getBarColor(index: number): string {
    if (step.sorted?.includes(index)) return COLORS.sorted;
    if (index === step.pivotIndex)    return COLORS.pivot;
    if (step.swapping?.includes(index)) return COLORS.swapping;
    if (step.comparing?.includes(index)) return COLORS.comparing;
    if (index === step.found) return COLORS.found;
    return COLORS.default;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {arr.map((val, i) => {
          const barH = Math.max(4, (val / maxVal) * chartHeight);
          const x = 10 + i * barWidth + padding;
          const y = chartHeight - barH;
          const color = getBarColor(i);
          const bw = barWidth - padding * 2;

          return (
            <G key={i}>
              <Rect
                x={x}
                y={y}
                width={bw}
                height={barH}
                rx={3}
                fill={color}
                opacity={step.sorted?.includes(i) ? 1 : 0.9}
              />
              {bw > 20 && (
                <SvgText
                  x={x + bw / 2}
                  y={y - 4}
                  fontSize={10}
                  fill="#FFFFFF"
                  textAnchor="middle"
                >
                  {val}
                </SvgText>
              )}
              <SvgText
                x={x + bw / 2}
                y={height - 4}
                fontSize={9}
                fill="#9E9EB8"
                textAnchor="middle"
              >
                {i}
              </SvgText>
            </G>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
  },
});
