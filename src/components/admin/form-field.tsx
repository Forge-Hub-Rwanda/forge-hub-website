/**
 * Shared field styling for every admin CRUD form (team, blog, portfolio,
 * admins), so each doesn't redefine the same input classes. Matches the
 * square-cornered, rule-bordered inputs used by the contact and login forms.
 */
export const FIELD_CLASS =
  "border-line bg-surface text-text placeholder:text-text-muted mt-2 w-full border px-4 py-2.5 text-base transition-colors hover:border-text focus:border-text";

type Props = {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
};

/** Label + input/textarea/select + error line, in the admin's field layout. */
export function Field({ id, label, error, children }: Props) {
  return (
    <div className="field">
      <label htmlFor={id} className="text-label text-text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-text mt-2 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
