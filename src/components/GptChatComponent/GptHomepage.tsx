import { useDisclosure } from '@mantine/hooks';
import { AppShell,Group,Burger,Text} from "@mantine/core";
export function GptHomepage() {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
    //   header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      {/* <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          Header has a burger icon below sm breakpoint
        </Group>
      </AppShell.Header> */}
      <AppShell.Navbar p="md">
       <>
       </>
      </AppShell.Navbar>
      <AppShell.Main>
        <>
        </>
      </AppShell.Main>
    </AppShell>
  );
}