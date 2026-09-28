import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  getPlaylists,
  createPlaylist,
  addItemToPlaylist,
  deletePlaylist,
} from "../controllers/playlistController";

const router = Router();

router.use(authMiddleware);

router.get("/", getPlaylists);
router.post("/", createPlaylist);
router.post("/:id/items", addItemToPlaylist);
router.delete("/:id", deletePlaylist);

export default router;
