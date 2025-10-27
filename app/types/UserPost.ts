import { type UserFriendPost, type UserPublicPost } from "./generated";

type UserPost = UserFriendPost | UserPublicPost;

export default UserPost;
