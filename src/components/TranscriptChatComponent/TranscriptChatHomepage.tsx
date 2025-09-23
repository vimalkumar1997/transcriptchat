import { useDisclosure } from '@mantine/hooks';
import { AppShell, Group, Burger, Text, Box, Typography, Paper, ActionIcon, Avatar, Menu, Button } from "@mantine/core";
import { IconBrandDeno, IconLayoutSidebar,IconLogout,IconUserCircle  } from '@tabler/icons-react';
import { useLocalStorage } from '@mantine/hooks';
import { useRouter } from 'next/router';

interface UserData {
    id: number;
    username: string;
    email: string;

}

export function TranscriptChatHomepage() {
    const [opened, { toggle }] = useDisclosure();
    const router = useRouter();
    const [userData] = useLocalStorage<UserData | null>({
        key: 'userData',
        defaultValue: null
    });

    // Helper function to generate initials for avatar
    const getInitials = (name: string | undefined): string => {
        if (!name || name.trim() === '') {
            return 'U'; // Default fallback for undefined/empty names
        }

        // Split by spaces and filter out empty strings
        const words = name.trim().split(' ').filter(word => word.length > 0);

        if (words.length === 0) {
            return 'U'; // Fallback if no valid words
        }

        if (words.length === 1) {
            // Single word - return first letter only
            return words[0].charAt(0).toUpperCase();
        }

        // Multiple words - return first letter of first word + first letter of second word
        return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
    };

    function handleLogoutToken(){
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/');
    }

    return (
        <AppShell
            //   header={{ height: 60 }}
            navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
            padding="md"
        >
            <AppShell.Navbar>
                <>
                    <Paper pos={"sticky"} w={"100%"} top={0} display={"flex"} style={{ alignItems: "center", }} p={10}>
                        <IconBrandDeno size={30} />
                        <Box flex={1} />
                        <ActionIcon
                            variant="default"
                            size="md"
                            aria-label="Gradient action icon"

                        >
                            <IconLayoutSidebar stroke={1} size={20} />
                        </ActionIcon>
                    </Paper>

                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    Navbar is collapsed on mobile at sm breakpoint. At that point it is no longer offset by
                    padding in the main element and it takes the full width of the screen when opened.
                    <Paper pos={"sticky"} w={"100%"} bottom={0} display={"flex"} style={{ alignItems: "center", }} p={10}>
                        <Menu>

                            <Menu.Target>
                                <Button variant="default" fullWidth>
                                    <Avatar color="primary" radius="xl" size={"sm"}> {getInitials(userData?.username)}</Avatar>
                                    <Box flex={1}/>
                                    <Typography variant={"body1"} ml={15} tt={"lowercase"}>{userData?.username}</Typography>
                                </Button>
                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label display={"flex"} style={{alignItems:"center"}}><IconUserCircle size={14} style={{marginRight: "5px"}}/> {userData?.email}</Menu.Label>
                                <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleLogoutToken}>
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Paper>
                </>
            </AppShell.Navbar>
            <AppShell.Main>
                <>
                </>
            </AppShell.Main>
        </AppShell>
    );
}