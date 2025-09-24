
import { Modal, Button } from '@mantine/core';


interface ChatModel {
    chatmodelopened:boolean;
   setChatopened:any

}

// function ChatCreateModal() {
function TranscriptSidebarComponent({ chatmodelopened,setChatopened }: ChatModel) {


  return (
    <>
      <Modal opened={chatmodelopened} onClose={()=>setChatopened(false)} title="Authentication">
        {/* Modal content */}
      </Modal>

 
    </>
  );
}
export default TranscriptSidebarComponent;