#!/usr/bin/env python3
"""
Fix mojibake in resourcesData.js using a direct byte-level approach.
Handles files that mix emojis (which can't go through latin-1) 
with mojibake sequences.
"""

backup = r"src\components\resourcesData.js.bak"
target = r"src\components\resourcesData.js"

# Restore from backup first
content = open(backup, encoding='utf-8').read()
print(f"Loaded backup: {len(content)} chars")

# These are the actual two-char unicode sequences that represent mojibake.
# Each pair is two latin-1 codepoints that together form a valid UTF-8 sequence.
# We detect them by checking if two adjacent chars, when encoded as latin-1 bytes,
# form a valid UTF-8 codepoint.

def fix_mojibake_smart(text):
    """
    Scan text char by char. When we see a char in range U+00C2-U+00C3 (0xC2-0xC3)
    followed by a char in range U+0080-U+00BF (continuation bytes in UTF-8),
    try to decode them as 2-byte UTF-8.
    Also handle 3-byte sequences: E2 80 xx (smart quotes, em-dash, etc.)
    """
    result = []
    i = 0
    fixed_count = 0
    
    while i < len(text):
        c = text[i]
        cp = ord(c)
        
        # Check for 3-byte mojibake: chars like â€" (U+00E2 U+0080 U+0094 = em-dash)
        if cp == 0xE2 and i + 2 < len(text):
            c2 = text[i+1]
            c3 = text[i+2]
            cp2, cp3 = ord(c2), ord(c3)
            if 0x80 <= cp2 <= 0xBF and 0x80 <= cp3 <= 0xBF:
                try:
                    decoded = bytes([cp, cp2, cp3]).decode('utf-8')
                    result.append(decoded)
                    i += 3
                    fixed_count += 1
                    continue
                except (UnicodeDecodeError, ValueError):
                    pass
        
        # Check for 2-byte mojibake: chars like Ã© (U+00C3 U+00A9 = é)
        if 0xC2 <= cp <= 0xC3 and i + 1 < len(text):
            c2 = text[i+1]
            cp2 = ord(c2)
            if 0x80 <= cp2 <= 0xBF:
                try:
                    decoded = bytes([cp, cp2]).decode('utf-8')
                    result.append(decoded)
                    i += 2
                    fixed_count += 1
                    continue
                except (UnicodeDecodeError, ValueError):
                    pass
        
        # Also handle Â followed by non-continuation (orphan Â)
        # In some cases Â appears before special chars - skip it
        # But only if next char is in the range that could be from Windows-1252
        
        result.append(c)
        i += 1
    
    print(f"Fixed {fixed_count} mojibake sequences")
    return ''.join(result)

fixed = fix_mojibake_smart(content)

# Verify the JS is still valid-ish (spot check)
sample_before = content[3500:3600]
sample_after = fixed[3500:3600]
print(f"\nBEFORE sample: {sample_before}")
print(f"AFTER sample:  {sample_after}")

open(target, 'w', encoding='utf-8').write(fixed)
print(f"\nFixed file written to {target}")
print("Done!")
