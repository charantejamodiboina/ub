import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import styles from "@/styles/Home.module.css";
import Header from "@/Components/Header";
import HomePage from "@/Components/Home";
import VillaSpecs from "@/Components/VillaSpecs";
import Component3 from "@/Components/Component3";
import AmanitiesComponent from "@/Components/Amanities";
import Gallery from "@/Components/Gallery";
import SmartLiving from "@/Components/SmartLiving";
import MasterPlan from "@/Components/MasterPlan";
import LocationAdvantages from "@/Components/LocationAdvantages";
import CustomerTestimonials from "@/Components/CustomerTestimonials";
import ContactUs from "@/Components/ContactUs";
import About from "@/Components/About";
import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import StartupModal from "@/Components/formpopup";

const Footer = dynamic(() => import("@/Components/Footer"), { ssr: true });
const Component8 = dynamic(() => import("@/Components/Component8"), { ssr: true });
const LoadingSpinner = dynamic(() => import("@/Components/LoadingPage"), { ssr: false });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <>
      <div className={` `}>
        <Header />
        <main className={styles.main}>
          <StartupModal/>
          <HomePage />
        </main>
        <div className={styles.bodyComp}>

          <VillaSpecs />
          <Component3 />
          <AmanitiesComponent />
          <Gallery />
          <SmartLiving />
          <MasterPlan />
          <Component8 />
          <LocationAdvantages />
          <CustomerTestimonials />
          <ContactUs />
          <About />
          <Footer />
        </div>
      </div>
    </>
  );
}
