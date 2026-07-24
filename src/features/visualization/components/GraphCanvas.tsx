import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line, Text as SvgText, G } from 'react-native-svg';
import { GraphState, GraphNode, GraphEdge } from '../../../types/algorithm.types';

interface GraphCanvasProps {
  graphState: GraphState;
  width: number;
  height: number;
}

const NODE_COLORS: Record<GraphNode['state'], string> = {
  default:   '#6C63FF',
  visiting:  '#FFB347',
  visited:   '#FF4757',
  processed: '#43C59E',
  path:      '#FF6584',
};

const EDGE_COLORS: Record<GraphEdge['state'], string> = {
  default: '#3A3A5A',
  active:  '#FFB347',
  inMST:   '#43C59E',
  path:    '#FF6584',
};

export function GraphCanvas({ graphState, width, height }: GraphCanvasProps) {
  const NODE_RADIUS = 20;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* Draw edges first (behind nodes) */}
        {graphState.edges.map((edge, i) => {
          const fromNode = graphState.nodes.find(n => n.id === edge.from);
          const toNode   = graphState.nodes.find(n => n.id === edge.to);
          if (!fromNode || !toNode) return null;
          const color = EDGE_COLORS[edge.state];
          const isHighlight = edge.state === 'active' || edge.state === 'path';

          return (
            <G key={`edge-${i}`}>
              <Line
                x1={fromNode.x}
                y1={fromNode.y}
                x2={toNode.x}
                y2={toNode.y}
                stroke={color}
                strokeWidth={isHighlight ? 3 : 1.5}
              />
              {edge.weight !== undefined && (
                <SvgText
                  x={(fromNode.x + toNode.x) / 2}
                  y={(fromNode.y + toNode.y) / 2 - 4}
                  fill="#FFB347"
                  fontSize={10}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {String(edge.weight)}
                </SvgText>
              )}
            </G>
          );
        })}

        {/* Draw nodes */}
        {graphState.nodes.map((node) => {
          const color = NODE_COLORS[node.state];
          return (
            <G key={`node-${node.id}`}>
              <Circle
                cx={node.x}
                cy={node.y}
                r={NODE_RADIUS}
                fill={color}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={2}
              />
              <SvgText
                x={node.x}
                y={node.y + 4}
                fill="#FFFFFF"
                fontSize={11}
                fontWeight="bold"
                textAnchor="middle"
              >
                {node.label}
              </SvgText>
              {node.distance !== undefined && node.distance !== Infinity && (
                <SvgText
                  x={node.x}
                  y={node.y - NODE_RADIUS - 4}
                  fill="#FFB347"
                  fontSize={9}
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {`d=${node.distance}`}
                </SvgText>
              )}
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
