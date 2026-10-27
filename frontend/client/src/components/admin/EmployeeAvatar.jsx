import React from "react";
import { Image, Text, View } from "react-native";

import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

export const getEmployeeName = employee =>
    [employee.title, employee.first_name, employee.last_name].filter(Boolean).join(" ");

const getInitials = employee =>
    [employee.first_name, employee.last_name]
        .filter(Boolean)
        .map(part => part[0].toUpperCase())
        .join("");

export default function EmployeeAvatar({ employee, size }) {
    const sizeStyle = size && { width: size, height: size, borderRadius: size / 2 };

    return (
        <View style={[styles.employeeAvatar, sizeStyle]}>
            {employee.profile_image ? (
                <Image
                    source={{ uri: employee.profile_image }}
                    style={styles.employeeAvatarImage}
                />
            ) : (
                <Text style={[styles.employeeInitials, size && { fontSize: size / 3 }]}>
                    {getInitials(employee)}
                </Text>
            )}
        </View>
    );
}
