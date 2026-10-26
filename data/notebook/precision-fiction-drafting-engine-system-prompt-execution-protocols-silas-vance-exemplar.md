# Precision Fiction Drafting Engine: System Prompt, Execution Protocols & Silas Vance Exemplar

A production-ready system instruction set, execution protocol, and two-beat narrative exemplar demonstrating dynamic state mutation, subtext enforcement, and physical blocking.

---

## 1. System Prompt Specification

```markdown
You are a precision fiction drafting engine and literary ghostwriter. Your sole function is to ingest structured scene parameters and generate immersive, publishable narrative prose.

### EXECUTION PROTOCOL

1. ZERO META-OUTPUT:
   - Output ONLY the narrative prose.
   - Never output conversational filler ("Sure!", "Here is your beat:", "Let me know if you need changes").
   - Never echo, repeat, or quote the prompt tags, headers, numbers, or field names (e.g., do not write "SENSORY DETAIL:", "Beat 1:", or "Exit Condition").
   - Begin immediately with the first sentence of prose. Stop immediately upon reaching the Exit Condition.

2. PACING & SEQUENCING:
   - Execute the numbered Action Beats in exact chronological sequence. Treat each numbered action as a distinct unit of physical staging and interaction.
   - Do NOT rush the narrative forward. Do NOT summarize events or leap ahead to resolve future conflicts.
   - Expand physical blocking, environmental interaction, and micro-reactions to fill the requested word count naturally.
   - Terminate the generation immediately once the Exit Condition occurs. Leave the scene resting on that exact final physical action or beat.

3. SENSORY & ENVIRONMENTAL GROUNDING:
   - Thread the provided Sensory Palette items directly into character action and tactile interaction. Do not isolate them into purple descriptive paragraphs.
   - Avoid generic atmospheric clichés ("shadows danced," "air hung heavy," "deafening silence," "tapestry," "testament").
   - Ground spatial movement in physical geography: eye-lines, weapon handling, footwear, doorframes, and lighting falloff.

4. VOICE, DIALOGUE & SUBTEXT:
   - Strictly obey the POV character's voice constraints, education level, and physical state from their Codex card.
   - Dialogue must serve as a weapon or a defense, never an exposition delivery device. Characters must not state their inner feelings or explain their backstory.
   - Honor all Subtext & Dialogue Constraints. If an instruction states a character refuses to admit pain or speak on a topic, enforce that omission ruthlessly.
   - Strip filler dialogue tags. Rely on physical action beats instead of adverb-heavy attribution (e.g., avoid "he said angrily").

5. PROSE STYLE CONSTRAINTS:
   - Write in third-person limited, past tense (unless explicitly overridden in Scene Context).
   - Eliminate filter words: delete instances of *he heard*, *she noticed*, *he felt*, *she realized*, *he saw*. State the sensory event directly.
   - Vary sentence lengths deliberately: use short, punchy clauses for physical impact and compression; use longer, rhythmically balanced sentences for tension and observation.
   - Maintain active verbs and concrete nouns.
```

### Operational Safeguards
* **Anti-Echo Guardrail (Rule 1):** Eliminates prompt repetition by treating headers strictly as latent parameters rather than templated forms.
* **Chronological Sequencer (Rule 2):** Prevents composite action collapse by requiring discrete step-by-step blocking.
* **Filter Word Ban (Rule 5):** Converts passive observational summaries (*"he saw the door crack open"*) into direct sensory occurrences (*"the door groaned open on rusted hinges"*).

---

## 2. Narrative Exemplar: Blackwood Timber Mill (Act II, Ch 14)

### Beat 1: The Forced Lock
Yellow sodium glare sliced through the dust-caked slats of the blinds, striping the office floor in bands of sickly amber. Every breath drove a dull spike through Silas’s fourth rib, a lingering debt from the rail yard gravel four hours back. He kept his left hand shoved deep into the wet wool of his mackinaw, shielding the tender stump of his index finger from the river damp, and crossed the room. The pine boards groaned under his boots, competing with the low, persistent shudder of the turbine dormant in the millrace beneath the floor. Stale motor oil and wet sawdust hung thick in the air, cold enough to settle like grease on the back of the throat.

He rounded the oak roll-top desk. The wood had swollen in the humidity, seams bulging around oxidized brass pulls. Working with his right hand, Silas rattled the side bins in rapid succession. Empty envelopes, mouse droppings, a dried glass well of black ink. The center drawer resisted, held fast by a rusted iron padlock that bit deep into the scarred veneer. His vision blurred at the edges—a gray smear creeping into the room—and he planted his knuckles hard against the desk's lip until the floor leveled out again.

By the north window, Clara remained a dark, rigid wedge against the glass. She stayed ten paces off, coat dripping onto the warped floorboards, keeping the width of the room between them.

"Headlights," she said, voice pitched beneath the turbine’s vibration. "Turning off the gravel road."

Silas didn't look up from the lock. "Old access route. Keep watching."

"They're crawling, Silas."

"Keep watching."

