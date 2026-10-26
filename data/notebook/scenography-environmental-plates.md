# Wiregrass Basin: Scenography & Environmental Plates Ledger

Treating the Wiregrass Basin as the "62nd Character"—establishing visual consistency, material palettes, lighting setups, and diffusion prompt matrices across recurring sets.

---

## 1. Billie Fae’s Bail-Bonds Office (Interior Set)

### Atmosphere & Lighting
* **Illumination:** Flickering 4200K fluorescent tubes housed behind brittle, yellowed prismatic acrylic diffusers. Raking morning sunlight cutting through warped horizontal mini-blinds, illuminating suspended tobacco smoke, stale paper fiber, and heavy dust motes.
* **Color Temperature:** Sickly institutional greenish-yellow mixed with warm tungsten spill from a lone banker's lamp.

### Material & Surface Palettes
* **Surfaces:** Water-stained acoustical drop-ceiling tiles sagging under Florida summer humidity; cracked faux-wood composite desktop swollen along laminate seams; commercial linoleum tiles with decades of ground-in red clay dirt and peeling yellow floor wax.
* **Hero Props & Set Dressing:** Heavy cast-iron manual date stamp; cracked vinyl desk chair leaking foam; overflowing amber glass ashtray; landline rotary phone with sun-faded casing; industrial box fan oscillating at low RPM.

### Diffusion Prompt Matrix
* **Positive Prompt Tokens:**
  `interior 1980s southern bail bonds office, water-damaged acoustic ceiling tiles, yellowed fluorescent light fixtures, heavy dust motes in raking sunlight, tobacco smoke haze, chipped commercial linoleum flooring, swollen wood veneer desk, vintage rotary desk phone, heavy iron date stamp, claustrophobic atmosphere, anamorphic 35mm lens, gritty textured realism, muted desaturated color palette`
* **Negative Prompt Tokens:**
  `modern office, sleek, clean, LED lighting, minimalist, pristine drywall, high-tech, digital displays, vibrant bright colors, 3d render gloss`

---

## 2. Adince Louvin’s "The Crucible" Substation (Exterior / Semi-Enclosed)

### Atmosphere & Lighting
* **Illumination:** Oppressive 12:00 PM Southern sun diffracted through heavy sulfur-bearing humidity; zero rim lighting; harsh vertical downlight producing pitch-black cast shadows under industrial eaves and catwalks.
* **Atmospheric Pressure:** Dense heat distortion ripples over sun-baked metal; visible micro-particulates from dried biometric swamp sludge and pulverized lime rock.

### Material & Surface Palettes
* **Surfaces:** Pitted reinforced concrete spalling with exposed, rusted iron rebar; creosote-soaked timber foundation pilings weeping black tar; corrugated tin roofing oxidized to deep umber and orange-brown rust.
* **Industrial Biometrics:** Heavy copper transformer busbars covered in powdery turquoise verdigris; black water seep crawling up concrete footers; parasitic wiregrass and swamp vines penetrating decommissioned electrical junction boxes.

### Diffusion Prompt Matrix
* **Positive Prompt Tokens:**
  `abandoned heavy industrial electrical substation, deep southern wetland pine flatwoods, brutalist concrete foundation with spalling and exposed rusted rebar, corrugated tin shed siding, heavy copper busbars with green verdigris patina, encroaching saw palmetto and wiregrass, blinding high-noon overhead sun, heat shimmer, oppressive humidity haze, deep hard shadows, cinematic framing, 50mm lens`
* **Negative Prompt Tokens:**
  `cyberpunk city, neon lighting, clean industrial facility, shiny polished steel, futuristic sci-fi architecture, temperate autumn forest, blue sky without haze`

---

## 3. The Basin Rail Corridors & Stagnant Sloughs (Exterior Liminal)

### Atmosphere & Lighting
* **Illumination:** Bruised violet-slate overcast sky immediately preceding a severe convective thunderstorm; low-diffuse ambient daylight that turns brackish water into dark mirrors.
* **Atmospheric Pressure:** Saturated humidity approaching 100%; visible mist rising from black water bogs; absolute static stillness before high wind.

### Material & Surface Palettes
* **Flora & Earth:** Longleaf slash pines charred black near their bases from past controlled burn fires; dense mats of saw palmetto; dark peat muck; oil-slicked rainbow sheen floating over stagnant standing swamp water.
* **Infrastructure Decay:** Abandoned dual-gauge railroad spurs; rotted oak railway ties half-submerged in swamp moss; bent, pitted iron rails sinking into mud.

### Diffusion Prompt Matrix
* **Positive Prompt Tokens:**
  `abandoned railroad tracks cutting through deep wiregrass swamp slough, rusted iron rails sinking into dark peat bog, charred longleaf pine trunks, dense saw palmetto thickets, stagnant blackwater pool with iridescent oil sheen, bruised purple-gray thunderstorm clouds, diffuse atmospheric gloom, heavy humidity mist, cinematic wide angle, photographic texture`
* **Negative Prompt Tokens:**
  `sunny meadow, crystal clear river, alpine landscape, dry soil, bright saturated foliage, pristine tracks, modern trains`

---

## 4. Neon Decay Commercial Strips (Night Exterior)

### Atmosphere & Lighting
* **Illumination:** Solitary high-pressure sodium vapor pole lamps casting deep monochromatic amber pools; broken double-tube neon signage buzzing with erratic lime-green and pale vermilion flickers; darkness broken only by wet asphalt reflections.
* **Atmospheric Depth:** Heavy night fog mixed with diesel exhaust; moist air haloing light sources.

### Material & Surface Palettes
* **Surfaces:** Potholed asphalt with pools of standing rainwater; concrete cinderblock exterior walls stained with mildew and algae; rusted chain-link fencing choked by invasive kudzu vines.

### Diffusion Prompt Matrix
* **Positive Prompt Tokens:**
  `rural southern highway crossroads at night, solitary high-pressure sodium street lamp, deep amber pool of light, flickering fractured neon sign casting sickly green light, rain-slick cracked asphalt, standing puddle reflections, tangled overhead electrical cables, kudzu covering chain-link fence, gritty cinematic Southern biopunk noir, anamorphic lens flare`
* **Negative Prompt Tokens:**
  `dense city skyline, futuristic cyberpunk skyscrapers, dry pavement, clean suburban street, bright daylight`

---

## 5. Plate Generation & Seed Anchoring Protocol

To prevent spatial drift across multiple shots in the same scene:
1. **Empty Plate Priming:** Generate high-resolution master environmental plates (2048x1152) prior to character insertion.
2. **Seed Locking:** Lock seed baselines per location camera angle (e.g., `OFFICE_REVERSE_DESK_SEED_01`, `CRUCIBLE_CATWALK_WIDE_SEED_04`).
3. **ControlNet Depth/Normal Extraction:** Extract depth and normal passes directly from the master plate to anchor characters into physical geometry without warped perspective.
