# The idea
We hear about end-to-end encryption chats all the time. We hear
that Whatsapp provides end-to-end encryption, that Telegram provides
it too, but for me as an end user I am not sure, even more I am 
suspicious when someone ensures me that my communication is private
and that companies are not reading or storing the data.

Because of that I decided to try a simple chat, that fits into a
simple html file, which file each user with a basic programming 
knowledge can check and ensure himself that messages are encrypted
client side and can be decrypted only by providing the same password
that is used for encryption. To achieve client side encryption 
Web Crypto API interface is used which provides secure enough cryptography 
to encrypt the transmitted data. To transmit the data will be used
simple NodeJS WebSocket server, that each user will be able to open
and to use it for communication.

# Includes
- Client side password based key derivation
- Used advanced encryption standard
- Chat history stored only in browser session
- WebSocket-based relay servers every user can open

# The Flow
- Page where user sets relay address and chat password
- Chat window with message input, submit button, chat log and system info

---

#### TODO:
- Open a relay
