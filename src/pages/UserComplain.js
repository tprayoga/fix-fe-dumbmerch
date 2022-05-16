import React, { useContext, useEffect, useState } from "react";
import NavbarUser from "../components/navbar/Navbar";
import { io } from "socket.io-client";
import ChatList from "../components/complains/ChatList";
import ChatBody from "../components/complains/ChatBody";
import { UserContext } from "../context/userContext";

// initial variable outside component
let socket;

function UserComplain() {
  const [contact, setContact] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [messages, setMessages] = useState([]);
  const [state, dispatch] = useContext(UserContext);

  // connect to server in useEffect function
  useEffect(() => {
    socket = io("https://dumbmech-v2.herokuapp.com", {
      auth: {
        token: localStorage.getItem("token"), // we must set options to get access to socket server
      },
      query: {
        id: state.user.id,
      },
    });

    socket.on("new message", () => {
      console.log("contact", contact);
      console.log("triggered", contact?.id);
      socket.emit("load messages", contact?.id);
    });

    // listen error sent from server
    socket.on("connect_error", (err) => {
      console.error(err.message); // not authorized
    });

    loadContact();
    loadMessages();

    socket.on("connect_error", (err) => {
      console.error(err.message); // not authorized
    });

    return () => {
      socket.disconnect();
    };
  }, [messages]);

  const loadContact = () => {
    // emit event to load admin contact
    socket.emit("load admin contact");

    // listen event to get admin contact
    socket.on("admin contact", async (data) => {
      // do whatever to the data sent from server
      const dataContact = {
        ...data,
        message: messages.length > 0 ? messages[messages.length - 1].message : "click here to start message",
      };
      console.log(dataContact);
      setContacts([dataContact]);
    });
  };

  const onClickContact = (data) => {
    setContact(data);
    socket.emit("load messages", data.id);
  };

  const loadMessages = (value) => {
    socket.on("admin contact", (data) => {
      socket.on("messages", async (data) => {
        if (data.length > 0) {
          const dataMessages = data.map((item) => ({
            idSender: item.sender.id,
            message: item.message,
          }));
          console.log(dataMessages);
          setMessages(dataMessages);
        }
        const chatMessages = document.getElementById("chat-messages");
        chatMessages.scrollTop = chatMessages?.scrollHeight;
      });
    });
  };

  const onSendMessage = (e) => {
    if (e.key === "Enter") {
      const data = {
        idRecipient: contact.id,
        message: e.target.value,
      };
      console.log(onSendMessage);
      socket.emit("send messages", data);
      e.target.value = "";
    }
  };

  console.log(messages);
  return (
    <div>
      <NavbarUser />
      <div className="container">
        <div className="row">
          <div className="col">
            <ChatList dataContact={contacts} clickContact={onClickContact} contact={contact} />
          </div>
          <div className="col">
            <ChatBody contact={contact} messages={messages} user={state.user} sendMessage={onSendMessage} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserComplain;
