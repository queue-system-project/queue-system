import React, { useId } from "react";
import { Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { adminHomeStyles as styles } from "../../styles/admin/adminHomeStyle";

const MAX_BAR_HEIGHT = 135;
const MIN_BAR_HEIGHT = 8;
const BAR_WIDTH = 40;
const HIGHLIGHTED = 2;

// Dwa najbardziej obciążone słupki są czerwone, pozostałe fioletowe i coraz jaśniejsze.
const getBarColors = (index, count) => {
    if (index === 0) return ["#C0392B", "#F2D7D5"];
    if (index === 1) return ["#D98880", "#F5E3E1"];

    const rest = Math.max(count - HIGHLIGHTED - 1, 1);
    const opacity = 1 - ((index - HIGHLIGHTED) / rest) * 0.85;
    const color = `rgba(86, 87, 196, ${opacity.toFixed(2)})`;

    return [color, color];
};

export default function EmployeeLoadChart({ data }) {
    // Unikalny prefiks: stos nawigacji może trzymać kilka instancji ekranu naraz,
    // a powtórzone id gradientu w DOM sprawiają, że słupki tracą wypełnienie.
    const chartId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
    const max = Math.max(...data.map(item => item.value), 1);

    return (
        <View style={styles.chartContainer}>
            <View style={styles.barsRow}>
                {data.map((item, index) => {
                    const height = Math.max((item.value / max) * MAX_BAR_HEIGHT, MIN_BAR_HEIGHT);
                    const [from, to] = getBarColors(index, data.length);
                    const gradientId = `bar-${chartId}-${item.id}`;

                    return (
                        <View key={item.id} style={styles.barColumn}>
                            <Text
                                style={[
                                    styles.barValue,
                                    index < HIGHLIGHTED && styles.barValueTop,
                                ]}
                            >
                                {item.value}
                            </Text>

                            <Svg
                                width="100%"
                                height={height}
                                viewBox={`0 0 ${BAR_WIDTH} ${height}`}
                                preserveAspectRatio="none"
                            >
                                <Defs>
                                    <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                        <Stop offset="0" stopColor={from} />
                                        <Stop offset="1" stopColor={to} />
                                    </LinearGradient>
                                </Defs>

                                <Rect
                                    width={BAR_WIDTH}
                                    height={height + 12}
                                    rx={12}
                                    fill={`url(#${gradientId})`}
                                />
                            </Svg>

                            <Text style={styles.barName}>
                                {item.name.split(" ").join("\n")}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
