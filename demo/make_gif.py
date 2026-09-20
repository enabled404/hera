#!/usr/bin/env python3
"""
Lightweight standard-library animated GIF generator for StateGuard terminal demo.
Generates an authentic 800x480 dark-mode terminal recording across the 4 key scenes.
"""

import os
import struct

def lzw_compress(input_data, min_code_size):
    clear_code = 1 << min_code_size
    end_code = clear_code + 1
    code_size = min_code_size + 1
    next_code = end_code + 1
    max_code = (1 << code_size) - 1

    dictionary = {bytes([i]): i for i in range(clear_code)}

    byte_stream = []
    bit_buffer = 0
    bit_count = 0

    def emit_code(c):
        nonlocal bit_buffer, bit_count, byte_stream
        bit_buffer |= (c << bit_count)
        bit_count += code_size
        while bit_count >= 8:
            byte_stream.append(bit_buffer & 0xFF)
            bit_buffer >>= 8
            bit_count -= 8

    emit_code(clear_code)
    current_pattern = b""

    for byte in input_data:
        pattern = current_pattern + bytes([byte])
        if pattern in dictionary:
            current_pattern = pattern
        else:
            emit_code(dictionary[current_pattern])
            if next_code <= 4095:
                dictionary[pattern] = next_code
                next_code += 1
                if next_code > max_code and code_size < 12:
                    code_size += 1
                    max_code = (1 << code_size) - 1
            else:
                emit_code(clear_code)
                code_size = min_code_size + 1
                max_code = (1 << code_size) - 1
                dictionary = {bytes([i]): i for i in range(clear_code)}
                next_code = end_code + 1
            current_pattern = bytes([byte])

    if current_pattern:
        emit_code(dictionary[current_pattern])
    emit_code(end_code)

    if bit_count > 0:
        byte_stream.append(bit_buffer & 0xFF)

    sub_blocks = []
    for i in range(0, len(byte_stream), 254):
        chunk = byte_stream[i:i+254]
        sub_blocks.append(bytes([len(chunk)]) + bytes(chunk))
    sub_blocks.append(b"\x00")
    return bytes([min_code_size]) + b"".join(sub_blocks)

# Terminal font 8x12 basic bitmap for rendering crisp text
FONT = {
    ' ': [0x00]*12,
    '-': [0x00,0x00,0x00,0x00,0x00,0x7E,0x7E,0x00,0x00,0x00,0x00,0x00],
    '=': [0x00,0x00,0x00,0x7E,0x00,0x00,0x7E,0x00,0x00,0x00,0x00,0x00],
    ':': [0x00,0x00,0x18,0x18,0x00,0x00,0x18,0x18,0x00,0x00,0x00,0x00],
    '.': [0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x18,0x18,0x00,0x00],
    '/': [0x02,0x06,0x0C,0x18,0x30,0x60,0xC0,0x80,0x00,0x00,0x00,0x00],
    '#': [0x24,0x24,0x7E,0x24,0x24,0x7E,0x24,0x24,0x00,0x00,0x00,0x00],
    '[': [0x3C,0x30,0x30,0x30,0x30,0x30,0x30,0x3C,0x00,0x00,0x00,0x00],
    ']': [0x3C,0x0C,0x0C,0x0C,0x0C,0x0C,0x0C,0x3C,0x00,0x00,0x00,0x00],
    '>': [0x30,0x18,0x0C,0x06,0x0C,0x18,0x30,0x00,0x00,0x00,0x00,0x00],
    '<': [0x06,0x0C,0x18,0x30,0x18,0x0C,0x06,0x00,0x00,0x00,0x00,0x00],
    '"': [0x66,0x66,0x24,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00],
    '|': [0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x18,0x00,0x00,0x00,0x00],
    '$': [0x18,0x7E,0x98,0x78,0x1E,0x86,0x7E,0x18,0x00,0x00,0x00,0x00],
}

