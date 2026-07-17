import re

with open('d:/Pankaj/Software/client/src/pages/Chorsa999.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the return statement of Chorsa999
match = re.search(r'return \(\s*<Container.*?>([\s\S]*?)<\/Container>\s*\);', content)
if not match:
    print("Could not find main return")
    exit(1)

jsx_content = match.group(1)

# Find all Dialogs using a simple stack parser
dialogs = []
idx = 0
while True:
    start_idx = jsx_content.find('<Dialog', idx)
    if start_idx == -1:
        break
        
    # parse until matching </Dialog>
    depth = 0
    i = start_idx
    while i < len(jsx_content):
        if jsx_content[i:].startswith('<Dialog'):
            depth += 1
            i += 7
        elif jsx_content[i:].startswith('</Dialog>'):
            depth -= 1
            i += 9
            if depth == 0:
                dialogs.append(jsx_content[start_idx:i])
                idx = i
                break
        else:
            i += 1

for i, d in enumerate(dialogs):
    with open(f'd:/Pankaj/Software/client/dialog_{i}.jsx', 'w', encoding='utf-8') as f:
        f.write(d)
        print(f"Saved dialog_{i}.jsx, length: {len(d)}")
