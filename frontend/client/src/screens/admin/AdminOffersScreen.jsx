import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import AdminBackHeader from "../../components/admin/AdminBackHeader";

import { useLanguage } from "../../context/LanguageContext";
import { adminScreensStyles as styles } from "../../styles/admin/adminScreensStyle";

// Pozycje bez screen nie mają jeszcze ekranów ustawień.
const offerItems = [
    { titleKey: "offerArrivalConfirmation", screen: null },
    { titleKey: "offerSpotAvailable", screen: null },
    { titleKey: "offerLastChance", screen: null },
];

export default function AdminOffersScreen({ navigation }) {
    const { t } = useLanguage();

    return (
        <View style={styles.container}>
            <AdminBackHeader title={t.offersTitle} navigation={navigation}/>

            <ScrollView showsVerticalScrollIndicator={false}>
                {offerItems.map(item => (
                    <TouchableOpacity
                        key={item.titleKey}
                        style={styles.listItem}
                        activeOpacity={0.8}
                        disabled={!item.screen}
                        onPress={() => navigation.navigate(item.screen)}
                    >
                        <Text style={styles.listItemText}>{t[item.titleKey]}</Text>
                        <Ionicons name="chevron-forward" size={24} color="#111111"/>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}
