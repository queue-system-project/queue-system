import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

// options: [{ value, label }]
export default function AdminSelect({ value, options, placeholder, onChange, disabled }) {
    const [open, setOpen] = useState(false);

    const selected = options.find(option => option.value === value);

    return (
        <View>
            <TouchableOpacity
                style={[styles.field, disabled && { opacity: 0.5 }]}
                activeOpacity={0.8}
                disabled={disabled}
                onPress={() => setOpen(!open)}
            >
                <Text style={[styles.fieldText, !selected && styles.fieldPlaceholder]}>
                    {selected ? selected.label : placeholder}
                </Text>

                <Ionicons name={open ? "chevron-up" : "chevron-down"} size={20} color="#111111"/>
            </TouchableOpacity>

            {open && (
                <ScrollView style={styles.selectOptions} nestedScrollEnabled>
                    {options.map(option => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.selectOption,
                                option.value === value && styles.selectOptionSelected,
                            ]}
                            onPress={() => {
                                onChange(option.value);
                                setOpen(false);
                            }}
                        >
                            <Text style={styles.selectOptionText}>{option.label}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
        </View>
    );
}
