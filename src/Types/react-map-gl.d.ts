declare module "react-map-gl" {
  import * as mapboxgl from "mapbox-gl";
  import * as React from "react";

  export interface MapProps extends mapboxgl.MapboxOptions {
    mapboxAccessToken: string;
    mapStyle?: string;
    style?: React.CSSProperties;
    initialViewState?: {
      longitude: number;
      latitude: number;
      zoom?: number;
      bearing?: number;
      pitch?: number;
    };
    children?: React.ReactNode; // ✅ Added this line
  }

  export default function Map(props: MapProps): JSX.Element;

  export const Marker: React.FC<{
    longitude: number;
    latitude: number;
    color?: string;
    anchor?: "center" | "top" | "bottom" | "left" | "right";
    onClick?: (e: any) => void;
  }>;

  export const Popup: React.FC<{
    longitude: number;
    latitude: number;
    anchor?: "center" | "top" | "bottom" | "left" | "right";
    onClose?: () => void;
    children?: React.ReactNode;
  }>;

  export const NavigationControl: React.FC<{
    position?: string;
  }>;
}
