import React, { useState } from "react";
import { useDisclosure } from '@mantine/hooks';
import { AppShell,  Box,  ActionIcon} from "@mantine/core";
import { IconX, IconMenu2,  } from '@tabler/icons-react';

import TranscriptSidebarComponent from "./TranscriptSidebarComponent";
export function TranscriptChatHomepage() {
    const [opened, { toggle }] = useDisclosure();
    const [sidebarclose, setSidebarClose] = useState(true);
  
    return (
        <AppShell
            navbar={{ width: sidebarclose ? 250 : 50, breakpoint: 'xs', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Navbar>
                <TranscriptSidebarComponent setSidebarClose={setSidebarClose} sidebarclose={sidebarclose}opened={opened} toggle={toggle}/>
                
            </AppShell.Navbar>
            <AppShell.Main>
                <Box pos="relative" hiddenFrom="sm">
                    <ActionIcon
                        variant="default"
                        size="lg"
                        aria-label="Toggle navigation"
                        onClick={toggle}
                    >
                        {opened ? <IconX size={20} /> : <IconMenu2 size={20} />}
                    </ActionIcon>
                </Box>
            </AppShell.Main>
        </AppShell>
    );
}