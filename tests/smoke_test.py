"""Usage: python3 tests/smoke_test.py dyscalculia_battery.html visit1|visit2|all <participant_num> full|demo <out_dir> [stop_after_seconds]
Drive the battery headlessly: fill setup, press keys like a (random) child, save the CSV."""
import os, sys, time, random, pathlib
CHROME = os.environ.get("CHROME", "/usr/bin/google-chrome")
from playwright.sync_api import sync_playwright

html, session, num, demo, outdir = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] == "demo", pathlib.Path(sys.argv[5])
stop_after = float(sys.argv[6]) if len(sys.argv) > 6 else None   # seconds -> emergency stop test
outdir.mkdir(parents=True, exist_ok=True)

with sync_playwright() as p:
    b = p.chromium.launch(executable_path=CHROME, args=["--no-sandbox"])
    ctx = b.new_context(accept_downloads=True, viewport={"width": 1366, "height": 768})
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))
    page.on("console", lambda m: errors.append("console." + m.type + ": " + m.text) if m.type == "error" else None)
    page.on("dialog", lambda d: d.accept())
    page.goto("file://" + str(pathlib.Path(html).resolve()))
    page.wait_for_timeout(500)
    print("device check:", page.inner_text("#devicecheck").replace("\n", " | "))
    page.fill("#exp", "TST")
    if demo:
        page.eval_on_selector("details", "d => d.open = true"); page.check("#demo")
    else:
        page.fill("#school", "GHS_TEST"); page.fill("#pnum", num); page.select_option("#cls", "5")
        page.fill("#age", "10"); page.select_option("#sex", "F"); page.check("#consent"); page.check("#assent")
    print("preview:", page.inner_text("#idpreview").replace("\n", " "))
    btn = {"visit1": "#btn-v1", "visit2": "#btn-v2"}.get(session)
    if btn is None:
        page.eval_on_selector("details", "d => d.open = true"); btn = "#btn-all"
    page.click(btn)
    t0 = time.time(); downloads = []
    page.on("download", lambda d: downloads.append(d))
    while time.time() - t0 < 1500:
        if page.is_visible("#done"):
            break
        if stop_after and time.time() - t0 > stop_after:
            page.keyboard.down("Shift"); page.keyboard.press("Q"); page.keyboard.up("Shift"); stop_after = None
            page.wait_for_timeout(500); continue
        if page.query_selector("#jspsych-fullscreen-btn"):
            page.click("#jspsych-fullscreen-btn"); continue
        nb = page.query_selector_all(".numbtn")
        if nb:
            random.choice(nb[:10]).click(); page.wait_for_timeout(50); continue
        page.keyboard.press(" ")
        page.wait_for_timeout(random.randint(60, 140))
        page.keyboard.press(random.choice(["f", "j", "ArrowLeft", "ArrowRight"]))
        page.wait_for_timeout(random.randint(60, 140))
    page.wait_for_timeout(800)
    print("finished in %.0f s; done screen: %s" % (time.time() - t0, page.is_visible("#done")))
    if page.is_visible("#done"):
        print("done msg:", page.inner_text("#donemsg").replace("\n", " "))
    for d in downloads:
        d.save_as(outdir / d.suggested_filename); print("saved", d.suggested_filename)
    # reload: does the history panel show the session?
    page.goto("file://" + str(pathlib.Path(html).resolve())); page.wait_for_timeout(400)
    print("history:", page.inner_text("#history").replace("\n", " | ")[:400])
    print("JS errors:", errors if errors else "none")
    b.close()