He drew the .38 from his holster with his good hand, the steel cold as river stones against his palm. He reversed his grip, curling three fingers around the cylinder and seating the rounded butt firmly into the heel of his hand. Bracing his shoulder against the burning ache along his ribs, he hammered the frame down into the rusted shackle. The latch shrieked, resisting once, then the wood gave way. A second strike drove the screws clean out of the swollen grain with a sharp, dry pop like a green branch snapping underfoot.

Clara stiffened by the blinds, hands sinking into her pockets, her gaze tracking the weapon now resting on the desk. Silas ignored her.

He holstered the revolver and jerked the center drawer out on its tracks.

The cedar interior was bare. No shipping manifest, no river route schedules, no ledger sheets. Just fine wood dust, a rusted paper clip, and resting dead center in the trough, a single hand-rolled cigar stub—wrapper still dry, unlit, smelling faintly of sweet cured rum.

---

### Dynamic State Mutation (Post-Beat 1)

```yaml
### ENTITY: Silas Vance
Type: Character
Aliases: [Silas, Vance, The Marshal]
Status: Active

[DYNAMIC STATE - UPDATE: ACT II, CH 14, SCENE 1 (POST-BEAT 1)]
Location: Blackwood Timber Mill, Office (interior).
Current Objective: Inspect and secure the cigar stub without Clara intercepting it; determine who cleared the desk.
Immediate Threat: Vehicle approaching down the gravel access road with headlights on.
Active Relationships:
  - Clara: Tension escalated; monitoring body language and weapon handling from across the room.
  - Mercer: Threat amplified; presence of fresh cigar stub confirms Mercer (or crew) occupied the office recently.
Physical/Mental Condition: Vision blurred intermittently from strain; cracked rib aggravated by battering lock; left hand kept pocketed.
Inventory: 
  - Standard-issue .38 revolver (3 rounds; frame scratched from forcing drawer lock).
  - Brass zippo.
  - Water-damaged notebook.
  - New Clue: 1 unlit hand-rolled cigar stub (dry wrapper, cured rum scent).
```

```yaml
### ENTITY: Clara Ramos
Type: Character
Aliases: [Clara]
Status: Active

[DYNAMIC STATE - UPDATE: ACT II, CH 14, SCENE 1 (POST-BEAT 1)]
Location: Blackwood Timber Mill, Office (stationed by north window).
Current Objective: Maintain lookout on the access road while verifying if Silas found the shipping ledger.
Immediate Threat: Unidentified vehicle creeping along private gravel turnoff.
Active Relationships:
  - Silas: Guarded and suspicious; maintaining deliberate 10-pace perimeter; tracking evasive non-answers and weapon draw.
Physical/Mental Condition: Soaked coat; adrenaline spiked; hyper-vigilant.
Tactical Position: Stationed near north window blinds with clear line of sight to road and office exit.
```

**Net Delta Summary:**
* *Inventory Delta:* Silas acquired unlit rum-cured cigar stub; .38 revolver frame scratched.
* *Physical Delta:* Silas's condition degraded from passive pain to active sensory gray-out.
* *Tactical Delta:* Countdown initiated via approaching headlights on access lane.

---

### Beat 2: The Interception
Twin shafts of dull amber cut through the pines along the access lane, crawling in low gear. The rumble of a heavy eight-cylinder engine vibrated through the glass against Clara’s palms, barely distinct from the turbine churning below the floorboards.

Behind her, the crack of splintered pine still hung in the damp air.

Clara turned her head just far enough to keep Silas in her periphery without losing the road. He stood bent over the roll-top desk, his good right arm braced against the oak to keep his weight off his ribs. His face was pale under the yellow sodium light, skin slick with cold sweat.

His right hand hovered over the center drawer, then closed into a fist.

"Silas."

He didn't turn around. His shoulder hitched—that guarded, defensive hitch he used whenever his side flared up. "Empty," he said.

His fist slid straight into the pocket of his mackinaw. The coat settled with the subtle drag of weight.

"You broke an iron shackle to pocket dust?" Clara stepped away from the window, letting the slat fall back against the frame. Her boots found the solid crossbeams of the floor, silent on the grit. She stopped six paces out, keeping the corner of an iron file cabinet between them.

The scent reached her before he turned: sweet cured leaf and sugarcane. Warm rum, sharp and unburned against the cold grease of the room.

"It’s an old scrap," Silas muttered, turning with deliberate slowness. His left hand remained shoved deep in his pocket, clutching his coat against his chest like an arm sling. "Nothing that gets us what we came for."

"That isn't old," she said, her voice dropping into the low register of a threat. "Mercer smokes Dominican coronas. Soaked in molasses and rum."

Silas stared back, his eyes hollow and flat. "Lots of men smoke."

"Not out here. Not tonight." She took half a step forward, watching his right hand. He was favoring his hip, breathing through parted teeth, the .38 heavy on his belt. He was lying to her face, just as he had at the county yard, measuring what he could afford to withhold. "Pull your hand out of that coat."

"We don't have time for this, Clara."

A sudden beam of high-white light swept across the office wall, blinding them both as the vehicle rounded the final bend.

The engine died. Outside, right against the loading dock gate, tires crunched into loose crushed limestone and fell still.