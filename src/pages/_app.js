import "@/styles/globals.css";
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

export default function App({ Component, pageProps }) {
  return (
    <Component {...pageProps} />
  );
}
