import type { AppProps } from "next/app";
import Layout from "@/layouts/Layout";
import { MantineProvider, createTheme, MantineColorsTuple } from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { Provider } from "react-redux";
import store from "@/app/store";
import '@mantine/core/styles.css';
import "@/styles/globals.css";

// Define custom primary color palette
const primaryColor: MantineColorsTuple = [
  '#e6e5ff',
  '#c9c7fe',
  '#908dfc',
  '#5651fa',
  '#3f3eed', // Your primary color
  '#2f2ce8',
  '#2424e3',
  '#1a1acc',
  '#1515b6',
  '#0e0ea0'
];

export default function App({ Component, pageProps }: AppProps) {
  const preferredColorScheme = useColorScheme();
  
  const theme = createTheme({
    primaryColor: 'primary',
    colors: {
      primary: primaryColor,
    },
    headings: {
      sizes: {
        h1: { fontSize: "34px !important" },
        h2: { fontSize: "32px !important" },
        h3: { fontSize: "30px !important" },
        h4: { fontSize: "28px !important" },
        h5: { fontSize: "26px !important" },
        h6: { fontSize: "24px !important" },
      }
    },
    components: {
      Text: {
        styles: {
          root: {
            color: 'var(--paragraph-color)',
          }
        }
      },
      Title: {
        styles: {
          root: {
            color: 'var(--header-color)',
          }
        }
      }
    },
    other: {
      // Custom properties for your colors
      paragraphColor: '#497696',
      headerColorLight: '#083a5e',
      headerColorDark: '#ffffff',
    }
  });

  return (
    <>
      <style jsx global>{`
        :root {
          --paragraph-color: #497696;
          --header-color: #083a5e;
        }
        
        [data-mantine-color-scheme="dark"] {
          --paragraph-color: #ffffff;
          --header-color: #ffffff;
        }
        
        body {
          color: var(--paragraph-color);
        }
        
        p, .mantine-Text-root {
          color: var(--paragraph-color) !important;
        }
        
        h1, h2, h3, h5, h6, .mantine-Title-root {
          color: var(--header-color) !important;
        }
        
        h4 {
          color: #3F3EED !important;
          font-weight: 500 !important;
        }
      `}</style>
       <Provider store={store}>
      <MantineProvider theme={theme} defaultColorScheme={preferredColorScheme}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </MantineProvider>
       </Provider>
    </>
  );
}