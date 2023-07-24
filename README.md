# The idea
Create a private chat for snap communication, with no stored
history. Encryption is made client side and the password is 
known only by the users from both sides of the channel. Every 
chat has it's opened relay that only transmit messages. When 
client is closed the history goes away. When both sides of the 
chat are closed, the relay closes too. Nobody knows what is 
transmitted, except the participants.

---

#### TODO:
- Open a relay and obtain password
- Make UI that asks user to create chat or to connect to existing one