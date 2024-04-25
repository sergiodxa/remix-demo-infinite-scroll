import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useNavigation,
} from "@remix-run/react";
import type { SVGProps } from "react";
import { useSpinDelay } from "spin-delay";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <LoadingIndicator />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

function LoadingIndicator() {
  let navigation = useNavigation();
  let isLoading = useSpinDelay(navigation.state !== "idle", {
    minDuration: 500,
    // 10ms is the max user-space budget per frame, we delay by this time to
    // ensure that, if it's fast enough the user will not wait more than one
    // frame, we just don't show the spinner
    delay: 10,
  });

  if (!isLoading) return null;
  return (
    <Spinner
      style={{ position: "fixed", top: 16, right: 16, width: 48, height: 48 }}
    />
  );
}

function Spinner(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 2400 2400"
      width={24}
      height={24}
      {...props}
    >
      <g strokeWidth={200} strokeLinecap="round" stroke="#000" fill="none">
        <path d="M1200 600V100" />
        <path opacity={0.5} d="M1200 2300v-500" />
        <path opacity={0.917} d="M900 680.4l-250-433" />
        <path opacity={0.417} d="M1750 2152.6l-250-433" />
        <path opacity={0.833} d="M680.4 900l-433-250" />
        <path opacity={0.333} d="M2152.6 1750l-433-250" />
        <path opacity={0.75} d="M600 1200H100" />
        <path opacity={0.25} d="M2300 1200h-500" />
        <path opacity={0.667} d="M680.4 1500l-433 250" />
        <path opacity={0.167} d="M2152.6 650l-433 250" />
        <path opacity={0.583} d="M900 1719.6l-250 433" />
        <path opacity={0.083} d="M1750 247.4l-250 433" />
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          keyTimes="0;0.08333;0.16667;0.25;0.33333;0.41667;0.5;0.58333;0.66667;0.75;0.83333;0.91667"
          values="0 1199 1199;30 1199 1199;60 1199 1199;90 1199 1199;120 1199 1199;150 1199 1199;180 1199 1199;210 1199 1199;240 1199 1199;270 1199 1199;300 1199 1199;330 1199 1199"
          dur="0.83333s"
          begin="0s"
          repeatCount="indefinite"
          calcMode="discrete"
        />
      </g>
    </svg>
  );
}
