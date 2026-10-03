import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import SplashScreen from "./src/screens/auth/SplashScreen";
import LoginScreen from "./src/screens/auth/LoginScreen";
import RegisterScreen from "./src/screens/auth/RegisterScreen";
import CodeScreen from "./src/screens/auth/CodeScreen";
import ResetPasswordScreen from "./src/screens/auth/ResetPasswordScreen";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPasswordScreen";
import LanguageScreen from "./src/screens/auth/LanguageScreen";
import RoleSelectionScreen from "./src/screens/auth/RoleSelectionScreen";
import HomeScreen from "./src/screens/home/HomeScreen";
import SeeAllScreen from "./src/screens/home/SeeAllScreen";
import SearchScreen from "./src/screens/search/SearchScreen";
import AppointmentsScreen from "./src/screens/appointments/AppointmentsScreen";
import AppointmentsHistoryScreen from "./src/screens/appointments/AppointmentsHistoryScreen";
import AppointmentDetailsScreen from "./src/screens/appointments/AppointmentDetailsScreen";
import EmployeeDetailsScreen from "./src/screens/employee/EmployeeDetailsScreen";
import ProfileScreen from "./src/screens/profile/ProfileScreen";
import ProfileDetailsScreen from "./src/screens/profile/ProfileDetailsScreen";
import EditProfileScreen from "./src/screens/profile/EditProfileScreen";
import HelpSupportScreen from "./src/screens/profile/HelpSupportScreen";
import TermsConditionsScreen from "./src/screens/profile/TermsConditionsScreen";
import PrivacyPolicyScreen from "./src/screens/profile/PrivacyPolicyScreen";
import ChangePasswordScreen from "./src/screens/profile/ChangePasswordScreen";
import ChangeLanguageScreen from "./src/screens/profile/ChangeLanguageScreen";
import NotificationsScreen from "./src/screens/notifications/NotificationsScreen";
import NotificationDetailsScreen from "./src/screens/notifications/NotificationDetailsScreen";
import InstitutionDetailsScreen from "./src/screens/institution/InstitutionDetailsScreen";
import SelectDateScreen from "./src/screens/appointments/SelectDateScreen";
import QueueSuccessScreen from "./src/screens/queue/QueueSuccessScreen";
import QueueErrorScreen from "./src/screens/queue/QueueErrorScreen";
import QueueStatusScreen from "./src/screens/queue/QueueStatusScreen";
import AppointmentCompletedScreen from "./src/screens/appointments/AppointmentCompletedScreen";
import CompleteProfileScreen from "./src/screens/auth/CompleteProfileScreen";

import { LanguageProvider } from "./src/context/LanguageContext";
import { MessageProvider } from "./src/context/MessageContext";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

const Stack = createNativeStackNavigator();
function AppNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator color="#5657C4" />
            </View>
        );
    }

    const initialRouteName = user
        ? (!user.first_name || !user.last_name
            ? "CompleteProfile"
            : "Home")
        : "Splash";

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName={initialRouteName}
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Splash" component={SplashScreen} />
                <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Register" component={RegisterScreen} />
                <Stack.Screen name="Code" component={CodeScreen} />
                <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
                <Stack.Screen name="Language" component={LanguageScreen} />
                <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />

                <Stack.Screen name="Home" component={HomeScreen} options={{ animation: "none" }}/>
                <Stack.Screen name="SeeAll" component={SeeAllScreen} />
                <Stack.Screen name="Search" component={SearchScreen} options={{ animation: "none" }}/>
                <Stack.Screen name="Appointments" component={AppointmentsScreen} options={{ animation: "none" }}/>
                <Stack.Screen name="AppointmentsHistory" component={AppointmentsHistoryScreen} options={{ animation: "none" }}/>
                <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen}/>
                <Stack.Screen name="EmployeeDetails" component={EmployeeDetailsScreen}/>
                <Stack.Screen name="Profile" component={ProfileScreen} ptions={{ animation: "none" }}/>
                <Stack.Screen name="ProfileDetails" component={ProfileDetailsScreen} />
                <Stack.Screen name="EditProfile" component={EditProfileScreen} />
                <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
                <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
                <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
                <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
                <Stack.Screen name="ChangeLanguage" component={ChangeLanguageScreen} />
                <Stack.Screen name="Notifications" component={NotificationsScreen} />
                <Stack.Screen name="NotificationDetails" component={NotificationDetailsScreen}/>
                <Stack.Screen name="InstitutionDetails" component={InstitutionDetailsScreen}/>
                <Stack.Screen name="SelectDate" component={SelectDateScreen} />
                <Stack.Screen name="QueueSuccess" component={QueueSuccessScreen} />
                <Stack.Screen name="QueueError" component={QueueErrorScreen} />
                <Stack.Screen name="QueueStatus" component={QueueStatusScreen} />
                <Stack.Screen name="AppointmentCompleted" component={AppointmentCompletedScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

export default function App() {
    const [fontsLoaded] = useFonts({
        "Nunito-ExtraBold": require("./assets/fonts/Nunito-ExtraBold.ttf"),
        "Montserrat-Regular": require("./assets/fonts/Montserrat-Regular.ttf"),
        "Montserrat-Medium": require("./assets/fonts/Montserrat-Medium.ttf"),
        "Montserrat-SemiBold": require("./assets/fonts/Montserrat-SemiBold.ttf"),
    });

    if (!fontsLoaded) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: "#FFFFFF",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <ActivityIndicator color="#5657C4" />
            </View>
        );
    }

    return (
        <LanguageProvider>
            <MessageProvider>
                <AuthProvider>
                    <AppNavigator />
                </AuthProvider>
            </MessageProvider>
        </LanguageProvider>
    );
}