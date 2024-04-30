import express from "express";
import { AccessToken } from "livekit-server-sdk";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const rooms = [];

const createToken = async (roomName, participantName) => {
  const option = {
    identity: participantName,
    ttl: "10m",
  };

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    option
  );
  at.addGrant({ roomJoin: true, room: roomName });

  return await at.toJwt();
};

app.post("/getToken", async (req, res) => {
  const roomName = req.body.room_name;
  const participantName = req.body.participant_name;

  console.log(roomName);
  console.log(participantName);

  if (Object.keys(rooms).includes(roomName)) {
    return res.json("room already exists");
  }

  if (rooms[roomName] && rooms[roomName].includes(participantName)) {
    return res.json("participant already exists");
  }

  res.send(await createToken(roomName, participantName));
});

app.listen(process.env.PORT, () =>
  console.log(`Server is running on ${process.env.PORT} port!`)
);
