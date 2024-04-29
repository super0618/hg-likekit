import express from "express";
import { AccessToken } from "livekit-server-sdk";
import cors from "cors";
import "dotenv/config";

const app = express();
app.use(cors());

let id = 0;

const createToken = async () => {
	const roomName = "my-sip-room";
	const participantName = `user-${id++}`;
	const option = {
		identity: participantName,
		ttl: "10m",
	};

	const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, option);
	at.addGrant({ roomJoin: true, room: roomName });

	return await at.toJwt();
};

app.get("/getToken", async (req, res) => {
	res.send(await createToken());
});

app.listen(process.env.PORT, () => console.log("Server started!"));
