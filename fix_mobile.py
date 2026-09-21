import re

with open('admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''@media(max-width:640px){
      .top-wrap{display:flex;flex-direction:column;gap:16px;align-items:stretch;padding:12px}
      .top-wrap .foto-box{width:100% !important;max-width:none;aspect-ratio:9/16;border-radius:12px}
      .top-row{padding:4px 0 !important;gap:4px !important}
      .top-row > div:first-child{font-size:15px !important;min-height:40px;padding:10px 8px}
      .top-row input{font-size:16px !important;font-weight:800 !important;text-align:left !important;padding:10px 4px}
      .tab-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:8px;overflow-x:auto;-webkit-overflow-scrolling:touch}
      .tab-btn{flex:0 0 auto;min-width:72px;min-height:48px;padding:12px 16px;font-size:14px;aspect-ratio:auto}
      .tab-empty{flex:0 0 auto;width:48px;height:48px;min-height:48px;aspect-ratio:1/1}
      .foto-act{min-height:48px;aspect-ratio:1/1;width:48px}
      .table-title{min-height:46px;padding:10px 0;font-size:15px}
      .bahan-add-head{width:46px;height:46px;min-height:46px}
      .tab-btn{flex:0 0 auto;min-width:72px;min-height:48px;padding:12px 16px;font-size:14px;aspect-ratio:auto}
      .tab-empty{min-height:48px;width:48px}
      .foto-act{min-height:48px;aspect-ratio:1/1;width:48px}
      .table-title{min-height:46px;padding:10px 0;font-size:15px}
      .bahan-add-head{width:46px;height:46px;min-height:46px}
      .tab-btn{flex:0 0 auto;min-width:72px;min-height:48px;padding:12px 16px;font-size:14px;aspect-ratio:auto}
      .tab-empty{min-height:48px;width:48px}
      .foto-act{min-height:48px;aspect-ratio:1/1;width:48px}
      .table-title{min-height:46px;padding:10px 0;font-size:15px}
      .bahan-add-head{width:46px;height:46px;min-height:46px}
      .top-row{padding:4px 0 !important;gap:6px !important}
      .top-row > div:first-child{min-height:44px;padding:10px 8px}
      .top-row input{padding:10px 4px}
      .foto-box{aspect-ratio:9/16;border-radius:12px}
      .tab-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:8px;overflow-x:auto;-webkit-overflow-scrolling:touch}
      .tab-btn{flex:0 0 auto;min-width:72px;min-height:48px;padding:12px 16px;font-size:14px;aspect-ratio:auto}
      .tab-empty{min-height:48px;width:48px}
      .foto-act{min-height:48px;aspect-ratio:1/1;width:48px}
      .bahan-add-head{width:46px;height:46px;min-height:46px}
      .top-row{padding:4px 0 !important;gap:6px !important}
      .top-row > div:first-child{min-height:44px;padding:10px 8px}
      .top-row input{padding:10px 4px}
      .foto-box{aspect-ratio:9/16;border-radius:12px}
      .tab-bar{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;padding:8px;overflow-x:auto;-webkit-overflow-scrolling:touch}
      .tab-btn{flex:0 0 auto;min-width:72px;min-height:48px;padding:12px 16px;font-size:14px;aspect-ratio:auto}
      .tab-empty{min-height:48px;width:48px}
      .foto-act{min-height:48px;aspect-ratio:1/1;width:48px}
      .bahan-add-head{width:46px;height:46px;min-height:46px}
      .top-row{padding:4px 0 !important;gap:6px !important}
      .top-row > div:first-child{min-height:44px;padding:10px 8px}
      .top-row input{padding:10px 4px}
    }'''

new = '''@media(max-width:640px){
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

if old in content:
    content = content.replace(old, new)
    with open('admin.html', 'w', encoding='utf-8') as f:
        f.write(content)
    print('Done')
else:
    print('Not found')
    # Find the media query
    idx = content.find('@media(max-width:640px)')
    if idx >= 0:
        print(f'Found at position {idx}')
        print(content[idx:idx+500])
    else:
        print('Media query not found')