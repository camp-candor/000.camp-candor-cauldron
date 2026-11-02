# StyleTTS-2 Custom Voice Merging Guide

_Gemini · 2 messages · exported Nov 2, 2026_

### You

i want to create a custom LLM voice using StyleTTS-2; here is the repository where i will set up the functionality [https://github.com/slopratchet/000.StyleTTS-2]

i can i set up this repository to merge two voices into one

i am looking for extensive step by step instruction on how to implement this on my machine starting with this current empty repo [https://github.com/slopratchet/000.StyleTTS-2]

### Gemini

StyleTTS 2 merges voices via **latent style space interpolation** rather than audio waveform mixing. By extracting the 128-dimensional acoustic style embedding vectors ($s \in \mathbb{R}^{128}$) from two reference takes and blending them mathematically ($s_{\text{blend}} = \alpha \cdot s_A + (1 - \alpha) \cdot s_B$), the neural vocoder synthesizes speech as a singular biological vocal tract rather than two people speaking simultaneously.

Below is the complete implementation blueprint mapped directly to your local layout at `D:\trellis\000.StyleTTS-2`.

### Step 1: Install Dependencies into `python_embeded`

Because your directory contains `python_embeded`, install all packages directly into this isolated Python environment to keep your host system clean.

1. Open **Command Prompt (`cmd.exe`)** and navigate to your repo:
  ```dos
  cd /d D:\trellis\000.StyleTTS-2
  ```
2. Verify that `python_embeded` includes `pip` (or bootstrap `get-pip.py` if missing):
  ```dos
  python_embeded\python.exe -m ensurepip --default-pip
  ```
3. Install PyTorch with CUDA support (or CPU if running without Nvidia GPU) and the core StyleTTS 2 dependencies:
  ```dos
  python_embeded\python.exe -m pip install --upgrade pip
  python_embeded\python.exe -m pip install torch torchaudio --index-url https://download.pytorch.org/whl/cu121
  python_embeded\python.exe -m pip install styletts2 librosa soundfile phonemizer monotonic_align nltk huggingface_hub
  ```
  *Verification:* Run `python_embeded\python.exe -c "import torch, styletts2; print('Torch CUDA:', torch.cuda.is_available())"`. It should return `Torch CUDA: True` (or `False` if running CPU-only) without any `ModuleNotFoundError`.
4. **Install eSpeak-NG (Windows Prerequisite):** StyleTTS 2 requires `espeak-ng` for phoneme processing on Windows.
  - Download and install the latest Windows `.msi` from the [eSpeak NG Releases](https://github.com/espeak-ng/espeak-ng/releases) or via Windows Package Manager:
    ```dos
    winget install eSpeak-NG.eSpeak-NG
    ```
  - Add `C:\Program Files\eSpeak NG` to your Windows system `PATH` and set `PHONEMIZER_ESPEAK_PATH=C:\Program Files\eSpeak NG\libespeak-ng.dll` in your environment or batch file.

### Step 2: Download Model Checkpoints

Create a `models/` directory inside your repository to store the base LibriTTS checkpoint and YAML config:

```dos
mkdir D:\trellis\000.StyleTTS-2\models
curl.exe -L -o models\epochs_2nd_00020.pth https://huggingface.co/yl4579/StyleTTS2-LibriTTS/resolve/main/epochs_2nd_00020.pth
curl.exe -L -o models\config.yml https://huggingface.co/yl4579/StyleTTS2-LibriTTS/resolve/main/config.yml
```

*Verification:* Inspect the `D:\trellis\000.StyleTTS-2\models` directory. Confirm `epochs_2nd_00020.pth` is roughly ~300 MB to 600 MB and `config.yml` is present.

### Step 3: Populate Audio References in `input/`

To blend two voices cleanly:

1. Place two reference audio files into `D:\trellis\000.StyleTTS-2\input\`:
  - `input/voice_a.wav` (e.g., vocal source for resonance/cadence)
  - `input/voice_b.wav` (e.g., vocal source for pitch/timbre)
2. Ensure both audio files are dry (no reverb, background music, or hiss), mono, and between 5 to 15 seconds in duration.

### Step 4: Create the Voice Merging Script (`scripts/merge_voices.py`)

Create a script inside `scripts/merge_voices.py` that computes the style latents of both voices, blends them using linear or spherical interpolation, saves the frozen `.pt` identity embedding, and runs an audio synthesis test.

Save the following code into `D:\trellis\000.StyleTTS-2\scripts\merge_voices.py`:

```python
import os
import sys
import torch
import soundfile as sf
from styletts2 import tts

# Set eSpeak NG path if not automatically found in PATH
if "PHONEMIZER_ESPEAK_PATH" not in os.environ:
    espeak_dll = r"C:\Program Files\eSpeak NG\libespeak-ng.dll"
    if os.path.exists(espeak_dll):
        os.environ["PHONEMIZER_ESPEAK_PATH"] = espeak_dll

REPO_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CHECKPOINT_PATH = os.path.join(REPO_DIR, "models", "epochs_2nd_00020.pth")
CONFIG_PATH = os.path.join(REPO_DIR, "models", "config.yml")

def blend_style_vectors(s1: torch.Tensor, s2: torch.Tensor, alpha: float = 0.5) -> torch.Tensor:
    """
    Interpolates two style embedding vectors.
    alpha = 1.0 -> 100% Voice A
    alpha = 0.0 -> 100% Voice B
    alpha = 0.5 -> 50/50 blend
    """
    return alpha * s1 + (1.0 - alpha) * s2

def main():
    voice_a_path = os.path.join(REPO_DIR, "input", "voice_a.wav")
    voice_b_path = os.path.join(REPO_DIR, "input", "voice_b.wav")
    output_voice_pt = os.path.join(REPO_DIR, "output", "merged_identity.pt")
    test_output_wav = os.path.join(REPO_DIR, "output", "test_blend.wav")

    os.makedirs(os.path.join(REPO_DIR, "output"), exist_ok=True)

    if not os.path.exists(voice_a_path) or not os.path.exists(voice_b_path):
        print(f"[!] Error: Missing input audio. Ensure '{voice_a_path}' and '{voice_b_path}' exist.")
        sys.exit(1)

    print("[*] Initializing StyleTTS 2...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    
    if os.path.exists(CHECKPOINT_PATH) and os.path.exists(CONFIG_PATH):
        engine = tts.StyleTTS2(model_checkpoint_path=CHECKPOINT_PATH, config_path=CONFIG_PATH)
    else:
        print("[*] Local checkpoint not found. Falling back to default download...")
        engine = tts.StyleTTS2()

    print("[*] Computing style vectors from input clips...")
    # Compute style vector for Voice A and Voice B
    s_a = engine.compute_style(voice_a_path)
    s_b = engine.compute_style(voice_b_path)

    # Blend ratio: 0.6 favors voice A, 0.4 favors voice B
    blend_ratio = 0.5
    print(f"[*] Interpolating style latent space with ratio: {blend_ratio:.2f} Voice A + {1-blend_ratio:.2f} Voice B...")
    s_merged = blend_style_vectors(s_a, s_b, alpha=blend_ratio)

    # Save frozen embedding tensor to disk for permanent zero-drift LLM synthesis
    torch.save(s_merged, output_voice_pt)
    print(f"[+] Saved merged style identity to: {output_voice_pt}")

    # Synthesize sample output using the blended vector
    sample_text = "This is a custom synthetic voice generated by blending two distinct vocal identities in StyleTTS 2."
    print(f"[*] Synthesizing test line: \"{sample_text}\"")

    audio_array = engine.inference(
        text=sample_text,
        ref_s=s_merged,
        alpha=0.3,           # Balances prosody vs timbre
        beta=0.7,            # Prosody control
        diffusion_steps=10,  # 5-10 for fast, 20-30 for maximum quality
        embedding_scale=1.0
    )

    sf.write(test_output_wav, audio_array, samplerate=24000)
    print(f"[+] Test audio successfully exported to: {test_output_wav}")

if __name__ == "__main__":
    main()
```

*Verification:* Review the script to ensure `compute_style()` returns tensors and `ref_s=s_merged` is passed directly into `engine.inference()`.

### Step 5: Configure the Batch Launcher (`run_styletts2.bat`)

Update your top-level `run_styletts2.bat` so it uses the embedded Python binary and automatically launches your blending script:

```dos
@echo off
setlocal
cd /d "%~dp0"

set "PATH=%~dp0python_embeded;%~dp0python_embeded\Scripts;C:\Program Files\eSpeak NG;%PATH%"
set "PHONEMIZER_ESPEAK_PATH=C:\Program Files\eSpeak NG\libespeak-ng.dll"

echo ========================================================
echo Running StyleTTS-2 Voice Merger
echo ========================================================

python_embeded\python.exe scripts\merge_voices.py

echo.
echo Process complete. Check output\ for your .pt and .wav files.
pause
```

*Verification:* Double-click `run_styletts2.bat`. The console window should initialize CUDA/CPU, extract the vectors, export `output\merged_identity.pt`, and output `output\test_blend.wav`.

### Step 6: Hooking the Merged Voice into an LLM Pipeline

Once `output/merged_identity.pt` is generated, you do not need to recompute the audio files on every inference turn. You can query the frozen `.pt` tensor in a lightweight serving script (e.g., connected to an Ollama or vLLM output stream):

```python
import torch
import soundfile as sf
from styletts2 import tts

engine = tts.StyleTTS2()
# Load frozen identity once
cached_style = torch.load("output/merged_identity.pt")

def stream_llm_sentence(text_chunk: str, output_filepath: str):
    audio = engine.inference(
        text=text_chunk,
        ref_s=cached_style,
        diffusion_steps=5,  # Low diffusion steps for low-latency streaming
        alpha=0.3,
        beta=0.7
    )
    sf.write(output_filepath, audio, samplerate=24000)
```

If you run into issues or want to refine the voice architecture:
