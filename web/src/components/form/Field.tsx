"use client";

import type { ReactNode } from "react";

/**
 * One field. The label, the hint, the error and the control's ARIA
 * relationships are wired here so that no call site can forget them —
 * which is exactly how the contact form ended up with none of them.
 *
 * The control is a render prop rather than a `type` switch, so a select,
 * a textarea, a date input and a checkbox group all get identical
 * labelling without this component needing to know about any of them.
 */
export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: (props: {
    id: string;
    "aria-invalid"?: true;
    "aria-describedby"?: string;
  }) => ReactNode;
}) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`field${error ? " field-error" : ""}`}>
      <label htmlFor={id}>
        {label}
        {optional && <span className="field-opt"> Optional</span>}
      </label>
      {hint && <p className="hint" id={hintId}>{hint}</p>}
      {children({
        id,
        ...(error ? { "aria-invalid": true as const } : {}),
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
      })}
      {error && <p className="err" id={errId}>{error}</p>}
    </div>
  );
}

/**
 * The error summary §21 requires and neither form had. Focusable so that
 * `fail()` can send the user here when several answers need attention.
 */
export function ErrorSummary({
  errors,
  innerRef,
}: {
  errors: { field: string; message: string }[];
  innerRef?: React.Ref<HTMLDivElement>;
}) {
  if (errors.length === 0) return null;
  return (
    <div
      className="notice notice-error"
      role="alert"
      tabIndex={-1}
      ref={innerRef}
      style={{ marginBottom: "var(--s5)" }}
    >
      <p style={{ marginBottom: errors.length > 1 ? "var(--s2)" : 0 }}>
        <strong>
          {errors.length === 1
            ? "One answer needs attention."
            : `${errors.length} answers need attention.`}
        </strong>
      </p>
      {errors.length > 1 && (
        <ul className="err-list">
          {errors.map((e) => (
            <li key={e.field}>
              <a href={`#${e.field}`} onClick={(ev) => {
                ev.preventDefault();
                document.getElementsByName(e.field)[0]?.focus();
              }}>
                {e.message}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
