import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import css from "highlight.js/lib/languages/css";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import markdown from "highlight.js/lib/languages/markdown";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";
import python from "highlight.js/lib/languages/python";
import ini from "highlight.js/lib/languages/ini"

export async function initHighlight(selector = ".post-content pre > code") {

  hljs.registerLanguage("bash", bash);
  hljs.registerLanguage("css", css);
  hljs.registerLanguage("javascript", javascript);
  hljs.registerLanguage("json", json);
  hljs.registerLanguage("markdown", markdown);
  hljs.registerLanguage("typescript", typescript);
  hljs.registerLanguage("xml", xml);
  hljs.registerLanguage("yaml", yaml);
  hljs.registerLanguage("ini",ini);

  hljs.registerAliases(["sh", "shell", "zsh"], { languageName: "bash" });
  hljs.registerAliases(["js", "jsx"], { languageName: "javascript" });
  hljs.registerAliases(["ts", "tsx"], { languageName: "typescript" });
  hljs.registerAliases(["html", "svg"], { languageName: "xml" });
  hljs.registerAliases(["md"], { languageName: "markdown" });
  hljs.registerAliases(["yml"], { languageName: "yaml" });
  hljs.registerLanguage("python", python);
  hljs.registerAliases(["py"], { languageName: "python" });

  window.hljs = hljs;
  await import("highlightjs-line-numbers.js");

  const languageLabels = {
    bash: "Bash",
    sh: "Shell",
    shell: "Shell",
    zsh: "Zsh",
    css: "CSS",
    javascript: "JavaScript",
    js: "JavaScript",
    jsx: "JSX",
    json: "JSON",
    markdown: "Markdown",
    md: "Markdown",
    typescript: "TypeScript",
    ts: "TypeScript",
    tsx: "TSX",
    xml: "HTML",
    html: "HTML",
    svg: "SVG",
    yaml: "YAML",
    yml: "YAML",
    python: "Python",
    py: "Python",
    ini: "INI",
    toml: "TOML"
  };


  const copyCode = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.append(textarea);
      textarea.select();

      const copied = document.execCommand("copy");
      textarea.remove();
      return copied;
    }
  };

  document.querySelectorAll(selector).forEach((codeElement) => {
    const languageClass = [...codeElement.classList].find((className) =>
      className.startsWith("language-"),
    );

    const rawCode = codeElement.textContent ?? "";
    const preElement = codeElement.parentElement;

    if (!(preElement instanceof HTMLPreElement)) {
      return;
    }

    const copyButton = document.createElement("button");
    copyButton.className = "code-copy-button";
    copyButton.type = "button";
    copyButton.innerHTML = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="8" y="8" width="11" height="11" rx="2"></rect>
    <path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"></path>
    </svg>
    `;
    copyButton.setAttribute("aria-label", "复制代码");
    copyButton.title = "复制代码";

    copyButton.addEventListener("click", async () => {
      const copied = await copyCode(rawCode);

      copyButton.classList.toggle("is-copied", copied);
      copyButton.classList.toggle("is-failed", !copied);
      copyButton.setAttribute("aria-label", copied ? "代码已复制" : "复制失败");
      copyButton.title = copied ? "代码已复制" : "复制失败";

      window.setTimeout(() => {
        copyButton.classList.remove("is-copied", "is-failed");
        copyButton.setAttribute("aria-label", "复制代码");
        copyButton.title = "复制代码";
      }, 1600);
    });

    preElement.append(copyButton);

    const language = languageClass?.replace("language-", "").toLowerCase();

    if (!language || !hljs.getLanguage(language)) {
      codeElement.dataset.language = "Text";
      return;
    }

    codeElement.dataset.language =
      languageLabels[language] ?? language.toUpperCase();

    hljs.highlightElement(codeElement);

    const lineCount = (codeElement.textContent ?? "")
      .split(/\r\n|\r|\n/)
      .length;

    if (lineCount >= 3) {
      hljs.lineNumbersBlock(codeElement);
    }
  });
}
