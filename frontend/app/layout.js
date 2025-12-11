import { Inter } from "next/font/google";
import "./globals.css";
import StoreProvider from "./Provider";
import CustomThemeProvider from "./CustomThemeProvider";
import Header from "@/components/Ui/Header/Header";
import { ToastContainer } from "react-toastify";
import { SidebarProvider } from "@/context/SidebarContext";
import { AuthProvider } from "@/context/AuthContext";
import Script from "next/script";

const font = Inter({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ["latin"],
});

export const metadata = {
  title: {
    default: "SPI Smart Campus - Sylhet Polytechnic Institute Class Routine & Result",
    template: "%s | SPI Smart Campus - Sylhet Polytechnic Institute"
  },
  description: "Official smart campus portal for Sylhet Polytechnic Institute (SPI). Access class routines, BTEB results, teacher directory, and campus notices instantly. Your one-stop digital solution for polytechnic diploma life in Sylhet.",
  keywords: ["sylhet", "sylhet polytechnic", "sylhet polytechnic institute", "polytechnic notics", "bteb", "dimploma", "diploma routine", "sylhet class routine", "sylhet routine", "spi", "spi result", "spi class routine", "spi campus", "SPI Class Routine 2025", "Sylhet Polytechnic Result 2024", "SPI Online Service", "Sylhet Polytechnic Institute Routine"],
  authors: [{ name: "Sylhet Polytechnic Institute" }],
  creator: "SPI Smart Campus",
  publisher: "Sylhet Polytechnic Institute",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "SPI Smart Campus - Sylhet Polytechnic Institute",
    description: "Access class routines, teacher profiles, and campus updates for Sylhet Polytechnic Institute.",
    url: "https://spi-smart-campus.vercel.app",
    siteName: "SPI Smart Campus",
    images: [
      {
        url: '/sy.png',
        width: 800,
        height: 600,
        alt: 'Sylhet Polytechnic Institute Logo',
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SPI Smart Campus",
    description: "Official digital portal for Sylhet Polytechnic Institute.",
    images: ['/sy.png'],
  },
  icons: {
    icon: '/sy.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Sylhet Polytechnic Institute",
    "alternateName": "SPI",
    "url": "https://spi-smart-campus.vercel.app",
    "logo": "https://spi-smart-campus.vercel.app/sy.png",
    "sameAs": [
      "http://sylhetpoly.gov.bd/",
      "https://www.facebook.com/sylhetpolytechnic"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Sylhet",
      "addressCountry": "Bangladesh"
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <meta name="google-site-verification" content="qivNvac31xAS1b7IeN183t0fKFja4DILfO07pN-U-1A" />
      <body className={`${font.className} antialiased`}>
        <Script
          id="json-ld-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
        <StoreProvider>
          <CustomThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <AuthProvider>
              <SidebarProvider>
                <Header />
                {children}
                <ToastContainer />
              </SidebarProvider>
            </AuthProvider>
          </CustomThemeProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
