import React, { useState } from "react";
import { Text, View } from "react-native";
import Svg, { Polyline, Text as SvgText } from "react-native-svg";

import { adminHomeStyles as styles } from "../../styles/admin/adminHomeStyle";

const CHART_HEIGHT = 230;
const PADDING_TOP = 30;
const PADDING_BOTTOM = 30;
const PADDING_X = 14;

export default function AppointmentsLineChart({ data }) {
    const [width, setWidth] = useState(0);

    const values = data.map(point => point.value);
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;

    const points = data.map((point, index) => {
        const x = PADDING_X + (index * (width - PADDING_X * 2)) / Math.max(data.length - 1, 1);
        const y = PADDING_TOP + (1 - (point.value - min) / range) * (CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM);

        return { ...point, x, y };
    });

    // Etykieta nad punktem dla szczytów, pod punktem dla dołków.
    const isPeak = index => {
        const prev = values[index - 1] ?? values[index + 1];
        const next = values[index + 1] ?? values[index - 1];

        return values[index] >= (prev + next) / 2;
    };

    return (
        <View
            style={styles.chartContainer}
            onLayout={event => setWidth(event.nativeEvent.layout.width)}
        >
            {width > 0 && (
                <Svg width={width} height={CHART_HEIGHT}>
                    <Polyline
                        points={points.map(point => `${point.x},${point.y}`).join(" ")}
                        fill="none"
                        stroke="#5657C4"
                        strokeWidth={2}
                        strokeLinejoin="round"
                    />

                    {points.map((point, index) => (
                        <SvgText
                            key={point.label}
                            x={point.x}
                            y={isPeak(index) ? point.y - 12 : point.y + 22}
                            fontSize={12}
                            fontFamily="Montserrat-Medium"
                            fill="#5657C4"
                            textAnchor="middle"
                        >
                            {point.value}
                        </SvgText>
                    ))}
                </Svg>
            )}

            <View style={styles.chartAxisRow}>
                {data.map(point => (
                    <Text key={point.label} style={styles.chartAxisLabel}>
                        {point.label}
                    </Text>
                ))}
            </View>
        </View>
    );
}
