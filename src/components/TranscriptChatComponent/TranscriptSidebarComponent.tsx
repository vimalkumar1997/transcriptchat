
import React, { useState } from "react";
import { Box, Typography, Paper, ActionIcon, Avatar, Menu, Button, NavLink } from "@mantine/core";
import { IconBrandDeno, IconSearch, IconLayoutSidebar, IconLogout, IconUserCircle, IconEdit } from '@tabler/icons-react';
import { useLocalStorage } from '@mantine/hooks';
import { useRouter } from 'next/router';
import { useHover } from '@mantine/hooks';
import { useDisclosure } from '@mantine/hooks';
import ChatCreateModal from "./modalComponents/ChatCreateModal";

interface LayoutProps {
    setSidebarClose: any
    sidebarclose: boolean
    opened: boolean
    toggle: any
}
interface UserData {
    id: number;
    username: string;
    email: string;

}
const Navbar = [{ id: 1, title: "New chat", icon: <IconEdit size={16} />, }, { id: 2, title: "Search chat", icon: <IconSearch size={16} />, }]

function TranscriptSidebarComponent({ sidebarclose, setSidebarClose, toggle, opened }: LayoutProps) {
    const router = useRouter();
    const { hovered, ref } = useHover();
    const [userData] = useLocalStorage<UserData | null>({
        key: 'userData',
        defaultValue: null
    });
    const [chatmodelopened, setChatopened] = useState(false);

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

    function handleLogoutToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        router.push('/');
    }


    function handleNavbarToggleOpen() {
        setSidebarClose(true);
    }

    function handleNavbarToggleClose() {
        // opened? setSidebarClose(false): toggle

        if (opened === false) {
            setSidebarClose(false)
        }
        else {
            toggle()
        }

    }


    function handleNavbarClick(item: any) {
        if (item.id === 1) {
           setChatopened(true)
        }


    }
    return (
        <>
            {sidebarclose ? (
                <>
                    <Paper pos={"sticky"} w={"100%"} top={0} display={"flex"} style={{ alignItems: "center", }} pl={20} pr={20} pt={20}>
                        <IconBrandDeno size={30} />
                        <Box flex={1} />
                        <ActionIcon
                            variant="default"
                            size="md"
                            aria-label="Gradient action icon"
                            onClick={handleNavbarToggleClose}

                        >
                            <IconLayoutSidebar stroke={1} size={20} />
                        </ActionIcon>
                    </Paper>
                    <Box p={10}>
                        {Navbar.map((item, index) => (
                            <NavLink
                                label={item.title}
                                leftSection={item.icon}
                                onClick={() => handleNavbarClick(item)}
                            />
                        ))}
                    </Box>
                    <Box p={10}>
                        <Menu>
                            <Menu.Label>Chats</Menu.Label>
                            <Menu.Label display={"flex"} style={{ alignItems: "cebter", justifyContent: "center" }}>No Chat</Menu.Label>
                        </Menu>
                    </Box>

                    <Paper pos={"sticky"} w={"100%"} bottom={0} display={"flex"} style={{ alignItems: "center", }} p={10}>
                        <Menu>

                            <Menu.Target>
                                <Button variant="default" fullWidth bg={"unset"} style={{ border: "unset !important" }}>
                                    <Avatar color="primary" radius="xl" size={"sm"}> {getInitials(userData?.username)}</Avatar>
                                    <Box flex={1} />
                                    <Typography variant={"body1"} ml={15} tt={"lowercase"}>{userData?.username}</Typography>
                                    <br />
                                    <Menu.Label display={"flex"} style={{ alignItems: "center" }}>Free</Menu.Label>
                                </Button>

                            </Menu.Target>
                            <Menu.Dropdown>
                                <Menu.Label display={"flex"} style={{ alignItems: "center" }}><IconUserCircle size={14} style={{ marginRight: "5px" }} /> {userData?.email}</Menu.Label>
                                <Menu.Item leftSection={<IconLogout size={14} />} onClick={handleLogoutToken}>
                                    Logout
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Paper>
                </>
            ) : (
                <>

                    <Paper pos={"sticky"} w={"100%"} top={0} display={"flex"} style={{ alignItems: "center", justifyContent: "center" }} pt={20}>
                        <Box ref={ref}>
                            {hovered ? (
                                <>

                                    <ActionIcon
                                        variant="default"
                                        size="md"
                                        aria-label="Gradient action icon"
                                        onClick={handleNavbarToggleOpen}

                                    >
                                        <IconLayoutSidebar stroke={1} size={20} />
                                    </ActionIcon>
                                </>
                            ) : (
                                <IconBrandDeno size={30} />
                            )}
                        </Box>
                    </Paper>
                    <ChatCreateModal chatmodelopened={chatmodelopened} setChatopened={setChatopened} />
                </>
            )}
        </>
    )

}

export default TranscriptSidebarComponent;