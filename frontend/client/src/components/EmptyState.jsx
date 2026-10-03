import React from "react";
import { Text, View } from "react-native";

export default function EmptyState({title, description, style, titleStyle, descriptionStyle,}) {
    return (
        <View style={style}>
            {title && (
                <Text style={titleStyle}>
                    {title}
                </Text>
            )}

            {description && (
                <Text style={descriptionStyle}>
                    {description}
                </Text>
            )}
        </View>
    );
}