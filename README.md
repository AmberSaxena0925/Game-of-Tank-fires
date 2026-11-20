# IRONCLAD ARENA

A top-down 3v3 tank battle built with HTML5 Canvas. Play against bots or join an online match with friends and other players in the Steel Yard.

## How to run

Install the server dependency once and start the game and online room server:

```powershell
npm install
npm start
```

Then visit `http://localhost:8080`. Keep the server process running while playing. The online options require this server; the AI quick match can still be used without connecting to a room.

For internet play, deploy this Node server to a public host and open the game at that host's URL. Players need to connect to the same server. Set `PORT` in the hosting environment if required.

## Controls

- WASD: drive and steer
- Mouse: aim the turret
- Hold left mouse button: fire
- Space or Shift: handbrake drift
- 1 / 2 / 3: standard, homing, and heavy explosive rockets
- Fullscreen button: expand the battlefield to fill the display; press Escape or select Exit Fullscreen to return
- Exit Match button: leave the current battle and return to the lobby; online matches also leave their room
- Enter your callsign before deploying or joining an online match
- After deploying, the battlefield takes keyboard focus; click it again to resume controls if you switch to another browser control

## Online matches

- Create a private room and share its six-character code, or join a friend's code
- Find a public match for 1v1, 2v2, 3v3, 2v3, or 1v3
- Survival mode is free-for-all, with configurable private/public room sizes from 2 to 12 players; last tank standing wins
- Team Deathmatch adds respawning team combat; eliminations add to the team score and the higher score wins when the match timer expires
- Choose a 5, 10, or 15 minute match, or play without a time limit
- Timed matches award the win to the team with the greater surviving-tank ratio when time expires; remaining health breaks a tie
- Private room hosts can start with available players; empty tanks are filled by bots
- Public matchmaking starts when the selected player count is filled
- Remote human tanks, movement, health, and rocket launches are synchronized through the room server

## Match features

- Quick Match and Practice modes; Easy, Medium, and Hard bot settings
- Optional guided training tutorial teaches driving, drifting, aiming, and all three rocket types in a safe practice match
- Select the Steel Yard or colorful Greenwood Forest arena; raised-looking arena edges, depth-sorted cover, shaded walls and crates, and lit tank models add a 2.5D look. Forest grass hides tanks from line of sight while stone cover blocks movement and rockets
- Two AI wingmen, three tactical enemy tanks, health bars, team counts, match timer, and minimap
- Difficulty-scaled bots flank, seek solid cover, reposition for clear shots, and lead moving targets
- Walls and barriers block rockets and line of sight; crates can be destroyed
- Team-shared vision with previously explored areas remaining darkened
- Rocket trails, impact blasts, splash damage, smoke, drift dust, synthesized weapon/explosion sound effects, and optional screen shake
- Team elimination and time-limit victory/draw screens, plus weapon ammunition/reload indicators
