import React, { useId } from "react";
import Svg, { Circle, ClipPath, Defs, G, Path, Rect } from "react-native-svg";

// Uproszczone flagi rysowane w kwadracie 60x60 i przycinane do koła.
const FLAGS = {
    en: (
        <>
            <Rect width="60" height="60" fill="#2B3A7A"/>
            <Path d="M0 0L60 60M60 0L0 60" stroke="#FFFFFF" strokeWidth="12"/>
            <Path d="M0 0L60 60M60 0L0 60" stroke="#D9343F" strokeWidth="4"/>
            <Path d="M30 0V60M0 30H60" stroke="#FFFFFF" strokeWidth="18"/>
            <Path d="M30 0V60M0 30H60" stroke="#D9343F" strokeWidth="10"/>
        </>
    ),
    pl: (
        <>
            <Rect width="60" height="30" fill="#F4F4F4"/>
            <Rect y="30" width="60" height="30" fill="#E2646E"/>
        </>
    ),
};

export default function CircleFlag({ code, size = 96 }) {
    // Unikalne id: kilka flag na ekranie nie może dzielić jednej ścieżki przycięcia.
    const clipId = `flag-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;

    return (
        <Svg width={size} height={size} viewBox="0 0 60 60">
            <Defs>
                <ClipPath id={clipId}>
                    <Circle cx="30" cy="30" r="30"/>
                </ClipPath>
            </Defs>

            <G clipPath={`url(#${clipId})`}>{FLAGS[code]}</G>
        </Svg>
    );
}
