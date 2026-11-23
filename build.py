"""Inline jsPsych + app.js into one self-contained, offline HTML file."""
import pathlib, re, sys

root = pathlib.Path(__file__).parent
nm = root / "node_modules"
libs = [
    nm / "jspsych/dist/index.browser.min.js",
    nm / "@jspsych/plugin-html-keyboard-response/dist/index.browser.min.js",
    nm / "@jspsych/plugin-html-button-response/dist/index.browser.min.js",
    nm / "@jspsych/plugin-canvas-keyboard-response/dist/index.browser.min.js",
    nm / "@jspsych/plugin-fullscreen/dist/index.browser.min.js",
]

def clean(js: str) -> str:
    js = re.sub(r"//# sourceMappingURL=\S+", "", js)
    return js.replace("</script", "<\\/script")

js = "\n".join(clean(p.read_text()) for p in libs)
css = (nm / "jspsych/css/jspsych.css").read_text()
app = clean((root / "src/app.js").read_text())
html = (root / "src/shell.html").read_text()
html = html.replace("/*@@JSPSYCH_CSS@@*/", css).replace("/*@@JSPSYCH_JS@@*/", js).replace("/*@@APP_JS@@*/", app)
out = pathlib.Path(sys.argv[1])
out.write_text(html)
print(f"wrote {out} ({out.stat().st_size/1024:.0f} KB)")
