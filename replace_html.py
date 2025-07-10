PATH = "backend/static/index.html"

with open(PATH, "r") as f:
    content = f.read()

modify_content = content.replace('/assets', '/static/assets')

with open(PATH, 'w') as f:
    f.write(modify_content)