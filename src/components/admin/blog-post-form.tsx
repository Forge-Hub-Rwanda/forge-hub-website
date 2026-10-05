"use client";

import { useActionState } from "react";
import {
  createBlogPost,
  updateBlogPost,
  type BlogPostState,
} from "@/app/admin/blog/actions";
import { Field, FIELD_CLASS } from "@/components/admin/form-field";

const initial: BlogPostState = { status: "idle" };

type BlogPost = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_image_url: string | null;
  is_published: boolean;
};

export function BlogPostForm({ post }: { post?: BlogPost }) {
  const action = post ? updateBlogPost.bind(null, post.id) : createBlogPost;
  const [state, formAction, pending] = useActionState(action, initial);
  const errors = state.errors ?? {};

  return (
    <form
      action={formAction}
      className="mt-6 flex max-w-2xl flex-col gap-5"
      noValidate
    >
      <Field id="title" label="Title" error={errors.title}>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={post?.title}
          className={FIELD_CLASS}
        />
      </Field>

      <Field id="excerpt" label="Excerpt (optional)" error={errors.excerpt}>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={2}
          defaultValue={post?.excerpt ?? ""}
          className={`${FIELD_CLASS} resize-y`}
        />
      </Field>

      <Field id="body" label="Body" error={errors.body}>
        <textarea
          id="body"
          name="body"
          rows={14}
          required
          defaultValue={post?.body}
          className={`${FIELD_CLASS} resize-y font-mono text-sm`}
        />
      </Field>

      <Field id="cover" label="Cover image">
        {post?.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt=""
            className="mt-2 mb-3 h-32 w-full max-w-xs object-cover"
          />
        )}
        <input id="cover" name="cover" type="file" accept="image/*" />
      </Field>

      <div className="field flex items-center gap-3">
        <input
          id="isPublished"
          name="isPublished"
          type="checkbox"
          defaultChecked={post?.is_published}
          className="h-4 w-4"
        />
        <label htmlFor="isPublished" className="text-text text-sm">
          Published
        </label>
      </div>

      <div className="mt-1 flex flex-col gap-4">
        <button
          type="submit"
          disabled={pending}
          className="btn btn-strong w-fit"
        >
          {pending ? "Saving…" : post ? "Save changes" : "Create post"}
        </button>
        {state.status === "error" && state.message && (
          <p role="alert" className="text-accent text-sm">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
