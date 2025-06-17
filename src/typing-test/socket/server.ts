



import { Server as SocketIOServer, Socket } from "socket.io";
import { LobbyModel, Player } from "../models/lobby.models"; // Ensure this path is correct
import { redisClient } from "../../redis-database";

// Generate unique 6-digit lobby code
const generatecode = (): string =>
  Math.random().toString(36).substring(2, 8).toUpperCase();

const GAME_TICK_MS = 1000

export const initializeTypingTestSocket = (io: SocketIOServer) => {
  io.of("/typing-test").on("connection", (socket: Socket) => {
    console.log(`\nA user connected to typing-test namespace: ${socket.id}\n`);

    // ADD THIS: Generic catch-all for testing
    socket.onAny((eventName, ...args) => {
    //    console.log(`\n[BACKEND /typing-test] Socket ID ${socket.id} received event: "${eventName}" with args: ${args} \n`);
    });

    // Create lobby
    socket.on("createLobby", async (data: { playerName: string, timeLimit: number, wordCount: number }) => {
      const code = generatecode();
    //   console.log("here's my data: ", data)
    //   console.log(code, data.playerName, socket.id);
      try {
        const newLobby = new LobbyModel({
          code: code,
          timeLimit: data.timeLimit,
          wordCount: data.wordCount,
          players: [{ id: socket.id, name: data.playerName, progress: 0 }],
          words: [],
          isActive: false,
        });
        await newLobby.save();
        socket.join(code);
        socket.emit("lobbyCreated", newLobby);
        console.log(`\nLobby created with code: ${code} by player: ${data.playerName} (socket: ${socket.id})\n`);
      } catch (error) {
        console.error("Error creating lobby:", error);
        socket.emit("lobbyError", "Failed to create lobby.");
      }
    });

    // Join lobby
    socket.on("joinLobby", async (data: { code: string; playerName: string }) => {
        
      try {
        const lobby = await LobbyModel.findOne({
          code: data.code
        });

        if (!lobby) {
          return socket.emit("lobbyError", "Invalid lobby code.");
        }
        if (lobby.isActive) {
            return socket.emit("lobbyError", "Game has already started in this lobby.");
        }
        if (lobby.players.length >= 8) {
          return socket.emit("lobbyError", "Lobby is full.");
        }
        if (lobby.players.find(p => p.name === data.playerName)) {
            return socket.emit("lobbyError", "Player name already taken in this lobby.");
        }


        lobby.players.push({ id: socket.id, name: data.playerName, isReady: false, cursorIndex: 0, correctCharacters: 0, totalTypedCharacters: 0, lastUpdate: Date.now() });
        await lobby.save();

        socket.join(data.code);
        console.log(`\n[JOIN LOBBY] Socket ${socket.id} successfully executed socket.join("${data.code}")\n`);


        // Set socket.data here if you plan to use it in startGame
        socket.data.id = socket.id;
        socket.data.playerName = data.playerName;
        socket.data.isReady = false; // Initial ready state
        console.log(`\n[JOIN LOBBY] Set socket.data for ${socket.id}:`, socket.data);

        // Emit to all in lobby (including sender) that a new player joined
        io.of("/typing-test").to(data.code).emit("playerJoined", { playerName: data.playerName, socketId: socket.id, players: lobby.players });
        socket.emit("joinedLobby", { code: data.code, players: lobby.players, words: lobby.words, isActive: lobby.isActive }); // Send current lobby state to joined player
        console.log(`\n[JOIN LOBBY] Player ${data.playerName} (socket: ${socket.id}) fully processed join for lobby: ${data.code}\n`);
    } catch (error) {
        console.error("Error joining lobby:", error);
        socket.emit("lobbyError", "Failed to join lobby.");
      }
    });

    // Player ready up
    socket.on("readyUp", async (data: { code: string; playerName: string, isReady: true }) => {
            try {
              const lobby = await LobbyModel.findOne({
                code: data.code
              });

              if (!lobby) {
                return socket.emit("lobbyError", "Invalid lobby code.");
              }
              if (lobby.isActive) {
                  return socket.emit("lobbyError", "Game has already started in this lobby. Cannot change ready status.");
              }

              // The 'Lobby is full' check (lobby.players.length >= 8) from the original code
              // is less relevant here. This event is for an existing player changing their status.
              // If the player is found (checked next), they are already in the lobby.
              // If they are not found, that's handled appropriately.
              // Thus, this check is omitted for clarity in this specific event handler.

              const specificPlayer = lobby.players.find(p => p.name === data.playerName && p.id === socket.id);

              if (!specificPlayer) {
                  // Player not found with the provided name matching the current socket's session in this lobby.
                  return socket.emit("lobbyError", "Player not found or name mismatch. Ensure you are in the lobby with the correct name.");
              } else {
                  // data.isReady is guaranteed to be true by the type definition { isReady: true }.
                  specificPlayer.isReady = data.isReady;
              }

              await lobby.save();

              // Emit to all players in the lobby that this player's ready status has changed.
              io.of("/typing-test").to(data.code).emit("playerReadyStatusUpdate", { // Consider a more descriptive event name
                playerId: specificPlayer.id,       // Use ID from the authoritative player object
                playerName: specificPlayer.name,   // Use name from the authoritative player object
                isReady: specificPlayer.isReady,   // Explicitly send the new ready state
                players: lobby.players             // Send the updated list of all players
              });

              // Send a confirmation back to the player who initiated the ready-up.
              socket.emit("selfReadyStatusConfirmed", { // Consider a more descriptive event name
                code: data.code,
                timeLimit: lobby.timeLimit,
                wordCount: lobby.wordCount,
                // yourPlayerId: specificPlayer.id,
                // yourReadyStatus: specificPlayer.isReady,
                players: lobby.players // Sending the updated player list ensures client consistency
                // words: lobby.words, // Not relevant at this stage before game start
                // isActive: lobby.isActive // Known to be false at this point, not needed
              });

              console.log(`\nPlayer ${specificPlayer.name} (socket: ${socket.id}) in lobby ${data.code} is now ready: ${specificPlayer.isReady}.\n`);
            } catch (error) {
              console.error(`Error during 'readyUp' for player ${data.playerName} (socket: ${socket.id}) in lobby ${data.code}:`, error);
              socket.emit("lobbyError", "Failed to update ready status. Please try again.");
            }
    });
    // Start game
    socket.on("startGame", async (data: { code: string, timeLimit: number, wordCount: number }) => {
      try {
        const lobbyKey = `lobby:${data.code}`;
        const lobby = await LobbyModel.findOne({ code: data.code });

        const countdownStartDelay = 3000; // ms
        const countdownStartTime = Date.now() + countdownStartDelay; 

        if (!lobby) {
          return socket.emit("lobbyError", "Lobby not found.");
        }

        if (lobby.players.some(p => !p.isReady)) {
            return socket.emit("lobbyError", "All players must rewady up before game can start.");
        }
        // Optional: Check if the person starting the game is the host or if enough players
        // For now, any player in the lobby can start.

        const wordList: string[] = [
            "ability", "able", "about", "above", "accept", "across", "act", "action",
            "add", "adult", "affect", "after", "again", "age", "agency", "agent", "ago", "agree", "ahead", "air", "all",
            "allow", "almost", "alone", "along", "also", "always", "among",
            "amount", "and", "animal", "answer", "any", "anyone", "appear",
            "apply", "area", "argue", "arm", "around", "arrive", "art", "artist", "as",
            "ask", "assume", "at", "attack", "author",
            "avoid", "away", "baby", "back", "bad", "bag", "ball", "bank", "bar", "base", "be",
            "beat", "become", "bed", "before", "begin", "behind",
            "belief", "best", "better", "beyond", "big", "bill", "bit", "black", "blood",
            "blue", "board", "body", "book", "born", "both", "box", "boy", "break", "bring",
            "build", "but", "buy", "by", "call", "camera", "can", "cancer",
            "car", "card", "care", "career", "carry", "case", "catch", "cause", "cell",
            "center", "chair", "chance", "change",
            "charge", "check", "child", "choice", "choose", "church", "city", "civil",
            "claim", "class", "clear", "close", "coach", "cold", "color",
            "come", "common", "cost", "could", "couple", "course", "court", "cover", "create", "crime",
            "cup", "dark", "data", "day", "dead", "deal",
            "death", "debate", "decade", "decide", "deep",
            "degree",
            "design", "detail", "die", "dinner", "do", "doctor", "dog", "door", "down", "draw", "dream", "drive",
            "drop", "drug", "during", "each", "early", "east", "easy", "eat", "edge",
            "effect", "effort", "eight", "either", "else", "end", "energy",
            "enjoy", "enough", "enter", "entire", "even", "event", "ever", "every",
            "eye",
            "face", "fact", "factor", "fail", "fall", "family", "far", "fast", "father", "fear",
            "feel", "few", "field", "fight", "figure", "fill", "film", "final",
            "find", "fine", "finger", "finish", "fire", "firm", "first", "fish", "five", "floor", "fly", "focus",
            "follow", "food", "foot", "for", "force", "forget", "form", "former", "four",
            "free", "friend", "from", "front", "full", "fund", "future", "game", "garden", "gas",
            "get", "girl", "give", "glass", "go", "goal", "good", "great", "green",
            "ground", "group", "grow", "growth", "guess", "gun", "guy", "hair", "half", "hand", "hang", "happen",
            "happy", "hard", "have", "he", "head", "health", "hear", "heart", "heat", "heavy", "help", "her",
            "here", "high", "him", "his", "hit", "hold", "home", "hope",
            "hot", "hotel", "hour", "house", "how", "huge", "human",
            "idea", "if", "image", "impact", "in",
            "indeed", "inside",
            "into",
            "issue", "it", "item", "its", "itself", "job", "join", "just", "keep", "key",
            "kid", "kill", "kind", "know", "land", "large", "last", "late",
            "later", "laugh", "law", "lawyer", "lay", "lead", "leader", "learn", "least", "leave", "left", "leg",
            "legal", "less", "let", "level", "lie", "life", "light", "like", "likely", "line", "list",
            "listen", "little", "live", "local", "long", "look", "lose", "loss", "lot", "love", "low",
            "main", "major", "make", "man", "manage",
            "many", "market", "matter", "may", "maybe", "me", "mean", "media",
            "meet", "member", "memory", "method", "middle", "might",
            "mind", "minute", "miss", "model", "modern", "moment", "money",
            "month", "more", "most", "mother", "mouth", "move", "movie", "Mr", "Mrs",
            "much", "music", "must", "my", "myself", "name", "nation", "nature", "near",
            "nearly", "need", "never", "new", "news", "next", "nice",
            "night", "no", "none", "nor", "north", "not", "note", "notice", "now", "number",
            "occur", "of", "off", "offer", "office", "often", "oh", "oil", "ok", "old",
            "on", "once", "one", "only", "onto", "open", "option", "or", "order",
            "other", "others", "our", "out", "over", "own", "owner", "page", "pain",
            "paper", "parent", "part", "party",
            "pass", "past", "pay", "peace", "people", "per",
            "period", "person", "phone", "pick", "piece", "place",
            "plan", "plant", "play", "player", "point", "police", "policy", "poor",
            "power",
            "pretty", "price",
            "prove", "public", "pull", "push", "put",
            "race", "radio", "raise", "range", "rate", "rather", "reach", "read",
            "ready", "real", "really", "reason", "recent",
            "record", "red", "reduce", "region", "relate",
            "remain", "remove", "report", "rest", "result", "return", "reveal", "rich",
            "right", "rise", "risk", "road", "rock", "role", "room", "rule", "run", "safe", "same", "save", "say",
            "scene", "school", "score", "sea", "season", "seat", "second",
            "see", "seek", "seem", "sell", "send", "senior", "sense", "series", "serve",
            "set", "seven", "sex", "sexual", "shake", "share", "she", "shoot", "short",
            "shot", "should", "show", "side", "sign", "simple", "simply",
            "since", "sing", "single", "sister", "sit", "site", "six", "size", "skill", "skin",
            "small", "smile", "so", "social", "some",
            "son", "song", "soon", "sort", "sound", "source", "south", "space", "speak",
            "speech", "spend", "sport", "spring", "staff", "stage", "stand", "star", "start", "state", "stay", "step", "still", "stock", "stop", "store",
            "story", "street", "strong", "study", "stuff", "style",
            "such", "suffer", "summer", "sure",
            "system", "table", "take", "talk", "task", "tax", "teach", "team",
            "tell", "ten", "tend", "term", "test", "than", "thank", "that", "the", "their", "them",
            "then", "theory", "there", "these", "they", "thing", "think", "third", "this", "those",
            "though", "threat", "three", "throw", "thus", "time",
            "to", "today", "too", "top", "total", "tough", "toward", "town", "trade",
            "travel", "treat", "tree", "trial", "trip", "true",
            "truth", "try", "turn", "two", "type", "under", "unit", "until", "up", "upon",
            "us", "use", "value", "very", "victim", "view", "visit", "voice",
            "vote", "wait", "walk", "wall", "want", "war", "watch", "water", "way", "we", "weapon", "wear", "week",
            "weight", "well", "west", "what", "when", "where", "which", "while",
            "white", "who", "whole", "whom", "whose", "why", "wide", "wife", "will", "win", "wind",
            "wish", "with", "within", "woman", "wonder", "word", "work", "worker", "world", "worry",
            "would", "write", "wrong", "yard", "yeah", "year", "yes", "yet", "you", "young", "your"
            // Add more words as needed
        ].filter(word => word !== word.toUpperCase() || word.toLowerCase() === word.toUpperCase());

        lobby.words = Array(data.wordCount)
          .fill(0)
          .map(() => wordList[Math.floor(Math.random() * wordList.length)]);
        lobby.isActive = true;

        lobby.players.forEach(player => {
            player.cursorIndex = 0;
            player.correctCharacters = 0;
            player.totalTypedCharacters = 0;
            player.lastUpdate = Date.now();
        });

        await lobby.save();


        // // Get current lobby players from memory or another Redis key
        // const lobbyStructure = {
        //     words: lobby.words,
        //     players: lobby.players, // initialize progress per player
        //     code: data.code,
        //     timeLimit: data.timeLimit,
        //     countdownStartTime: countdownStartTime
        // };


        // Prepare the structure for Redis, using the updated lobby.players
        const lobbyStructureForRedis = {
            words: lobby.words,
            players: lobby.players.map(p => ({ // Create a clean representation for Redis
                id: p.id,
                name: p.name,
                isReady: p.isReady,
                // progress: p.progress, // Initial progress (0)
                cursorIndex: p.cursorIndex,
                correctCharacters: p.correctCharacters,
                totalTypedCharacters: p.totalTypedCharacters,
                lastUpdate: p.lastUpdate
            })),
            code: data.code,
            timeLimit: data.timeLimit,
            countdownStartTime: countdownStartTime,
            isActive: lobby.isActive // Store active state
        };

        console.log(`\nLobby structure for ${data.code} prepared for Redis:`, lobbyStructureForRedis);

        await redisClient.set(lobbyKey, JSON.stringify(lobbyStructureForRedis));
        console.log(`\nLobby structure for ${data.code} saved to Redis.`);

        // const connectedSockets = await io.of('/typing-test').in(data.code).fetchSockets();
        // console.log(`\nConnected sockets in lobby ${data.code}: ${connectedSockets.map(s => s.id)}\n`);
        // connectedSockets.forEach((s) => {
        //   const playerId = s.data?.id; // Attach playerId on join

        //   console.log(`\nSome kind of playerid: ${s.data}\n`);
        //   if (playerId) {
        //     lobbyStructure.players[playerId] = {
        //       id: s.id,
        //       name: s.data?.playerName || "Unknown Player",
        //       isReady: s.data.isReady,
        //       cursorIndex: 0,
        //       correctCharacters: 0,
        //       totalTypedCharacters: 0,
        //       lastUpdate: Date.now()
        //     };
        //   }
        // });

        // await redisClient.set(lobbyKey, JSON.stringify(lobbyStructure));

        io.of("/typing-test").to(data.code).emit("gameStarted", { words: lobby.words, players: lobby.players, code: data.code, timeLimit: data.timeLimit, countdownStartTime: countdownStartTime });


        console.log(`\nGame started in lobby: ${data.code}\n`);

        setTimeout(() => {
            startGameLoop(data.code); // Start the game loop for this lobby
        }, 6000)
        
      } catch (error) {
        console.error("Error starting game:", error);
        socket.emit("lobbyError", "Failed to start game.");
      }
    });

    // Update player progress
    socket.on("updateProgress", async (data: { code: string; id: string, playerName: string, cursorIndex: number, correctCharacters: number, totalTypedCharacters: number }) => {
      try {
        const key = `lobby:${data.code}`;
        const lobbyData = await redisClient.get(key);

        if (!lobbyData){
            console.warn(`[updateProgress] Lobby data not found in Redis for key: ${key}. Socket ID: ${socket.id}`);
            return;
        } ;

        let lobby;
        try {
            lobby = JSON.parse(lobbyData);
        }
        catch (parseError) {
            console.error(`[updateProgress] Error parsing lobby data from Redis for key: ${key}. Data: ${lobbyData}`, parseError);
            return; // Cannot proceed if data is corrupted
        }

        if (!lobby || !lobby.players || !Array.isArray(lobby.players)) {
            console.error(`[updateProgress] Parsed lobby data is invalid or missing players array for key: ${key}. Lobby:`, lobby);
            return;
        }

        const playerIndex = lobby.players.findIndex((p: Player) => p.id === data.id); // data.id is the player's socket ID

        if (playerIndex !== -1) {
            // Player found, update their details
            lobby.players[playerIndex] = {
              ...lobby.players[playerIndex], // Preserve existing fields like name, isReady
              id: data.id, // Ensure id is present
              name: lobby.players[playerIndex].name || data.playerName, // Prefer existing name
              cursorIndex: data.cursorIndex,
              correctCharacters: data.correctCharacters,
              totalTypedCharacters: data.totalTypedCharacters,
              lastUpdate: Date.now()
              // Note: WPM and accuracy are typically calculated in the game loop or on client,
              // but if you want to store them here, you can.
            };
        
            await redisClient.set(key, JSON.stringify(lobby));
            console.log(`\n[updateProgress] Updated player ${data.id} in lobby ${data.code}\n`);

            // Optional: Emit an immediate progress update if desired for more real-time feedback
            // This is different from the game loop's leaderboard update.
            io.of("/typing-test").to(data.code).emit("individualProgressUpdate", {
              id: data.id,
              playerName: lobby.players[playerIndex].name,
              cursorIndex: data.cursorIndex,
              // Potentially WPM/accuracy if calculated here
            });

          } else {
            console.warn(`[updateProgress] Player with ID ${data.id} not found in lobby ${data.code}. Players in Redis:`, lobby.players.map((p:Player) => p.id));
          }

        // if (lobby.players[data.id]) {
        //     lobby.players[data.id] = {
        //       ...lobby.players[data.id],
        //       cursorIndex: data.cursorIndex,
        //       correctCharacters: data.correctCharacters,
        //       totalTypedCharacters: data.totalTypedCharacters,
        //       lastUpdate: Date.now()
        //     };
        
        //     await redisClient.set(key, JSON.stringify(lobby));
        //   }


        // if (!lobby) return; // Lobby might have been deleted

        // const player = lobby.players.find((p) => p.id === socket.id);
        // if (player) {
        // //   player.progress = data.progress;
        //   await lobby.save();

        //   io.of("/typing-test").to(data.code).emit("progressUpdate", {
        //     playerId: socket.id,
        //     playerName: player.name,
        //     progress: data.progress,
        //   });

        //   // Check for game end condition
        //   if (data.progress === 100) { // Assuming progress is percentage
        //     io.of("/typing-test").to(data.code).emit("playerFinished", { playerId: socket.id, playerName: player.name });
        //     // Further logic for when all players finish or game ends
        //   }
        // }
      } catch (error) {
        console.error("Error updating progress:", error);
        // Potentially emit an error back to the specific socket if needed
      }
    });

    // Handle disconnects
    socket.on("disconnect", async () => {
      console.log(`\nUser disconnected from typing-test: ${socket.id}\n`);
      try {
        // Find which lobby this player was in
        const lobby = await LobbyModel.findOne({ "players.id": socket.id });
        if (!lobby) return;

        const playerIndex = lobby.players.findIndex((p) => p.id === socket.id);
        if (playerIndex === -1) return;

        const playerName = lobby.players[playerIndex].name;
        lobby.players.splice(playerIndex, 1); // Remove player

        if (lobby.players.length === 0) {
          await LobbyModel.deleteOne({ _id: lobby._id });
          console.log(`\nLobby ${lobby.code} deleted as it became empty.\n`);
        } else {
          await lobby.save();
          io.of("/typing-test").to(lobby.code).emit("playerLeft", { playerId: socket.id, playerName, currentPlayers: lobby.players });
          console.log(`\nPlayer ${playerName} (socket: ${socket.id}) left lobby ${lobby.code}. Remaining players: ${lobby.players.length}\n`);
        }
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    });
  });

const activeGameLoops = new Map<string, NodeJS.Timeout>();

function startGameLoop(code: string) {
    const intervalId = setInterval(async () => {
     try{
        const key = `lobby:${code}`;
      const lobbyData = await redisClient.get(key);
      if (!lobbyData) {
        console.warn(`[startGameLoop] Lobby data not found in Redis for key: ${key}. Stopping loop.`);
        clearInterval(intervalId);
        activeGameLoops.delete(code);
        return;
      }
  
      let lobby;
      try {
          lobby = JSON.parse(lobbyData);
      } 
      catch (parseError) {
          console.error(`[startGameLoop] Error parsing lobby data from Redis for key: ${key}. Data: ${lobbyData}`, parseError);
          // Decide if to stop the loop or try again next tick
          // clearInterval(intervalId); 
          // activeGameLoops.delete(code);
          return; 
      }


      if (!lobby || !lobby.players || !Array.isArray(lobby.players) || typeof lobby.countdownStartTime === 'undefined' || typeof lobby.timeLimit === 'undefined') {
        console.error(`[startGameLoop] Parsed lobby data is invalid or missing critical fields for key: ${key}. Lobby:`, lobby, "Stopping loop.");
        clearInterval(intervalId);
        activeGameLoops.delete(code);
        return;
      }

      const now = Date.now();
      const gameActualStartTime = lobby.countdownStartTime + 3000; // 3s for countdown display itself

      if (now < gameActualStartTime) {
        // Game hasn't officially started yet (still in countdown phase after the initial delay)
        console.log(`[startGameLoop] Lobby ${code} in countdown. Time remaining: ${Math.round((gameActualStartTime - now)/1000)}s`);
        // You could emit a countdown tick here if desired:
        // io.of("/typing-test").to(code).emit('countdownTick', { timeLeft: Math.round((gameActualStartTime - now)/1000) });
        return; 
    }

      const elapsed = Math.floor((now - gameActualStartTime) / 1000);
  
      // Check for game end
      if (elapsed >= lobby.timeLimit) {
        console.log(`\n[startGameLoop] Game time ended for lobby: ${code}. Elapsed: ${elapsed}, Limit: ${lobby.timeLimit}\n`);
        clearInterval(intervalId);
        activeGameLoops.delete(code);
        io.of("/typing-test").to(code).emit('gameEnded', { message: "Time's up!", players: lobby.players /* final state */ });
        return;
      }
  
      // Compute leaderboard
      const leaderboard = lobby.players.map((player: Player) => { // Use Player type
        // Ensure elapsedSecondsForWPM is at least a very small number to avoid div by zero if game just started
        const elapsedSecondsForWPM = Math.max(elapsed, 1); // Use at least 1 second for WPM calc
        const timeMins = elapsedSecondsForWPM / 60;
        
        const wpm = Math.round((player.correctCharacters / 5) / timeMins);
        const accuracy = player.totalTypedCharacters > 0 ? Math.round((player.correctCharacters / player.totalTypedCharacters) * 100) : 0;
  
        return {
          id: player.id, // Use 'id' consistently
          name: player.name, // Use 'name' consistently
          cursorIndex: player.cursorIndex,
          wpm,
          accuracy,
        };
      });
  
      // Sort leaderboard
      leaderboard.sort((a: any, b: any) => b.cursorIndex - a.cursorIndex || b.wpm - a.wpm); // Primary sort by cursor, secondary by WPM

      console.log(`leaderboard for ${code}:  ${JSON.stringify(leaderboard, null, 2)}`)
  
      // Emit to clients
     io.of("/typing-test").to(code).emit('leaderboard-update', { leaderboard, timeLeft: lobby.timeLimit - elapsed });
     }
     catch(error){
        console.error(`[startGameLoop] Unexpected error in game loop for lobby ${code}:`, error);
     }

  
    }, GAME_TICK_MS);

    activeGameLoops.set(code, intervalId); // Store the interval ID

  }
};


