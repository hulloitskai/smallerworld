import { type Editor } from "@tiptap/react";
import { map } from "lodash-es";
import { DateTime } from "luxon";
import { useMemo, useRef, useState } from "react";

import ProfileIcon from "~icons/heroicons/user-circle-20-solid";

import { postTypeHasTitle, spacePostDraftKey } from "~/helpers/posts";
import { usePostDraftFormValues } from "~/helpers/posts/drafts";
import { htmlHasText } from "~/helpers/richText";
import { mutateSpacePosts } from "~/helpers/spaces";
import {
  parseSpotifyTrackId,
  validateSpotifyTrackUrl,
} from "~/helpers/spotify";
import { currentTimeZone } from "~/helpers/time";
import { type Post, type PostPrompt, type PostType } from "~/types";

import LoginForm from "./LoginForm";
import SpacePostFormBody, {
  type SpacePostFormValues,
} from "./SpacePostFormBody";

export interface NewSpacePostFormProps extends Omit<BoxProps, "children"> {
  spaceId: string;
  postType: PostType;
  prompt?: PostPrompt;
  onPostCreated?: (post: Post) => void;
}

interface NewSpacePostFormValues extends SpacePostFormValues {}

interface NewSpacePostSubmission {
  post: {
    type: PostType;
    emoji: string | null;
    title: string | null;
    body_html: string;
    images: string[];
    pinned_until: string | null;
    spotify_track_id: string | null;
    quoted_post_id: string | null;
    prompt_id: string | null;
  };
}

const NewSpacePostForm: FC<NewSpacePostFormProps> = ({
  spaceId,
  postType,
  prompt,
  onPostCreated,
  ...otherProps
}) => {
  const currentUser = useCurrentUser();

  // == Editor ref for draft restoration
  const editorRef = useRef<Editor | null>(null);

  // == Draft values
  const [draftValues, saveDraftValues, clearDraft] =
    usePostDraftFormValues<SpacePostFormValues>({
      postType,
      localStorageKey: spacePostDraftKey(spaceId),
    });

  const initialValues = useMemo<NewSpacePostFormValues>(
    () => ({
      title: "",
      body_html: "",
      emoji: "",
      images_uploads: [],
      pinned_until: null,
      spotify_track_url: "",
      pen_name: "",
    }),
    [],
  );

  const form = useForm<
    { post: Post },
    NewSpacePostFormValues,
    (values: NewSpacePostFormValues) => NewSpacePostSubmission
  >({
    action: routes.spacePosts.create,
    params: { space_id: spaceId },
    descriptor: "create post",
    initialValues,
    validate: {
      spotify_track_url: validateSpotifyTrackUrl,
    },
    transformValues: ({
      emoji,
      title,
      images_uploads,
      pinned_until,
      spotify_track_url,
      pen_name,
      ...values
    }) => ({
      post: {
        ...values,
        type: postType,
        emoji: emoji || null,
        title: postTypeHasTitle(postType) ? title || null : null,
        spotify_track_url: spotify_track_url || null,
        images: map(images_uploads, "signedId"),
        pinned_until: pinned_until ? formatPinnedUntil(pinned_until) : null,
        spotify_track_id: spotify_track_url
          ? parseSpotifyTrackId(spotify_track_url)
          : null,
        prompt_id: prompt?.id ?? null,
        quoted_post_id: null,
        pen_name: pen_name || null,
      },
    }),
    transformErrors: ({ image, spotify_track_id, ...errors }) => ({
      ...errors,
      image_upload: image,
      spotify_track_url: spotify_track_id,
    }),
    onValuesChange: values => {
      if (form.isTouched()) {
        shouldRestoreDraftRef.current = false;
        saveDraftValues(values);
      }
    },
    onSuccess: ({ post }) => {
      clearDraft();
      void mutateSpacePosts(spaceId);
      onPostCreated?.(post);
    },
  });
  const { initialize, setValues, submit } = form;
  useDidUpdate(() => {
    initialize(initialValues);
  }, [initialValues]); // eslint-disable-line react-hooks/exhaustive-deps

  // == Draft restoration
  const shouldRestoreDraftRef = useRef(true);
  useDidUpdate(() => {
    if (draftValues && shouldRestoreDraftRef.current) {
      shouldRestoreDraftRef.current = false;
      setValues(draftValues);
      const editor = editorRef.current;
      if (editor) {
        editor.commands.setContent(draftValues.body_html);
      }
    }
  }, [draftValues]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box
      component="form"
      onSubmit={event => {
        if (currentUser) {
          return submit(event);
        }
        event.preventDefault();
        const modalId = randomId();
        openModal({
          modalId,
          title: "sign in to continue",
          children: (
            <LoginOrRegisterForm
              onRegisteredAndSignedIn={() => {
                closeModal(modalId);
                submit(event);
              }}
            />
          ),
        });
      }}
      {...otherProps}
    >
      <SpacePostFormBody
        {...{ form, postType, prompt }}
        onEditorCreated={editor => {
          editorRef.current = editor;
          const values = form.getValues();
          editor.commands.setContent(values.body_html);
        }}
        submitLabel="post"
        submitDisabled={
          !form.isDirty() ||
          !form.isValid() ||
          !htmlHasText(form.values.body_html)
        }
      />
    </Box>
  );
};

export default NewSpacePostForm;

const formatPinnedUntil = (dateString: string): string =>
  DateTime.fromISO(dateString, { zone: "local" })
    .set({ hour: 23, minute: 59, second: 59, millisecond: 0 })
    .toISO();

interface LoginOrRegisterFormProps {
  onRegisteredAndSignedIn: () => void;
}

const LoginOrRegisterForm: FC<LoginOrRegisterFormProps> = ({
  onRegisteredAndSignedIn,
}) => {
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const reloadCurrentUserAndContinue = () => {
    router.reload({
      only: ["currentUser"],
      onSuccess: () => {
        onRegisteredAndSignedIn();
      },
    });
  };
  return (
    <>
      {showRegistrationForm ? (
        <RegistrationForm
          onRegistrationCreated={reloadCurrentUserAndContinue}
        />
      ) : (
        <LoginForm
          onSessionCreated={registered => {
            if (!registered) {
              setShowRegistrationForm(true);
            } else {
              reloadCurrentUserAndContinue();
            }
          }}
        />
      )}
    </>
  );
};

interface RegistrationFormProps {
  onRegistrationCreated: () => void;
}

const RegistrationForm: FC<RegistrationFormProps> = ({
  onRegistrationCreated,
}) => {
  const { getInputProps, submit } = useForm({
    action: routes.registrations.create,
    descriptor: "complete signup",
    initialValues: {
      name: "",
      allow_space_replies: true,
    },
    transformValues: ({ name }) => ({
      user: {
        name,
        time_zone: currentTimeZone(),
      },
    }),
    onSuccess: () => {
      onRegistrationCreated();
    },
  });
  return (
    <form onSubmit={submit}>
      <Stack gap="sm">
        <Stack gap="xs">
          <TextInput {...getInputProps("name")} label="your name" required />
          <Checkbox
            {...getInputProps("allow_space_replies", { type: "checkbox" })}
            label="it's ok for folks here to dm me on whatsapp if they resonate with my posts"
          />
        </Stack>
        <Button type="submit" variant="filled" leftSection={<ProfileIcon />}>
          complete signup and post
        </Button>
      </Stack>
    </form>
  );
};
