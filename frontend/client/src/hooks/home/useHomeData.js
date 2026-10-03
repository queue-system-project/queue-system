import {
    useEffect,
    useState,
} from "react";

import {
    getCategories,
} from "../../api/categories/categoriesApi";
import {
    getInstitutions,
} from "../../api/institutions/institutionsApi";
import {
    getRecentAppointments,
} from "../../api/appointments/appointmentsApi";
import {
    getCurrentLocation,
    sortInstitutionsByDistance,
} from "../../utils/locationUtils";

export default function useHomeData() {
    const [
        categories,
        setCategories,
    ] = useState([]);

    const [
        institutions,
        setInstitutions,
    ] = useState([]);

    const [
        recentAppointments,
        setRecentAppointments,
    ] = useState([]);

    const [
        nearbyInstitutions,
        setNearbyInstitutions,
    ] = useState([]);

    useEffect(() => {
        const loadHomeData =
            async () => {
                try {
                    const [
                        categoriesData,
                        institutionsData,
                        appointmentsData,
                    ] = await Promise.all([
                        getCategories(),
                        getInstitutions(),
                        getRecentAppointments(),
                    ]);

                    setCategories(
                        Array.isArray(
                            categoriesData
                        )
                            ? categoriesData
                            : []
                    );

                    const safeInstitutions =
                        Array.isArray(
                            institutionsData
                        )
                            ? institutionsData
                            : [];

                    setInstitutions(
                        safeInstitutions
                    );

                    setRecentAppointments(
                        Array.isArray(
                            appointmentsData
                        )
                            ? appointmentsData
                            : []
                    );

                    try {
                        const userLocation =
                            await getCurrentLocation();

                        if (userLocation) {
                            setNearbyInstitutions(
                                sortInstitutionsByDistance(
                                    safeInstitutions,
                                    userLocation
                                )
                            );
                        } else {
                            setNearbyInstitutions([]);
                        }
                    } catch (locationError) {
                        console.log(
                            "LOCATION ERROR:",
                            locationError
                        );

                        setNearbyInstitutions([]);
                    }
                } catch (error) {
                    console.log(
                        "HOME DATA ERROR:",
                        error
                    );
                }
            };

        loadHomeData();
    }, []);

    return {
        categories,
        institutions,
        recentAppointments,
        nearbyInstitutions,
    };
}
