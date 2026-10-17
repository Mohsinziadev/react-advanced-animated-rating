import type { ReactNode } from "react";

// A deliberately small JSX/TS highlighter: good enough for the snippets on this page,
// without shipping a syntax-highlighting library to visitors.
const TOKEN =
  /(\/\/[^\n]*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|from|export|function|return|const|let|default|type|interface|extends)\b|\b(true|false|null|undefined)\b|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$-]*)(?==)|([{}()[\]])/g;

export function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0;
    if (index > last) out.push(code.slice(last, index));
    const [text, comment, str, tag, keyword, literal, num, attrName, punct] = match;
    const cls = comment
      ? "tok-comment"
      : str
        ? "tok-string"
        : tag
          ? "tok-tag"
          : keyword
            ? "tok-keyword"
            : literal || num
              ? "tok-number"
              : attrName
                ? "tok-attr"
                : punct
                  ? "tok-punct"
                  : "";
    out.push(
      <span key={key++} className={cls}>
        {text}
      </span>,
    );
    last = index + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}
