import re

with open('data/directive/day-002/020.phase-two.jules.md', 'r') as f:
    content = f.read()

file2_match = re.search(r'#### File 2: `apps/995.library/test/choice.buzz.test.ts`\s*```typescript\n(.*?)\n```', content, re.DOTALL)
if file2_match:
    with open('test_add.txt', 'w') as f:
        f.write(file2_match.group(1))
