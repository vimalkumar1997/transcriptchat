import React from "react";
import { useLocalStorage } from "@mantine/hooks";
import { ActionIcon, Box, useMantineColorScheme } from "@mantine/core";
const DarkLightTheme = () => {
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const [bgColorSchemestore, setBgColorSchemestore] = useLocalStorage({
        key: 'data-new',
        defaultValue: {
            primaryColor: 'grape', secondaryColor: 'grape.1', chartscolor: ["#cc5de8", "#da77f2", "#e599f7", "#eebefa", "#f3d9fa",]
        }
    });
    const [colorSchemeStore,setColorSchemeStore]=useLocalStorage<'light'|'dark'>({
        key:'color-scheme',
        defaultValue:'light'
    })

const toggleColorScheme=()=>{
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
    setColorSchemeStore((current) => (current === 'dark' ? 'light' : 'dark'));
}
    const dark = colorScheme === 'dark';
    return (
        <Box pos="fixed" top={10} right={10} style={{zIndex:1000}}>
            <Box
                style={{
                    cursor:"pointer"
                }}
                onClick={() => toggleColorScheme()}
              
                >
                    {dark ? '🌙' : '☀️'}
                </Box>
        </Box>
    );
}


export default DarkLightTheme;