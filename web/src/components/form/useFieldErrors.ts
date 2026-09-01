"use client";

import { useCallback, useRef, useState } from "react";

export type FieldError = { field: string; message: string };

/**
 * Per-field validation state, shared by both forms.
 *
 * There used to be two philosophies on one site: the brief form marked
 * individual fields, wired aria-invalid/aria-describedby and moved focus to
 * the first problem, while the contact form showed a single sentence and
 * marked nothing. Blueprint §21 asks for "persistent labels, instructions,
 * field errors and error summary" — so the stricter one wins, once.
 */
export function useFieldErrors() {
  const [errors, setErrors] = useState<FieldError[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const errorFor = useCallback(
    (field: string) => errors.find((e) => e.field === field)?.message,
    [errors]
  );

  /** Report failures and send focus somewhere useful — WCAG 3.3.1. */
  const fail = useCallback((list: FieldError[]) => {
    setErrors(list);
    if (list.length === 0) return;
    // One problem: go straight to it. Several: the summary explains first.
    requestAnimationFrame(() => {
      if (list.length === 1) {
        formRef.current
          ?.querySelector<HTMLElement>(`[name="${list[0].field}"]`)
          ?.focus();
      } else {
        summaryRef.current?.focus();
      }
    });
  }, []);

  const clear = useCallback(() => setErrors([]), []);

  return { errors, errorFor, fail, clear, formRef, summaryRef };
}

/** Idempotency key — generated on demand, never during render. */
export function newIdempotencyKey() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `k-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}
