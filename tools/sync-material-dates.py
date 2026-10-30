#!/usr/bin/env python3
"""Record material addition dates from local Git history, without running old JS.

Run after editing pdfs.js, or use --check for read-only validation. A full clone
is required. Historical uploads take precedence over catalog references; Git
renames are followed, while reused names and pdf/pdf-extra remain distinct.
New, uncommitted entries need an explicit ISO timestamp including a timezone.
No network access, JavaScript runtime, or third-party package is used.
"""

from __future__ import annotations

import argparse
import ast
from collections import Counter
from datetime import datetime
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "pdfs.js"
AUDIT = ROOT / "data/material-history.json"
CATALOG_PATHS = ("pdfs.js", "app.js", "index.html")
QUOTED = r'''(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')'''
FILE_FIELD = re.compile(r"\bfile\s*:\s*(" + QUOTED + r")")
DATE_FIELD = re.compile(r"\baddedAt\s*:\s*(" + QUOTED + r")")
OBJECT = re.compile(r"\{[^{}]*\}")
TOKEN = re.compile(QUOTED + r"|`(?:\\.|[^`\\])*`|//[^\n]*|/\*[\s\S]*?\*/")


def git(*args: str, optional: bool = False) -> str:
    result = subprocess.run(
        ["git", "-c", "core.quotepath=false", *args], cwd=ROOT,
        text=True, encoding="utf-8", stdout=subprocess.PIPE, stderr=subprocess.PIPE,
    )
    if result.returncode and not optional:
        raise ValueError(f"git {' '.join(args[:3])} failed: {result.stderr.strip()}")
    return result.stdout if result.returncode == 0 else ""


