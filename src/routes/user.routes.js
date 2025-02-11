import { Router } from "express";
import { registerUser, loginUser, logOutUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import{verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post( 
    upload.fields([
        {
            name: "avater",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);

//login route
router.route("/login").post(loginUser);

//secured route
router.route("/logout").post(verifyJWT, logOutUser);


export default router;
