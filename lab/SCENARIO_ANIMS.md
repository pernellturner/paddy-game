# Combat Lab — Scenario sheets still needed

Paddy's approved look does not change. Match `src/s4.png`: cream face, brown only around the blue eyes, white blaze, muzzle, chest and mitts, fawn body, chocolate ears and tail. He faces RIGHT. Flat magenta `#FF00FF`. No text, shadows, ground line, or second character.

The Combat Lab plays today. Every move below is a **stand-in** made from sheets that are already approved. Do not redraw those. Send only the missing sheets, one `.jpg` per move, and they can drop into the lab without a new combat engine.

Drop folder: `generated/paddy_lab/<move>.jpg`

Shared rules (same cutter as the punch strings):

- One horizontal row, even gaps, full body, same scale on every frame.
- Feet on one baseline, except the air sheets. Air sheets share one jump height instead: the lowest foot is the same distance off the bottom of the frame in the first and last pose.
- 12 fps. Frame 1 and the last frame are the **same guard pose**, so any move can chain into any other. Ground guard = the approved peek-a-boo. Air guard = a tucked jump with both paws up by the cheeks.
- Impact is frames 4 and 5 (1-based: the 4th and 5th pictures). The arm is fully out. Frame 6 is the arm coming home. The game cancels into the next move at the end of frame 6.

## Already approved — do not replace

- Jab, slipping jab, cross, left hook, body shot, recovery (`generated/paddy_strings/`)
- Power jab, power hook, power body, power uppercut (`generated/paddy_power/`)
- The boxer uppercut coil, drive, and extension used by the Practice Room NEW uppercut
- Idle, walk, run, jump, fall, land, crouch, hurt

## Please generate these

6 frames each unless noted. Name the file exactly as written.

### Air chain (the lab loops these)

| File | What Paddy is doing |
|---|---|
| `air_jab.jpg` | In the air guard. Lead paw snaps straight out at chest height. Other paw stays by the cheek. Slight forward lean. Back to the air guard. |
| `air_cross.jpg` | Rear paw drives across the body in a straight line, hip turning, lead paw back at the cheek. A bit more reach than the jab. Back to the air guard. |
| `air_hook.jpg` | Lead elbow comes through in a short horizontal hook. Rear paw covers the cheek. Body rotates, then unwinds to the air guard. |
| `air_upper.jpg` | From the air guard he tucks, then the rear paw rips straight up past his ear. The other paw stays tight. He is still in the air at the end, back in the air guard. This is the launcher. |

### Ground moves that currently borrow a punch pose

| File | Frames | What Paddy is doing |
|---|---|---|
| `slip.jpg` | 4 | A short lean back onto the rear foot, lead paw still up, head off the centre line, then back to peek-a-boo. He does not turn around. |
| `weave.jpg` | 4 | A bob under an incoming punch: knees bend, head slips to his left, both paws stay up, then he rises to peek-a-boo. |
| `dodge.jpg` | 4 | A fast step straight back, paws up, weight on the rear foot, a little blur on the trailing foot. Ends in peek-a-boo. |
| `dash.jpg` | 4 | A low sprint step toward screen-right, rear leg driving, paws up in guard, not a punch. |
| `dash_cross.jpg` | 6 | The dash pose, then the approved cross fully extended, then peek-a-boo. Feet stay sliding forward. |
| `dash_upper.jpg` | 6 | Still sliding forward with feet on the baseline. He dips and drives the rear paw straight up, the same shape as the approved uppercut, then peek-a-boo. He does not leave the ground. |
| `slide.jpg` | 4 | Low to the floor, one leg trailing, paws guarding the face, moving screen-right. |
| `slide_sweep.jpg` | 6 | Out of the slide, a low rear-paw sweep along the ground, then he pops back up to peek-a-boo. |
| `ground_pound.jpg` | 6 | In the air, both paws cocked overhead, then he drops and both paws hit the floor in front of his feet. Dust at the impact frame. Last frame is a low crouch, not the air guard. |

## How a finished sheet is checked

- One Paddy, one size, no sword, no extra legs, no melted paws.
- The impact picture reads at a glance: jab is straight, hook is around, uppercut is up, pound is down.
- Frame 1 matches the last frame, so a jab can cancel into a cross without a pop.
- Air frames keep the same jump height, or the chain will look like he is falling and jumping at once.

When a sheet is approved it replaces the stand-in for that one move. The other moves stay on the art they already use.