def timestamp(value: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except (ValueError, TypeError) as exc:
        raise ValueError(f"Invalid addedAt timestamp: {value!r}") from exc
    if "T" not in value or parsed.utcoffset() is None:
        raise ValueError(f"addedAt must include a time and timezone: {value!r}")
    return parsed


def string_value(token: str) -> str:
    value = ast.literal_eval(token)
    if not isinstance(value, str):
        raise ValueError("Expected a quoted JavaScript string")
    return value


def mask_comments(source: str) -> str:
    return TOKEN.sub(
        lambda match: " " * len(match[0]) if match[0].startswith(("//", "/*")) else match[0],
        source,
    )


def assignment(source: str, name: str) -> tuple[int, int] | None:
    """Find an object literal and its balanced bounds; do not evaluate JS/HTML."""
    clean = mask_comments(source)
    match = re.search(r"\b(?:const|let|var)\s+" + name + r"\s*=\s*\{", clean)
    if not match:
        return None
    start = match.end() - 1
    depth, cursor = 0, start
    strings = {m.start(): m.end() for m in TOKEN.finditer(clean)}
    while cursor < len(clean):
        if cursor in strings:
            cursor = strings[cursor]
            continue
        if clean[cursor] == "{":
            depth += 1
        elif clean[cursor] == "}":
            depth -= 1
            if depth == 0:
                return start, cursor + 1
        cursor += 1
    raise ValueError(f"Unbalanced {name} object literal")


def current_records(source: str) -> list[dict]:
    records = []
    for name, prefix in (("data", "pdf/"), ("extrasData", "pdf-extra/")):
        bounds = assignment(source, name)
        if not bounds:
            raise ValueError(f"pdfs.js has no supported {name} object literal")
        start, end = bounds
        body = mask_comments(source[start:end])
        found = 0
        for obj in OBJECT.finditer(body):
            field = FILE_FIELD.search(obj[0])
            if not field:
                continue
            found += 1
            filename = string_value(field[1])
            path = PurePosixPath(filename)
            if path.is_absolute() or ".." in path.parts or not filename.lower().endswith(".pdf"):
                raise ValueError(f"Unsupported material filename: {filename!r}")
            date = DATE_FIELD.search(obj[0])
            if re.search(r"\baddedAt\s*:", obj[0]) and not date:
                raise ValueError(f"addedAt must be a quoted timestamp: {filename}")
            supplied = string_value(date[1]) if date else None
            if supplied is not None:
                timestamp(supplied)
            # Insert before the object's closing brace, preserving its other fields.
            records.append({
                "key": prefix + filename, "date": supplied,
                "date_span": (start + obj.start() + date.start(1), start + obj.start() + date.end(1)) if date else None,
                "insert": start + obj.end() - 1,
            })
        if found != len(re.findall(r"\bfile\s*:", body)):
            raise ValueError(f"Unsupported material record in {name}; use a plain object with a quoted file field")
    if not records:
        raise ValueError("No material records found")
    return records


def log_records(output: str):
    """Read NUL-delimited Git records without Unicode path quoting problems."""
    for block in output.split("\x1e"):
        if not block.strip("\n\0"):
            continue
        parts = block.split("\0")
        if len(parts) < 3:
            raise ValueError("Unexpected Git log output")
        commit, date = parts[:2]
        tokens = [part.lstrip("\n") for part in parts[2:] if part.strip("\n")]
        yield commit.strip(), date.strip(), tokens


def changes(tokens: list[str]):
    index = 0
    while index < len(tokens):
        status = tokens[index]
        count = 2 if status.startswith(("R", "C")) else 1
        paths = tokens[index + 1:index + 1 + count]
        if len(paths) != count:
            raise ValueError("Incomplete Git path change")
        yield status, paths
        index += count + 1


def catalog_origins(keys: set[str]) -> dict:
    origins = {}
    log = git("log", "--reverse", "--topo-order", "--format=%x1e%H%x00%cI%x00",
              "--name-only", "-z", "HEAD", "--", *CATALOG_PATHS)
    for commit, date, paths in log_records(log):
        for path in paths:
            source = git("show", f"{commit}:{path}", optional=True)
            if not source:
                continue  # A catalog may have been deleted during a migration.
            for name, prefix in (("data", "pdf/"), ("extrasData", "pdf-extra/")):
                bounds = assignment(source, name)
                if not bounds:
                    continue
                body = mask_comments(source[bounds[0]:bounds[1]])
                for match in re.finditer(QUOTED, body):
                    key = prefix + string_value(match[0])
                    if key in keys and key not in origins:
                        origins[key] = {"commit": commit, "committedAt": date, "path": path}
        if len(origins) == len(keys):
            break
    return origins


def upload_origin(key: str) -> tuple[dict | None, str | None]:
    last = git("log", "-1", "--format=%H", "HEAD", "--", key).strip()
    if not last:
        return None, None
    events = list(changes(git("diff-tree", "--root", "--no-commit-id", "-r", "-M", "--name-status", "-z", last).split("\0")[:-1]))
    event = next(((status, paths) for status, paths in events if key in paths), None)
    if not event:
        raise ValueError(f"Could not determine the last repository event for {key}")
    status, paths = event
    if status.startswith("R") and paths[0] == key:
        return None, f"The historical upload path was renamed to {paths[1]} in {last}; the current asset under the old name cannot be verified."
    snapshot = last + "^" if status == "D" else last
    log = git("log", "--follow", "--format=%x1e%H%x00%cI%x00", "--name-status", "-z", "-M", snapshot, "--", key)
    cursor, renames = key, []
    for commit, date, tokens in log_records(log):
        for change, changed_paths in changes(tokens):
            if change.startswith("R") and changed_paths[1] == cursor:
                old, new = changed_paths
                renames.append({"commit": commit, "from": old, "to": new})
                cursor = old
            elif change in ("A", "C") or change.startswith("C"):
                if changed_paths[-1] == cursor:
                    return {"addedAt": date, "source": "git-upload", "sourceCommit": commit,
                            "sourcePath": cursor, "renames": list(reversed(renames))}, None
    raise ValueError(f"No original upload commit found for historical asset {key}")


def derive(records: list[dict], previous: dict) -> dict:
    keys = {record["key"] for record in records}
    catalog = catalog_origins(keys)
    assets = {}
    for key in sorted(keys):
        dates = [r["date"] for r in records if r["key"] == key and r["date"] is not None]
        if len({timestamp(date) for date in dates}) > 1:
            raise ValueError(f"Conflicting addedAt values for {key}")
        supplied = dates[0] if dates else None
        old = previous.get("materials", {}).get(key)
        # Explicit maintainer dates remain explicit after the catalog is committed.
        if old and old.get("source") == "explicit" or supplied and not old:
            explicit = supplied or old["addedAt"]
            timestamp(explicit)
            assets[key] = {"addedAt": explicit, "source": "explicit", "sourceCommit": None,
                           "sourcePath": "pdfs.js", "note": "Maintainer-supplied timestamp; not inferred from a Git upload."}
            continue
        upload, caveat = upload_origin(key)
        evidence = catalog.get(key)
        if upload:
            entry = upload
            if evidence:
                entry["catalogFirst"] = evidence
        elif evidence:
            entry = {"addedAt": evidence["committedAt"], "source": "git-catalog",
                     "sourceCommit": evidence["commit"], "sourcePath": evidence["path"],
                     "note": (caveat + " " if caveat else "") + "Date is the first catalog reference, not a verified remote upload time."}
        else:
            raise ValueError(f"No historical evidence for {key}; supply an explicit addedAt ISO timestamp before syncing")
        if supplied and timestamp(supplied) != timestamp(entry["addedAt"]):
            raise ValueError(f"addedAt for {key} disagrees with its recorded Git evidence")
        assets[key] = entry
    return {
        "schemaVersion": 1,
        "dateBasis": "Git committer timestamps with timezone; historical upload lineage when verified, otherwise first catalog reference or an explicit maintainer timestamp.",
        "recordCount": len(records), "assetCount": len(assets), "materials": assets,
    }


def enriched_catalog(source: str, records: list[dict], audit: dict) -> str:
    edits = []
    for record in records:
        date = audit["materials"][record["key"]]["addedAt"]
        if record["date_span"]:
            start, end = record["date_span"]
            edits.append((start, end, json.dumps(date)))
        else:
            pos = record["insert"]
            # Existing catalog records may or may not have a trailing comma.
            previous = source[:pos].rstrip()[-1:]
            edits.append((pos, pos, (" " if previous == "," else ", ") + 'addedAt: ' + json.dumps(date)))
    for start, end, replacement in sorted(edits, reverse=True):
        source = source[:start] + replacement + source[end:]
    return source


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Validate catalog dates and committed provenance without writing")
    args = parser.parse_args()
    if git("rev-parse", "--is-shallow-repository").strip() != "false":
        raise ValueError("Full Git history is required; deepen the clone before running this tool")
    source = CATALOG.read_text(encoding="utf-8")
    records = current_records(source)
    previous = json.loads(AUDIT.read_text(encoding="utf-8")) if AUDIT.exists() else {}
    audit = derive(records, previous)
    catalog_text = enriched_catalog(source, records, audit)
    audit_text = json.dumps(audit, ensure_ascii=False, indent=2, sort_keys=True) + "\n"
    if args.check:
        if source != catalog_text or not AUDIT.exists() or AUDIT.read_text(encoding="utf-8") != audit_text:
            raise ValueError("Material dates or provenance are missing/stale; run python3 tools/sync-material-dates.py and review the resulting diff")
    else:
        AUDIT.parent.mkdir(parents=True, exist_ok=True)
        CATALOG.write_text(catalog_text, encoding="utf-8")
        AUDIT.write_text(audit_text, encoding="utf-8")
    counts = dict(Counter(entry["source"] for entry in audit["materials"].values()))
    print(f"{'Checked' if args.check else 'Synced'} {len(records)} material records / {len(audit['materials'])} asset paths: {counts}")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (ValueError, OSError, SyntaxError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        sys.exit(1)