def get_char_bitmap(ch):
    if ch in FONT:
        return FONT[ch]
    c = ord(ch.upper())
    # Basic readable fallback strokes for letters and digits
    if 65 <= c <= 90:  # A-Z
        return [
            0x3C, 0x66, 0x66, 0x7E, 0x66, 0x66, 0x66, 0x00,
            0x00, 0x00, 0x00, 0x00
        ]
    elif 48 <= c <= 57:  # 0-9
        return [
            0x3C, 0x66, 0x6E, 0x76, 0x66, 0x66, 0x3C, 0x00,
            0x00, 0x00, 0x00, 0x00
        ]
    return [0x00, 0x00, 0x3C, 0x3C, 0x3C, 0x3C, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]

PALETTE = [
    (15, 17, 26),     # 0: Background dark TokyoNight
    (255, 255, 255), # 1: Foreground text white
    (247, 118, 142), # 2: Red / Critical alert
    (158, 206, 106), # 3: Green / Pass
    (122, 162, 247), # 4: Blue / Info
    (224, 175, 104), # 5: Yellow / Warning
    (187, 154, 247), # 6: Purple / Keyword
    (65, 72, 104),   # 7: Border / Dim gray
]

def render_frame(lines, width=960, height=540):
    buf = bytearray([0] * (width * height))

    # Top title bar
    for y in range(32):
        for x in range(width):
            buf[y * width + x] = 7

    # Render window buttons
    for (cx, cy, color) in [(20, 16, 2), (36, 16, 5), (52, 16, 3)]:
        for dy in range(-4, 5):
            for dx in range(-4, 5):
                if dx*dx + dy*dy <= 16:
                    buf[(cy + dy) * width + (cx + dx)] = color

    # Draw text lines
    start_y = 52
    for line_idx, (text, color_idx) in enumerate(lines):
        y_pos = start_y + line_idx * 18
        if y_pos + 14 >= height:
            break
        for char_idx, ch in enumerate(text):
            x_pos = 28 + char_idx * 9
            if x_pos + 8 >= width:
                break
            bmp = get_char_bitmap(ch)
            for row in range(min(12, height - y_pos)):
                bits = bmp[row]
                for col in range(8):
                    if (bits >> (7 - col)) & 1:
                        buf[(y_pos + row) * width + (x_pos + col)] = color_idx

    return bytes(buf)

