import re

with open("../youtube_channel_manager_gemini.jsx", "r", encoding="utf-8") as f:
    content = f.read()

# Replace background colors
content = re.sub(r'bg-zinc-950', 'bg-anthropic-light', content)
content = re.sub(r'bg-zinc-900/60', 'bg-white shadow-sm', content)
content = re.sub(r'bg-zinc-900/95', 'bg-white/95', content)
content = re.sub(r'bg-zinc-800/40', 'bg-anthropic-light-gray/50', content)
content = re.sub(r'bg-zinc-800/60', 'bg-anthropic-light-gray/70', content)
content = re.sub(r'bg-zinc-800', 'bg-anthropic-light-gray', content)
content = re.sub(r'bg-zinc-700/50', 'bg-anthropic-mid-gray/20', content)
content = re.sub(r'bg-zinc-700', 'bg-anthropic-mid-gray/30', content)

# Replace text colors
content = re.sub(r'text-zinc-100', 'text-anthropic-dark font-heading font-medium', content)
content = re.sub(r'text-zinc-200', 'text-anthropic-dark', content)
content = re.sub(r'text-zinc-300', 'text-anthropic-dark/80', content)
content = re.sub(r'text-zinc-400', 'text-anthropic-mid-gray', content)
content = re.sub(r'text-zinc-500', 'text-anthropic-mid-gray', content)
content = re.sub(r'text-zinc-600', 'text-anthropic-mid-gray', content)
content = re.sub(r'text-white', 'text-white', content) # some buttons might still need white text if they have dark backgrounds

# Replace borders
content = re.sub(r'border-zinc-800/60', 'border-anthropic-light-gray', content)
content = re.sub(r'border-zinc-800/40', 'border-anthropic-light-gray', content)
content = re.sub(r'border-zinc-800', 'border-anthropic-light-gray', content)
content = re.sub(r'border-zinc-700/40', 'border-anthropic-light-gray', content)
content = re.sub(r'border-zinc-700/30', 'border-anthropic-light-gray', content)
content = re.sub(r'border-zinc-700/20', 'border-anthropic-light-gray', content)
content = re.sub(r'border-zinc-600/50', 'border-anthropic-mid-gray/50', content)
content = re.sub(r'border-zinc-500', 'border-anthropic-mid-gray', content)
content = re.sub(r'border-zinc-400', 'border-anthropic-dark/50', content)

# Replace Accent colors (Buttons)
content = re.sub(r'bg-red-800 hover:bg-red-700', 'bg-anthropic-orange hover:bg-anthropic-orange/90 text-white', content)
content = re.sub(r'bg-violet-700 hover:bg-violet-600', 'bg-anthropic-blue hover:bg-anthropic-blue/90 text-white', content)
content = re.sub(r'bg-amber-700 hover:bg-amber-600', 'bg-anthropic-green hover:bg-anthropic-green/90 text-white', content)
content = re.sub(r'bg-emerald-700 hover:bg-emerald-600', 'bg-anthropic-green hover:bg-anthropic-green/90 text-white', content)
content = re.sub(r'border-red-600', 'border-anthropic-orange', content)

# Map dynamic badge colors
content = re.sub(r'text-emerald-400 bg-emerald-900/30 border-emerald-700/40', 'text-anthropic-green bg-anthropic-green/10 border-anthropic-green/20', content)
content = re.sub(r'text-sky-400 bg-sky-900/30 border-sky-700/40', 'text-anthropic-blue bg-anthropic-blue/10 border-anthropic-blue/20', content)
content = re.sub(r'text-amber-400 bg-amber-900/30 border-amber-700/40', 'text-anthropic-orange bg-anthropic-orange/10 border-anthropic-orange/20', content)
content = re.sub(r'text-violet-400 bg-violet-900/30 border-violet-700/40', 'text-anthropic-blue bg-anthropic-blue/10 border-anthropic-blue/20', content)
content = re.sub(r'text-orange-400 bg-orange-900/30 border-orange-700/40', 'text-anthropic-orange bg-anthropic-orange/10 border-anthropic-orange/20', content)
content = re.sub(r'text-red-400 bg-red-900/30 border-red-700/40', 'text-red-600 bg-red-50 border-red-200', content)

# Tip config
content = re.sub(r'bg-emerald-900/20 border-emerald-800/40 text-emerald-300', 'bg-anthropic-green/10 border-anthropic-green/30 text-anthropic-green', content)
content = re.sub(r'bg-amber-900/20 border-amber-800/40 text-amber-300', 'bg-anthropic-orange/10 border-anthropic-orange/30 text-anthropic-orange', content)
content = re.sub(r'bg-zinc-800/20 border-zinc-700/40 text-zinc-500', 'bg-anthropic-light-gray border-anthropic-mid-gray/30 text-anthropic-mid-gray', content)

# Banner
content = re.sub(r'border-emerald-800/50 bg-emerald-900/10', 'border-anthropic-green/30 bg-anthropic-green/5', content)
content = re.sub(r'border-amber-800/50 bg-amber-900/10', 'border-anthropic-orange/30 bg-anthropic-orange/5', content)

# Copy Btn
content = re.sub(r'bg-emerald-900/50 border-emerald-700/50 text-emerald-300', 'bg-anthropic-green text-white border-anthropic-green', content)
content = re.sub(r'bg-zinc-800/70 border-zinc-700/50 text-zinc-400 hover:text-white hover:bg-zinc-700/60', 'bg-white border-anthropic-light-gray text-anthropic-mid-gray hover:text-anthropic-dark hover:bg-anthropic-light', content)

# HashTag
content = re.sub(r'bg-amber-900/30 text-amber-300 border-amber-800/40', 'bg-anthropic-orange/10 text-anthropic-orange border-anthropic-orange/20', content)
content = re.sub(r'bg-violet-900/30 text-violet-300 border-violet-800/40', 'bg-anthropic-blue/10 text-anthropic-blue border-anthropic-blue/20', content)
content = re.sub(r'bg-sky-900/30 text-sky-300 border-sky-800/40', 'bg-anthropic-blue/10 text-anthropic-blue border-anthropic-blue/20', content)

# Other remaining colors
content = re.sub(r'text-emerald-400', 'text-anthropic-green', content)
content = re.sub(r'text-amber-400', 'text-anthropic-orange', content)
content = re.sub(r'text-amber-400/80', 'text-anthropic-orange/80', content)
content = re.sub(r'bg-zinc-900/40', 'bg-white/80', content)

# Font family inline styles
content = re.sub(r'style=\{\{\s*fontFamily:"\'Noto Sans KR\',\'Apple SD Gothic Neo\',sans-serif"\s*\}\}', '', content)

with open("src/App.jsx", "w", encoding="utf-8") as f:
    f.write(content)
