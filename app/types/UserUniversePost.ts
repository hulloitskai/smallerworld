import {
  type UserUniverseAuthorPost,
  type UserUniverseFriendPost,
  type UserUniversePublicPost,
} from "./generated";

type UserUniversePost =
  | UserUniverseFriendPost
  | UserUniverseAuthorPost
  | UserUniversePublicPost;

export default UserUniversePost;
