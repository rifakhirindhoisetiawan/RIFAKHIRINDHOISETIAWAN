import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the media query block
start = content.find('@media(max-width:640px){')
if start == -1:
    print('Media query not found')
    exit(1)

# Find the end of the media query (matching braces)
brace_count = 0
i = start
while i < len(content):
    if content[i] == '{':
        brace_count += 1
    elif content[i] == '}':
        brace_count -= 1
        if brace_count == 0:
            end = i + 1
            break
    i += 1
else:
    print('End of media query not found')
    exit(1)

old_media = content[start:end]
print(f'Found media query: {len(old_media)} chars')

new_media = '''@media(max-width:640px){
      .top-wrap{display:flex;flex-direction:column;gap:16px;align-items:stretch;padding:12px}
      .top-wrap .foto-box{width:100% !important;max-width:none;aspect-ratio:9/16;border-radius:12px}
      .top-row{padding:4px 0 !important;gap:4px !important}
      .top-row > div:first-child{font-size:15px !important;min-height:40px;padding:10px 8px}
      .top-row input{font-size:16px !important;font-weight:800 !important;text-align:left !important;padding:10px 4px}
      .tab-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:12px;overflow-x:auto;-webkit-overflow-scrolling:touch}
      .tab-btn{flex:0 0 auto;min-width:72px;min-height:48px;padding:12px 16px;font-size:14px;aspect-ratio:auto}
      .tab-empty{flex:0 0 auto;width:48px;height:48px;min-height:48px;aspect-ratio:1/1}
      .foto-act{flex:0 0 auto;width:48px;height:48px;min-height:48px;aspect-ratio:1/1}
      .table-title{min-height:46px;padding:10px 0;font-size:15px}
      .bahan-add-head{width:46px;height:46px;min-height:46px}
    }'''

if old_media in content:
    content = content.replace(old_media, new_media)
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Done!')
else:
    print('Old media query not found exactly')
    print(f'Expected length: {len(old_media)}')
    print(f'Actual length: {len(old_media)}')
    print('First 200 chars of old_media:')
    print(repr(old_media[:200]))
    print('First 200 chars of content at position:')
    print(repr(content[start:start+200]))