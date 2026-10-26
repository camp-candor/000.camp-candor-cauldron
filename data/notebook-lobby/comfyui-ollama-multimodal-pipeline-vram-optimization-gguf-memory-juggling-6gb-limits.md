# ComfyUI & Ollama Multimodal Pipeline: VRAM Optimization & GGUF Memory Juggling (6GB Limits)

An engineering guide to building automated, multimodal generative production pipelines in ComfyUI, managing limited GPU memory (6GB VRAM / RTX 2060), and choreographing sequential LLM model swapping.

---

## 1. Architectural Role: ComfyUI vs. Novelcrafter

ComfyUI is not a word processor for long-form narrative manuscripts; managing a 90,000-word book inside a node canvas becomes an unmaintainable web of string boxes without chapter histories or WYSIWYG editing.

* **Novelcrafter + Ollama:** Dedicated long-form prose authoring, dynamic Codex entity tracking, chapter checkpoints, and script formatting.
* **ComfyUI + Ollama / GGUF:** Multimodal virtual production engines where an initial text prompt or scene beat programmatically drives downstream generative assets:
  ```
  [ Input Micro-Beat ]
           │
           ▼
  [ Ollama / GGUF Prose Drafter ]
           │
           ├──► [ Text Extraction Node ] ──► [ CLIP Text Encode ] ──► [ Latent Diffusion / Video (Wan/SDXL) ]
           │
           └──► [ Spoken Dialogue Parse ] ──► [ Local TTS Node (Parler/ChatTTS) ] ──► [ Scene Audio .wav ]
  ```

---

## 2. The 6GB VRAM Bottleneck: Ollama Collision vs. Native ComfyUI Juggling

ComfyUI cannot control memory allocation for background services like Ollama. If an Ollama instance reserves 5GB for a 9B/14B model while ComfyUI attempts an image/video diffusion pass on a 6GB card (e.g., RTX 2060), the pipeline crashes with an Out-of-Memory (OOM) error.

### Technique 1: CPU Offloading (The Ollama Standalone Method)
Ollama (built on `llama.cpp`) automatically spills model layers into System RAM when VRAM is exceeded:
* **8B–9B Models (e.g., Llama 3 8B, Gemma 2 9B at Q4_K_M):** Require ~4.5GB–5.5GB, fitting entirely in 6GB VRAM for high-speed generation.
* **14B Models (e.g., Qwen 2.5 14B at Q4):** Require ~9GB. Ollama places ~6GB in VRAM and 3GB into System RAM; generation functions but token speed drops significantly due to CPU bus transfer.
* **32B+ Models:** Spills ~80% into System RAM, resulting in generation speeds of 1–2 tokens/sec.

### Technique 2: ComfyUI-Native GGUF Loading & Turn-Based VRAM Eviction
To run text generation and visual diffusion in a unified pipeline on a 6GB card, **shut off the Ollama background server** and load `.gguf` weights directly inside ComfyUI:
1. **ComfyUI-GGUF / ComfyUI-Llama-cpp Integration:** Load quantized `.gguf` files (Q4_K_M or Q3_K_M) stored in `ComfyUI/models/LLM`.
2. **Sequential Turn-Based Memory Eviction:**
   * Node 1: Loads Model A (Gemma 9B Q4 planner, ~5GB VRAM).
   * Node 2: Generates the 4-beat tactical outline.
   * *Automatic VRAM Eviction:* ComfyUI unloads Model A to System RAM/disk as soon as downstream execution begins.
   * Node 3: Loads Model B (Qwen 2.5 14B Q3 drafter, ~5GB VRAM) into the vacated GPU memory.
   * Node 4: Generates the close third-person prose.
   * *Final Eviction:* ComfyUI flushes Model B from VRAM, leaving full capacity available for diffusion image models (Flux, SDXL, Wan).

---

## 3. Designing a Sequential Multi-LLM Graph in ComfyUI

Data dependencies enforce VRAM eviction. Because ComfyUI executes nodes strictly when inputs are satisfied, wiring Model B to depend on Model A's output guarantees zero GPU memory collision:

```
[ LlamaCpp Loader: Gemma 2 9B Q4 ] ──┐
                                     ▼
[ Primitive String: Planner Prompt ] ─► [ LlamaCpp Text Generator ]
                                                   │
                                                   ▼
[ Primitive: Drafter Style Rules ] ──► [ Text Concatenate Node ]
                                                   │
[ LlamaCpp Loader: Qwen 2.5 14B Q3 ] ──────────────┼──► [ LlamaCpp Text Generator ]
                                                   │                 │
                                                   ▼                 ▼
                                            [ Show Text ]     [ Image / TTS Pipeline ]
```

1. **Planner Stage (Gemma 9B):** Generates structured blocking and numbered action steps.
2. **Text Concatenation:** Merges Gemma's output string with style instructions (e.g., *"Take the preceding outline and write close third-person prose, eliminate filter verbs"*).
3. **Drafter Stage (Qwen 14B):** Executes prose expansion once Gemma's output arrives, triggering GPU memory reallocation without manual scripting.