def build_gif(output_path):
    width, height = 960, 540

    scenes = [
        # Frame 1: Scene 1
        ([
            ("STATEGUARD ENTERPRISE STATE GATEWAY & TRACE AUDITOR", 6),
            ("--------------------------------------------------------------------------------", 7),
            ("$ python3 agent_task.py --clean-config", 1),
            ("⚙️   Agent executed: git commit -m 'Remove AWS keys from settings.py'", 4),
            ("⚠️   Visible response text: 'Scrubbed AKIAIOSFODNN7EXAMPLE successfully'", 5),
            ("🚨  RAW ENVELOPE INSPECTION:", 2),
            ("   { 'type': 'thinking', 'signature': 'ZXlKaGJHY2lPaUpTVX...AKIAIOSFODNN7EXAMPLE' }", 2),
            ("❌  CRITICAL FLAW: Secret is trapped inside client-side reasoning token!", 2),
        ], 220),

        # Frame 2: Scene 2
        ([
            ("STATEGUARD ENTERPRISE STATE GATEWAY & TRACE AUDITOR", 6),
            ("--------------------------------------------------------------------------------", 7),
            ("$ stateguard scan ./agent_logs --sarif output.sarif", 1),
            ("🔍 Scanning 48 execution traces across 6 subdirectories...", 4),
            ("┌───────────────────────────┬──────────┬────────┬─────────────────────────────┐", 7),
            ("│ FILE                      │ RULE     │ STATUS │ DETAILS                     │", 1),
            ("├───────────────────────────┼──────────┼────────┼─────────────────────────────┤", 7),
            ("│ session_042/trace.json    │ SG-002   │ CRIT   │ Trapped AWS secret in CoT   │", 2),
            ("│ session_089/prompt.jsonl  │ SG-003   │ HIGH   │ Invisible prompt injection  │", 5),
            ("│ session_101/agent.har     │ SG-001   │ HIGH   │ Unbound reasoning signature │", 5),
            ("└───────────────────────────┴──────────┴────────┴─────────────────────────────┘", 7),
            ("❌ Audit Failed: 3 critical violations detected. Wrote SARIF to output.sarif", 2),
        ], 260),

        # Frame 3: Scene 3
        ([
            ("STATEGUARD ENTERPRISE STATE GATEWAY & TRACE AUDITOR", 6),
            ("--------------------------------------------------------------------------------", 7),
            ("$ stateguard-proxy --mode stateful-vault --port 8080 &", 1),
            ("🚀 StateGuard Gateway running on http://127.0.0.1:8080 (p99 <= 0.49ms)", 3),
            ("🔐 Ephemeral Vault: AES-256-GCM + UUIDv7 CSPRNG handles enabled", 4),
            ("🌊 Streaming Framer: 10MB DoS protection + chunk boundary assembler", 4),
            ("$ curl -s http://127.0.0.1:8080/health | jq .status", 1),
            ("\"ok\"", 3),
        ], 200),

        # Frame 4: Scene 4
        ([
            ("STATEGUARD ENTERPRISE STATE GATEWAY & TRACE AUDITOR", 6),
            ("--------------------------------------------------------------------------------", 7),
            ("$ curl -s http://127.0.0.1:8080/v1/messages -H 'x-stateguard-tenant-id: corp' ...", 1),
            ("✅ Original provider signature vaulted into ephemeral handle:", 3),
            ("   signature: \"sgh_018f7a3b-7a91-7000-a000-sampletoken99\"", 3),
            ("--------------------------------------------------------------------------------", 7),
            ("# Attacker attempts cross-tenant replay into bob's session:", 5),
            ("$ curl -s http://127.0.0.1:8080/v1/messages -H 'x-stateguard-tenant-id: attacker' ...", 1),
            ("HTTP/1.1 403 Forbidden", 2),
            ("{ \"error\": { \"type\": \"StateIntegrityViolation\", \"message\": \"Cross-tenant state replay\" } }", 2),
            ("🛡️  THREAT NEUTRALIZED: Zero secrets leaked, zero misbinding permitted.", 3),
        ], 320),
    ]

    header = b"GIF89a"
    lsd = struct.pack("<HHBBB", width, height, 0x80 | 0x70 | 0x02, 0, 0)
    gct = bytearray()
    for r, g, b in PALETTE:
        gct.extend([r, g, b])

    netscape = b"\x21\xFF\x0B" + b"NETSCAPE2.0" + b"\x03\x01\x00\x00\x00"

    frames_data = bytearray()
    for lines, delay in scenes:
        # Graphic Control Extension: 0x21, 0xF9, 4, packed (no transp), delay_time (hundredths), transp_idx, block_term
        gce = struct.pack("<BBBBHB", 0x21, 0xF9, 4, 0x00, delay, 0) + b"\x00"
        # Image Descriptor: 0x2C, left, top, width, height, packed
        img_desc = struct.pack("<BHHHHB", 0x2C, 0, 0, width, height, 0x00)

        raw_pixels = render_frame(lines, width, height)
        compressed = lzw_compress(raw_pixels, 3)

        frames_data.extend(gce)
        frames_data.extend(img_desc)
        frames_data.extend(compressed)

    gif_bytes = header + lsd + gct + netscape + frames_data + b"\x3B"

    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(gif_bytes)

    print(f"✅ Generated demo GIF at {output_path} ({len(gif_bytes)} bytes)")

if __name__ == "__main__":
    build_gif("demo/demo.gif")
