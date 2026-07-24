import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { TreeNode } from '../../../types/algorithm.types';

interface TreeCanvasProps {
  root: TreeNode | undefined;
  width: number;
  height: number;
}

const NODE_COLORS: Record<TreeNode['state'], string> = {
  default:  '#6C63FF',
  visiting: '#FFB347',
  visited:  '#43C59E',
  found:    '#FF6584',
};

export function TreeCanvas({ root, width, height }: TreeCanvasProps) {
  function drawTreeNodes(node: TreeNode | undefined): React.ReactElement[] {
    if (!node) return [];
    const elements: React.ReactElement[] = [];
    const nx = node.x ?? 200;
    const ny = node.y ?? 40;

    if (node.left && node.left.x !== undefined) {
      elements.push(
        <Line
          key={`l-${node.id}`}
          x1={nx}
          y1={ny}
          x2={node.left.x}
          y2={node.left.y!}
          stroke="#3A3A5A"
          strokeWidth={1.5}
        />
      );
    }
    if (node.right && node.right.x !== undefined) {
      elements.push(
        <Line
          key={`r-${node.id}`}
          x1={nx}
          y1={ny}
          x2={node.right.x}
          y2={node.right.y!}
          stroke="#3A3A5A"
          strokeWidth={1.5}
        />
      );
    }

    elements.push(...drawTreeNodes(node.left));
    elements.push(...drawTreeNodes(node.right));

    const color = NODE_COLORS[node.state];
    elements.push(
      <G key={`node-${node.id}`}>
        <Circle
          cx={nx}
          cy={ny}
          r={16}
          fill={color}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
        <SvgText
          x={nx}
          y={ny + 4}
          fill="#FFFFFF"
          fontSize={10}
          fontWeight="bold"
          textAnchor="middle"
        >
          {node.label ?? String(node.value)}
        </SvgText>
      </G>
    );

    return elements;
  }

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {drawTreeNodes(root)}
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
