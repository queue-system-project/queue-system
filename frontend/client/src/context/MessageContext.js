import React, { createContext, useContext, useRef, useState } from "react";
import {
    Animated,
    Text,
    StyleSheet,
    Dimensions,
} from "react-native";

const MessageContext = createContext();

export function MessageProvider({ children }) {
    const [message, setMessage] = useState({
        visible: false,
        text: "",
        type: "success",
    });

    const translateY = useRef(new Animated.Value(-120)).current;

    const showMessage = (text, type = "success") => {
        setMessage({
            visible: true,
            text,
            type,
        });

        Animated.timing(translateY, {
            toValue: 0,
            duration: 250,
            useNativeDriver: true,
        }).start();

        setTimeout(() => {
            Animated.timing(translateY, {
                toValue: -120,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                setMessage({
                    visible: false,
                    text: "",
                    type: "success",
                });
            });
        }, 3000);
    };

    return (
        <MessageContext.Provider value={{ showMessage }}>
            {children}

            {message.visible && (
                <Animated.View
                    style={[
                        styles.message,
                        message.type === "success"
                            ? styles.successMessage
                            : styles.errorMessage,
                        {
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    <Text style={styles.messageText}>{message.text}</Text>
                </Animated.View>
            )}
        </MessageContext.Provider>
    );
}

export function useMessage() {
    return useContext(MessageContext);
}

const styles = StyleSheet.create({
    message: {
        position: "absolute",
        top: 55,
        left: 24,
        width: Dimensions.get("window").width - 48,
        minHeight: 46,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: "center",
        zIndex: 9999,
        elevation: 9999,
    },

    successMessage: {
        backgroundColor: "#3BDB3D",
    },

    errorMessage: {
        backgroundColor: "#E85C5C",
    },

    messageText: {
        color: "#FFFFFF",
        fontSize: 14,
        lineHeight: 19,
        fontFamily: "Montserrat-SemiBold",
        textAlign: "center",
    },
});