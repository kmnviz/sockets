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

The mission is to keep it as simple as possible. Everyone can run a relay.
Relay for chat session can be selected. No history is stored.

# Client
Client must stay as simple as it is possible. Everyone should be able to
read the client.html file and to understand that the messages are encrypted
and the password is not transmitted across the internet. The client must be
open source. Every one should be able to download the client on his local
machine and to use it.

# Relay
The Relay is a simple NodeJS application on which simple WebSocket server
runs. To avoid run of different instance of server for each chat session,
chat rooms are foreseen, and a capacity of maximum simultaneous connections
that relay server will handle at a time. This requires to set a chat room
name on a chat session initialization. When a user requires to join a room
that not exist the room creates and when the last user from a room left
the chat room closes itself with no history left behind.

# Includes
- Client side password based key derivation
- Used advanced encryption standard
- Chat history stored only in browser session
- WebSocket-based relay servers

# The Flow
- Page where user sets relay address, chat room name and chat password
- Chat window with message input, submit button, chat log and system info

---

#### TODO:
- Open a relay
- Initialize session
- Connect to existing session
- Download the history locally
- List of available relays
- Set custom rules for the room
- Ensure users that running relays uses identical codebase (checksum?)
- Show list of relays that are available

#### Links
- https://github.com/bradyjoslin/webcrypto-example

#### Various
- Short-lived client side encrypted chat sessions