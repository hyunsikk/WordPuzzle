#!/usr/bin/env python3
"""
Group vocabulary words by semantic meaning using Claude API.
Output: JSON file with semantic groups (3-8 words each) for word puzzles.
"""

import json
import os
import re
from pathlib import Path
from anthropic import Anthropic

# Configuration
WORDLISTS_DIR = Path(__file__).parent.parent / "wordlists"
OUTPUT_FILE = WORDLISTS_DIR / "semantic_groups.json"
BATCH_SIZE = 200  # Words per API call

def load_all_words():
    """Load and deduplicate words from all txt files."""
    words = set()
    for txt_file in WORDLISTS_DIR.glob("*.txt"):
        with open(txt_file, "r") as f:
            for line in f:
                word = line.strip().upper()
                if word and re.match(r'^[A-Z]{3,12}$', word):
                    words.add(word)
    return sorted(words)

def group_words_with_claude(words: list[str], client: Anthropic) -> dict:
    """Use Claude to group words semantically."""

    prompt = f"""Analyze these words and group them by semantic meaning/theme.

Words: {', '.join(words)}

Rules:
1. Create groups of related words (synonyms, same category, same theme)
2. Each group MUST have 3-8 words (no more, no less)
3. A word CAN appear in multiple groups if it fits multiple themes
4. Name each group with a clear semantic label (e.g., "emotions_positive", "actions_movement", "qualities_intelligence")
5. Use lowercase with underscores for group names
6. If you have multiple groups with similar themes, add numeric suffix (e.g., "emotions_positive_1", "emotions_positive_2")

Return ONLY valid JSON in this format:
{{
  "group_name": ["WORD1", "WORD2", "WORD3"],
  "another_group": ["WORD4", "WORD5", "WORD6", "WORD7"]
}}

Focus on creating meaningful, thematic groups useful for word puzzles."""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[{"role": "user", "content": prompt}]
    )

    content = response.content[0].text
    # Extract JSON from response
    json_match = re.search(r'\{[\s\S]*\}', content)
    if json_match:
        return json.loads(json_match.group())
    return {}

def merge_groups(all_groups: dict) -> dict:
    """Merge groups, handling duplicate names with suffixes."""
    merged = {}
    name_counts = {}

    for name, words in all_groups.items():
        # Validate group size
        if not (3 <= len(words) <= 8):
            continue

        # Handle duplicate names
        base_name = re.sub(r'_\d+$', '', name)  # Remove existing suffix
        if base_name not in name_counts:
            name_counts[base_name] = 0

        # Check if this exact word set already exists
        words_set = frozenset(w.upper() for w in words)
        existing = False
        for existing_name, existing_words in merged.items():
            if frozenset(existing_words) == words_set:
                existing = True
                break

        if not existing:
            name_counts[base_name] += 1
            if name_counts[base_name] == 1:
                final_name = base_name
            else:
                final_name = f"{base_name}_{name_counts[base_name]}"
            merged[final_name] = [w.upper() for w in words]

    return merged

def main():
    # Check for API key
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        # Try to read from a local file
        key_file = Path(__file__).parent.parent / ".api_key"
        if key_file.exists():
            api_key = key_file.read_text().strip()

    if not api_key:
        print("Error: ANTHROPIC_API_KEY environment variable not set")
        print("Set it with: export ANTHROPIC_API_KEY='your-key-here'")
        return

    client = Anthropic(api_key=api_key)

    print("Loading words...")
    words = load_all_words()
    print(f"Loaded {len(words)} unique words")

    all_groups = {}

    # Process in batches
    for i in range(0, len(words), BATCH_SIZE):
        batch = words[i:i + BATCH_SIZE]
        print(f"Processing batch {i // BATCH_SIZE + 1}/{(len(words) + BATCH_SIZE - 1) // BATCH_SIZE}...")

        try:
            groups = group_words_with_claude(batch, client)
            all_groups.update(groups)
            print(f"  Found {len(groups)} groups in this batch")
        except Exception as e:
            print(f"  Error processing batch: {e}")
            continue

    # Merge and filter groups
    print("\nMerging and filtering groups...")
    final_groups = merge_groups(all_groups)

    # Sort groups by name for easy prefix lookup
    final_groups = dict(sorted(final_groups.items()))

    # Save to JSON
    with open(OUTPUT_FILE, "w") as f:
        json.dump(final_groups, f, indent=2)

    print(f"\nSaved {len(final_groups)} semantic groups to {OUTPUT_FILE}")

    # Print summary by prefix
    prefixes = {}
    for name in final_groups:
        prefix = name.split('_')[0]
        prefixes[prefix] = prefixes.get(prefix, 0) + 1

    print("\nGroups by category prefix:")
    for prefix, count in sorted(prefixes.items()):
        print(f"  {prefix}: {count} groups")

if __name__ == "__main__":
    main()
