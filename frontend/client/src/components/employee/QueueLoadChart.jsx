import React, { useId } from "react";
import { Text, View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

import { employeePanelStyles as styles } from "../../styles/employee/employeePanelStyle";

const MAX_BAR_HEIGHT = 90;
const EMPTY_BAR_HEIGHT = 10;
const BAR_WIDTH = 40;

const GREEN = "#2E9E3A";

// Im większe obciążenie, tym ciemniejszy fiolet; ostatnia zakończona godzina jest zielona.
const getBarColors = (value, max, isLatest) => {
    if (isLatest) return ["#A8E6A8", "#E6F8E6"];

    const opacity = 0.4 + (value / max) * 0.6;
    const color = `rgba(86, 87, 196, ${opacity.toFixed(2)})`;
    return [color, color];
};

// data: [{ hour, value }]; value null = godzina jeszcze nie minęła.
export default function QueueLoadChart({ data }) {
    // Unikalny prefiks gradientów, bo w stosie nawigacji może być kilka instancji ekranu.
    const chartId = useId().replace(/[^a-zA-Z0-9_-]/g, "");

    const max = Math.max(...data.map(item => item.value ?? 0), 1);
    const latestIndex = data.reduce((last, item, index) => (item.value != null ? index : last), -1);

    return (
        <View style={styles.chart}>
            {data.map((item, index) => {
                const isEmpty = item.value == null;
                const isLatest = index === latestIndex;
                const height = isEmpty
                    ? EMPTY_BAR_HEIGHT
                    : Math.max((item.value / max) * MAX_BAR_HEIGHT, EMPTY_BAR_HEIGHT);
                const [from, to] = isEmpty ? ["#F2F2F2", "#F2F2F2"] : getBarColors(item.value, max, isLatest);
                const gradientId = `load-${chartId}-${index}`;

                return (
                    <View key={item.hour} style={styles.chartColumn}>
                        <Text style={[styles.chartValue, isLatest && { color: GREEN }]}>
                            {isEmpty ? " " : item.value}
                        </Text>

                        <Svg
                            width="100%"
                            height={height}
                            viewBox={`0 0 ${BAR_WIDTH} ${height}`}
                            preserveAspectRatio="none"
                        >
                            <Defs>
                                <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                    <Stop offset="0" stopColor={from}/>
                                    <Stop offset="1" stopColor={to}/>
                                </LinearGradient>
                            </Defs>

                            {/* Wysokość z zapasem: zaokrąglone są tylko górne rogi. */}
                            <Rect width={BAR_WIDTH} height={height + 12} rx={10} fill={`url(#${gradientId})`}/>
                        </Svg>

                        <Text style={styles.chartHour}>{item.hour}</Text>
                    </View>
                );
            })}
        </View>
    );
}
