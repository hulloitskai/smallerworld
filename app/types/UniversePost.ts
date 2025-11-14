import {
  type UniverseAuthorPost,
  type UniverseFriendPost,
  type UniversePublicPost,
} from "./generated";

type UniversePost =
  | UniverseFriendPost
  | UniverseAuthorPost
  | UniversePublicPost;

export default UniversePost;
