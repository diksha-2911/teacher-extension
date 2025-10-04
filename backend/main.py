from fastapi import FastAPI
from pydantic import BaseModel
import os
import re
from mcp.client.streamable_http import streamablehttp_client
from mcp import ClientSession

app = FastAPI()


TOOLS = {
    "list_files": {
        "tool": "obsidian_list_files_in_dir",
        "args": ["dirpath"]
    },
    "append_content": {
        "tool": "obsidian_append_content",
        "args": ["filepath", "content"]
    },
    "simple_search": {
        "tool": "obsidian_simple_search",
        "args": ["query"]
    },
    "get_file_contents": {
        "tool": "obsidian_get_file_contents",
        "args": ["filepath"]
    },
}

def parse_query(query: str):
    q = query.lower()

    # 1. append content
    if "append" in q or "add to" in q:
        # crude extraction: everything after "to <file>"
        m = re.search(r'to (\S+)', q)
        filepath = m.group(1) if m else "unknown.md"
        content = re.sub(r'.*append (.*) to .*', r'\1', q)
        return TOOLS["append_content"]["tool"], {"filepath": filepath, "content": content}

    # 2. simple search
    if "search" in q or "find" in q:
        m = re.search(r'for (.*)', q)
        search_query = m.group(1) if m else q
        return TOOLS["simple_search"]["tool"], {"query": search_query}

    # 3. get file contents
    if "show" in q or "read" in q or "open" in q or "get" in q:
        m = re.search(r'file (\S+)', q)
        filepath = m.group(1) if m else "unknown.md"
        return TOOLS["get_file_contents"]["tool"], {"filepath": filepath}

    # fallback
    return None, {}


class Message(BaseModel):
    text: str

@app.get("/ping")
def ping():
    return {"status": "ok"}

@app.post("/process")
async def process(data: Message):
    await main(data.text)
    return {"reply": f"A note was succesfully made to Teacher.md"}



async def main(text):
    async with streamablehttp_client(os.getenv("MCP_HOST")) as (
        read_stream,
        write_stream,
        _,
    ):
        async with ClientSession(read_stream, write_stream) as session:
            await session.initialize()
            tool, args = parse_query(f"Add to Teacher.md  {text}")
            print(tool,args)
            print(type(tool), type(args))
            result = await session.call_tool(tool, args)
            print(result.content[0].text)

