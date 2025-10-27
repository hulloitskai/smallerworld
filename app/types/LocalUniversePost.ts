import {
  type LocalUniverseAuthorPost,
  type LocalUniverseFriendPost,
  type LocalUniversePublicPost,
} from "./generated";

type LocalUniversePost =
  | LocalUniverseFriendPost
  | LocalUniverseAuthorPost
  | LocalUniversePublicPost;

export default LocalUniversePost;
