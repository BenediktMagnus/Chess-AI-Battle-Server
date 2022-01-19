# Player Message Protocol (PMP)

Documentation of the message system used for communcation between the server and the players.

## Definitions

Server: The server that is running the game. \
Player: A player in the game, i.e. a client that is connected to the server. \
Segment: TCP/IP segment.

### Data types

Char: A single ASCII character. \
String: A sequence of multiple chars. \
Column: One of the following chars: 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h' \
Row: One of the following chars: '1', '2', '3', '4', '5', '6', '7', '8' \
Position: Column and field, concenated with no separator, e.g. 'a1' \
Promotion: One of the following chars: 'b' (bishop), 'n' (knight), 'q' (queen), 'r' (rook) \
Colour: One of the following chars: 'b' (black), 'w' (white)

## Connection

All players are connected with the server only. The connection is TCP/IP based.

## Form

All messages are strings. A message is terminated with the newline character "\n". \
A message can be split up into multiple segments. Multiple messages can be sent in a single segment.

## Parts

A message contains two parts: command and data. \
The command part is always the first part of the message. It is of type char and must be one of the allowed commands. \
The data part follows the command and contains zero or more elements. The composition of the data part is command-dependent. \
There are no seperators between the command and data part.

## Allowed Commands

There are two types of commands: Player to server and server to player commands. \
Only the player is allowed to send player to server commands. \
Only the server is allowed to send server to player commands.

### Player to server commands

**Name**: \
Command: n \
Data: name (string) \
Description: Set the player name. \
Note: Should be sent before any other command right after the connection has been established. \
Response: None

**Turn**: \
Command: t \
Data: from (position), to (position), promotion (promotion, optional) \
Description: Make a turn. \
Response: InvalidMove, Timeout, Turn, Check, Won, Lost, Draw or Stalemate

### Server to player commands

**InvalidMove**: \
Command: i \
Data: -\
Description: The player's last turn contained an invalid move. The player loses the game. The game ended. \
Response: None

**Timeout**: \
Command: o \
Data: -\
Description: The player's last turn has been received after the turn time has expired. The player loses the game. The game ended. \
Response: None

**Turn**: \
Command: t \
Data: from (position), to (position), promotion (promotion, optional) \
Description: A turn has been made, resulting in no special position. \
Response: Turn

**Check**: \
Command: c \
Data: from (position), to (position), promotion (promotion, optional) \
Description: A turn has been made, resulting in a check for the player. \
Response: Turn

**Won**: \
Command: w \
Data: \
Description: The player has won the game. The game ended. \
Response: None

**Lost**: \
Command: l \
Data: from (position), to (position), promotion (promotion, optional) \
Description: A turn has been made, resulting in the player loosing the game. The game ended. \
Response: None

**Draw**: \
Command: d \
Data: from (position), to (position), promotion (promotion, optional) \
Description: A turn has been made, resulting in a draw.  The game ended. \
Note: The player that made the last turn will receive no data in this message. \
Response: None

**Stalemate**: \
Command: s \
Data: from (position), to (position), promotion (promotion, optional) \
Description: A turn has been made, resulting in a stalemate. The game ended. \
Note: The player that made the last turn will receive no data in this message. \
Response: None

**NewGame**: \
Command: n \
Data: colour (colour) \
Description: A new game has been started. The data contains the player's colour for this game. \
Response: Turn if the player's colour is white, none otherwise

**End**: \
Command: e \
Data: \
Description: All rounds have been played. No new game will be started. \
Response: None
